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
    this.logger.log('🎮 PumpController initialized');
    const rpcUrl = this.configService.get('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.logger.log(`📡 Connected to RPC: ${rpcUrl}`);
  }


  @Get('health')
  async healthCheck() {
    this.logger.log('Health check endpoint hit');
    return this.pumpService.healthCheck();
  }

  @Post('create-token')
  @UseInterceptors(FileInterceptor('image'))
  async createToken(
    @Body() createTokenDto: CreateTokenDto,
    @UploadedFile() file?: any,
  ) {
    this.logger.log('Create token endpoint hit');
    return this.pumpService.createToken(createTokenDto, file);
  }

  @Post('buy-token')
  async buyToken(@Body() buyTokenDto: BuyTokenDto & { simulate?: boolean }) {
    this.logger.log('BUY TOKEN endpoint hit');
    this.logger.log(`Request: ${JSON.stringify({ 
      mint: buyTokenDto.mint?.slice(0, 8) + '...', 
      solAmount: buyTokenDto.solAmount,
      publicKey: buyTokenDto.publicKey?.slice(0, 8) + '...'
    })}`);
    
    try {
      const result = await this.pumpService.buyToken(buyTokenDto);
      this.logger.log(`Response: ${result.success ? ':) SUCCESS' : ':( FAILED'}`);
      return result;
    } catch (error) {
      this.logger.error('Controller error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  @Post('sell-token')
  async sellToken(@Body() sellTokenDto: SellTokenDto & { simulate?: boolean }) {
    this.logger.log('SELL TOKEN endpoint hit');
    this.logger.log(`Request: ${JSON.stringify({ 
      mint: sellTokenDto.mint?.slice(0, 8) + '...', 
      amount: sellTokenDto.amount,
      publicKey: sellTokenDto.publicKey?.slice(0, 8) + '...'
    })}`);
    
    try {
      const result = await this.pumpService.sellToken(sellTokenDto);
      this.logger.log(`Response: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      return result;
    } catch (error) {
      this.logger.error('Controller error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  @Post('simulate')
  async simulateTransaction(@Body() body: { transaction: string }) {
    this.logger.log('Simulate endpoint hit');
    return this.pumpService.simulateTransaction(body.transaction);
  }

  @Get('token-info/:mintAddress')
  async getTokenInfo(@Param('mintAddress') mintAddress: string) {
    this.logger.log(`Get token info endpoint hit: ${mintAddress.slice(0, 8)}...`);
    return this.pumpService.getTokenInfo(mintAddress);
  }

  @Get('quote/:mint')
  async getQuote(
    @Param('mint') mint: string,
    @Query('amount') amount: number,
    @Query('action') action: 'buy' | 'sell',
  ) {
    this.logger.log(`Get quote endpoint hit: ${action} ${amount} for ${mint.slice(0, 8)}...`);
    return this.pumpService.getQuote(mint, Number(amount), action);
  }

  @Get('token-status/:mint')
  async checkTokenStatus(@Param('mint') mint: string) {
    this.logger.log(`Check token status endpoint hit: ${mint.slice(0, 8)}...`);
    return this.pumpService.checkTokenStatus(mint);
  }

  @Get('wallet/:address/balances')
  async getWalletBalances(@Param('address') address: string) {
    this.logger.log(`Get wallet balances endpoint hit: ${address.slice(0, 8)}...`);
    return {
      success: true,
      data: {
        solBalance: 0,
        tokenBalances: [],
        portfolioValue: 0,
      },
    };
  }

  @Get('wallet/:address/transactions')
  async getWalletTransactions(
    @Param('address') address: string,
    @Query('limit') limit = 50,
  ) {
    this.logger.log(`Get wallet transactions endpoint hit: ${address.slice(0, 8)}...`);
    return {
      success: true,
      data: [],
    };
  }

  @Post('debug-accounts')
  async debugAccounts(@Body() body: { mint: string; buyer: string }) {
    this.logger.log(`Debug accounts endpoint hit: ${body.mint.slice(0, 8)}..., ${body.buyer.slice(0, 8)}...`);
    return this.pumpService.debugTokenAccounts(body.mint, body.buyer);
  }


  //Create a new token on pump.fun via IDL service
  @Post('create-idl')
  async createTokenViaIdl(@Body() body: {
    name: string;
    symbol: string;
    uri: string;
    creator: string;
  }) {
    try {
      this.logger.log(`Creating token via IDL: ${body.symbol}`);

      // Validate input
      if (!body.name || !body.symbol || !body.creator) {
        this.logger.warn('Missing required fields');
        throw new HttpException('Name, symbol, and creator are required', HttpStatus.BAD_REQUEST);
      }

      // Use the IDL service to create the token transaction
      const result = await this.pumpIdlService.createToken({
        name: body.name,
        symbol: body.symbol,
        uri: body.uri || '',
        creator: body.creator,
      });

      if (!result.success) {
        this.logger.error(`Token creation failed: ${result.error}`);
        throw new HttpException(result.error || 'Failed to create token', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      this.logger.log(':) Token creation transaction built');
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

  
   // Send a signed transaction to the network
   
  @Post('api/pump/send-transaction')
  async sendTransaction(@Body() body: { transaction: string }) {
    try {
      this.logger.log('📤 Sending transaction to network...');
      
      if (!body.transaction) {
        throw new HttpException('Transaction data is required', HttpStatus.BAD_REQUEST);
      }

      // Deserialize the transaction
      const transaction = Transaction.from(Buffer.from(body.transaction, 'base64'));

      // Send and confirm
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
      } else if (error.message?.includes('0x1')) {
        errorMessage = 'Insufficient funds for transaction';
      }

      throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  //Simulate a transaction via IDL service
  @Post('api/pump/simulate')
  async simulateTransactionViaIdl(@Body() body: { transaction: string }) {
    try {
      this.logger.log('🧪 Simulating transaction via IDL...');
      
      if (!body.transaction) {
        throw new HttpException('Transaction data is required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.pumpIdlService.simulateTransaction(body.transaction);

      this.logger.log(`Simulation: ${result.willSucceed ? ':) Will succeed' : ':( Will fail'}`);
      
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
      this.logger.log(`Buy via IDL: ${body.solAmount} SOL for ${body.mint.slice(0, 8)}...`);

      // Validate input
      if (!body.mint || !body.buyer || !body.solAmount) {
        this.logger.warn('Missing required fields');
        throw new HttpException('Mint, buyer, and solAmount are required', HttpStatus.BAD_REQUEST);
      }

      if (body.solAmount <= 0) {
        this.logger.warn('Invalid SOL amount');
        throw new HttpException('SOL amount must be greater than 0', HttpStatus.BAD_REQUEST);
      }

      const result = await this.pumpIdlService.buyToken({
        mint: body.mint,
        buyer: body.buyer,
        solAmount: body.solAmount,
        slippage: body.slippage || 0.01,
      });

      if (!result.success) {
        this.logger.error(`Buy transaction failed: ${result.error}`);
        throw new HttpException(result.error || 'Failed to create buy transaction', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      this.logger.log('Buy transaction built via IDL');
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