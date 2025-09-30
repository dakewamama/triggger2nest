// ===== FILE: pump.controller.ts (merged & corrected) =====

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


@Controller()
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
  }


  @Post('pump/create-token')
  @UseInterceptors(FileInterceptor('image'))
  async createToken(
    @Body() createTokenDto: CreateTokenDto,
    @UploadedFile() file?: any,
  ) {
    return this.pumpService.createToken(createTokenDto, file);
  }

  @Get('pump/health')
  async healthCheck() {
    return this.pumpService.healthCheck();
  }

  @Post('pump/buy-token')
  async buyToken(@Body() buyTokenDto: BuyTokenDto & { simulate?: boolean }) {
    return this.pumpService.buyToken(buyTokenDto);
  }

  @Post('pump/sell-token')
  async sellToken(@Body() sellTokenDto: SellTokenDto & { simulate?: boolean }) {
    return this.pumpService.sellToken(sellTokenDto);
  }

  @Post('pump/simulate')
  async simulateTransaction(@Body() body: { transaction: string }) {
    return this.pumpService.simulateTransaction(body.transaction);
  }

  @Get('pump/token-info/:mintAddress')
  async getTokenInfo(@Param('mintAddress') mintAddress: string) {
    return this.pumpService.getTokenInfo(mintAddress);
  }

  @Get('pump/quote/:mint')
  async getQuote(
    @Param('mint') mint: string,
    @Query('amount') amount: number,
    @Query('action') action: 'buy' | 'sell',
  ) {
    return this.pumpService.getQuote(mint, Number(amount), action);
  }

  @Get('pump/token-status/:mint')
  async checkTokenStatus(@Param('mint') mint: string) {
    return this.pumpService.checkTokenStatus(mint);
  }

  @Get('pump/wallet/:address/balances')
  async getWalletBalances(@Param('address') address: string) {
    return {
      success: true,
      data: {
        solBalance: 0,
        tokenBalances: [],
        portfolioValue: 0,
      },
    };
  }

  @Post('pump/debug-accounts')
  async debugAccounts(@Body() body: { mint: string; buyer: string }) {
    return this.pumpService.debugTokenAccounts(body.mint, body.buyer);
  }

  @Get('pump/wallet/:address/transactions')
  async getWalletTransactions(
    @Param('address') address: string,
    @Query('limit') limit = 50,
  ) {
    return {
      success: true,
      data: [],
    };
  }


  /**
   * Create a new token on pump.fun via IDL service
   */
  @Post('api/pump/create')
  async createTokenViaIdl(@Body() body: {
    name: string;
    symbol: string;
    uri: string;
    creator: string;
  }) {
    try {
      this.logger.log(`Creating token: ${body.symbol}`);

      // Validate input
      if (!body.name || !body.symbol || !body.creator) {
        throw new HttpException('Name, symbol, and creator are required', HttpStatus.BAD_REQUEST);
      }

      // Used the IDL service to create the token transaction
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

  /**
   * Send a signed transaction to the network
   */
  @Post('api/pump/send-transaction')
  async sendTransaction(@Body() body: { transaction: string }) {
    try {
      if (!body.transaction) {
        throw new HttpException('Transaction data is required', HttpStatus.BAD_REQUEST);
      }

      // Deserialize the transaction
      const transaction = Transaction.from(Buffer.from(body.transaction, 'base64'));

      // Send and confirm
      const signature = await sendAndConfirmRawTransaction(this.connection, transaction.serialize(), {
        commitment: 'confirmed',
        maxRetries: 3,
      });

      this.logger.log(`Transaction sent: ${signature}`);

      return {
        success: true,
        data: {
          signature,
        },
      };
    } catch (error: any) {
      this.logger.error('Failed to send transaction:', error);

      let errorMessage = 'Failed to send transaction';

      if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient SOL balance';
      } else if (error.message?.includes('blockhash')) {
        errorMessage = 'Transaction expired. Please try again.';
      }

      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Simulate a transaction via IDL service
   */
  @Post('api/pump/simulate')
  async simulateTransactionViaIdl(@Body() body: { transaction: string }) {
    try {
      if (!body.transaction) {
        throw new HttpException('Transaction data is required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.pumpIdlService.simulateTransaction(body.transaction);

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      this.logger.error('Simulation failed:', error);
      throw new HttpException(error.message || 'Failed to simulate transaction', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Buy tokens via IDL service
   */
  @Post('api/pump/buy')
  async buyTokenViaIdl(@Body() body: {
    mint: string;
    buyer: string;
    solAmount: number;
    slippage?: number;
  }) {
    try {
      this.logger.log(`Buy request: ${body.solAmount} SOL for ${body.mint}`);

      // Validate input
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
