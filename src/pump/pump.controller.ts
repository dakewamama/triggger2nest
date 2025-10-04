import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PumpService } from './pump.service';
import { PumpDirectService } from './pump-direct.service';
import { PumpIdlService } from './pump-idl.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { BuyTokenDto } from './dto/buy-token.dto';
import { SellTokenDto } from './dto/sell-token.dto';
import { Connection, Transaction, sendAndConfirmRawTransaction } from '@solana/web3.js';
import { ConfigService } from '@nestjs/config';

@Controller('pump')
export class PumpController {
  private readonly logger = new Logger(PumpController.name);
  private connection: Connection;

  constructor(
    private readonly pumpService: PumpService,
    private readonly pumpDirectService: PumpDirectService,
    private readonly pumpIdlService: PumpIdlService,
    private readonly configService: ConfigService,
  ) {
    const rpcUrl = this.configService.get('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.logger.log(`Connected to RPC: ${rpcUrl}`);
  }

  @Get('health')
  async healthCheck() {
    return this.pumpService.healthCheck();
  }

  @Post('create-token')
  @UseInterceptors(FileInterceptor('image'))
  async createToken(
    @Body() createTokenDto: CreateTokenDto,
    @UploadedFile() file?: any,
  ) {
    return this.pumpService.createToken(createTokenDto, file);
  }

  @Post('buy-token')
  async buyToken(@Body() buyTokenDto: BuyTokenDto & { simulate?: boolean }) {
    try {
      const result = await this.pumpService.buyToken(buyTokenDto);
      this.logger.log(`Buy token: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      return result;
    } catch (error) {
      this.logger.error('Buy token error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  @Post('sell-token')
  async sellToken(@Body() sellTokenDto: SellTokenDto & { simulate?: boolean }) {
    try {
      const result = await this.pumpService.sellToken(sellTokenDto);
      this.logger.log(`Sell token: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      return result;
    } catch (error) {
      this.logger.error('Sell token error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  @Post('simulate')
  async simulateTransaction(@Body() body: { transaction: string }) {
    return this.pumpService.simulateTransaction(body.transaction);
  }

  @Get('token-info/:mintAddress')
  async getTokenInfo(@Param('mintAddress') mintAddress: string) {
    return this.pumpService.getTokenInfo(mintAddress);
  }

  @Get('quote/:mint')
  async getQuote(
    @Param('mint') mint: string,
    @Query('amount') amount: number,
    @Query('action') action: 'buy' | 'sell',
  ) {
    return this.pumpService.getQuote(mint, Number(amount), action);
  }

  @Get('token-status/:mint')
  async checkTokenStatus(@Param('mint') mint: string) {
    return this.pumpService.checkTokenStatus(mint);
  }

  @Post('debug-accounts')
  async debugAccounts(@Body() body: { mint: string; buyer: string }) {
    return this.pumpService.debugTokenAccounts(body.mint, body.buyer);
  }

  @Post('create-idl')
  async createTokenViaIdl(@Body() body: {
    name: string;
    symbol: string;
    uri: string;
    creator: string;
  }) {
    try {
      if (!body.name || !body.symbol || !body.creator) {
        throw new HttpException('Name, symbol, and creator are required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.pumpIdlService.createToken({
        name: body.name,
        symbol: body.symbol,
        uri: body.uri || '',
        creator: body.creator,
      });

      if (!result.success) {
        throw new HttpException(result.error || 'Failed to create token', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      this.logger.error('Token creation failed:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(error.message || 'Failed to create token', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('send-transaction')
  async sendTransaction(@Body() body: { transaction: string }) {
    try {
      if (!body.transaction) {
        throw new HttpException('Transaction data is required', HttpStatus.BAD_REQUEST);
      }

      const transaction = Transaction.from(Buffer.from(body.transaction, 'base64'));

      const signature = await sendAndConfirmRawTransaction(
        this.connection, 
        transaction.serialize(), 
        {
          commitment: 'confirmed',
          maxRetries: 3,
        }
      );

      this.logger.log(`Transaction sent: ${signature}`);

      return {
        success: true,
        data: { signature },
      };
    } catch (error: any) {
      this.logger.error('Failed to send transaction:', error);

      let errorMessage = 'Failed to send transaction';

      if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient SOL balance';
      } else if (error.message?.includes('blockhash')) {
        errorMessage = 'Transaction expired. Please try again.';
      } else if (error.message?.includes('0x1')) {
        errorMessage = 'Insufficient funds for transaction';
      }

      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('simulate-idl')
  async simulateTransactionViaIdl(@Body() body: { transaction: string }) {
    try {
      if (!body.transaction) {
        throw new HttpException('Transaction data is required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.pumpIdlService.simulateTransaction(body.transaction);

      this.logger.log(`Simulation: ${result.willSucceed ? 'Will succeed' : 'Will fail'}`);
      
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      this.logger.error('Simulation failed:', error);
      throw new HttpException(error.message || 'Failed to simulate transaction', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('buy-idl')
  async buyTokenViaIdl(@Body() body: {
    mint: string;
    buyer: string;
    solAmount: number;
    slippage?: number;
  }) {
    try {
      if (!body.mint || !body.buyer || !body.solAmount) {
        throw new HttpException('Mint, buyer, and solAmount are required', HttpStatus.BAD_REQUEST);
      }

      if (body.solAmount <= 0) {
        throw new HttpException('SOL amount must be greater than 0', HttpStatus.BAD_REQUEST);
      }

      const result = await this.pumpIdlService.buyToken({
        mint: body.mint,
        buyer: body.buyer,
        solAmount: body.solAmount,
        slippage: body.slippage || 0.01,
      });

      if (!result.success) {
        throw new HttpException(result.error || 'Failed to create buy transaction', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      this.logger.error('Buy transaction failed:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(error.message || 'Failed to create buy transaction', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}