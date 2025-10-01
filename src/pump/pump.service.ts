// src/pump/pump.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateTokenDto } from './dto/create-token.dto';
import { BuyTokenDto } from './dto/buy-token.dto';
import { SellTokenDto } from './dto/sell-token.dto';
import { PumpDirectService } from './pump-direct.service';

export interface TokenResponse {
  success: boolean;
  signature?: string;
  error?: string;
  data?: any;
}

@Injectable()
export class PumpService {
  private readonly logger = new Logger(PumpService.name);

  constructor(
    private configService: ConfigService,
    private pumpDirectService: PumpDirectService,
  ) {}

  async healthCheck(): Promise<any> {
    this.logger.log('Health check called');
    return {
      status: 'ok',
      network: this.configService.get('SOLANA_NETWORK') || 'mainnet-beta',
      timestamp: new Date().toISOString(),
      mode: 'direct-contract',
      message: 'Using direct blockchain interaction (no external APIs)',
    };
  }

  async createToken(createTokenDto: CreateTokenDto, file?: any): Promise<TokenResponse> {
    try {
      this.logger.log('Token creation request received');
      
      return {
        success: false,
        error: 'Token creation is currently disabled. Please use pump.fun website directly to create tokens. This feature requires pump.fun API access which is currently blocked by Cloudflare.',
        data: {
          alternative: 'Visit https://pump.fun to create tokens directly on their platform',
          reason: 'API access restricted'
        }
      };
    } catch (error: any) {
      this.logger.error('Create token error:', error);
      return {
        success: false,
        error: 'Token creation is not available at this time. Please use pump.fun website.',
      };
    }
  }

  async buyToken(buyTokenDto: BuyTokenDto & { simulate?: boolean }): Promise<TokenResponse> {
    try {
      this.logger.log('=== BUY TOKEN REQUEST ===');
      this.logger.log('Request data:', JSON.stringify(buyTokenDto, null, 2));
      
      if (!buyTokenDto.publicKey || buyTokenDto.publicKey === 'wallet_not_connected') {
        this.logger.warn('Wallet not connected');
        return {
          success: false,
          error: 'Wallet not connected. Please connect your wallet to trade.'
        };
      }

      if (!buyTokenDto.mint) {
        this.logger.warn('Missing mint address');
        return {
          success: false,
          error: 'Token mint address is required'
        };
      }

      if (!buyTokenDto.solAmount || buyTokenDto.solAmount <= 0) {
        this.logger.warn('Invalid SOL amount:', buyTokenDto.solAmount);
        return {
          success: false,
          error: 'Invalid SOL amount. Amount must be greater than 0'
        };
      }

      this.logger.log('Calling pump-direct service...');
      const result = await this.pumpDirectService.buildAndSimulateBuyTransaction({
        mint: buyTokenDto.mint,
        buyer: buyTokenDto.publicKey,
        solAmount: buyTokenDto.solAmount,
        slippage: buyTokenDto.slippage || 1,
        priorityFee: buyTokenDto.priorityFee || 0.00001,
        simulate: buyTokenDto.simulate !== false,
      });

      this.logger.log('Direct service result:', result.success ? 'SUCCESS' : 'FAILED');
      
      if (result.success && result.data) {
        this.logger.log('✅ Buy transaction built successfully');
        
        if (result.data.simulation && !result.data.simulation.willSucceed) {
          this.logger.warn('⚠️ Transaction simulation failed:', result.data.simulation.error);
        }
        
        return {
          success: true,
          data: {
            transaction: result.data.transaction,
            mint: buyTokenDto.mint,
            amount: result.data.expectedTokens,
            solAmount: buyTokenDto.solAmount,
            action: 'buy',
            mode: 'direct',
            simulation: result.data.simulation,
            warning: result.data.warning,
          }
        };
      } else {
        this.logger.error('❌ Failed to build transaction:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to build buy transaction',
        };
      }
    } catch (error: any) {
      this.logger.error('💥 Buy transaction exception:', error);
      return {
        success: false,
        error: error.message || 'Buy transaction failed. Please try again.',
      };
    }
  }

  async sellToken(sellTokenDto: SellTokenDto & { simulate?: boolean }): Promise<TokenResponse> {
    try {
      this.logger.log('=== SELL TOKEN REQUEST ===');
      this.logger.log('Request data:', JSON.stringify(sellTokenDto, null, 2));
      
      if (!sellTokenDto.publicKey || sellTokenDto.publicKey === 'wallet_not_connected') {
        this.logger.warn('Wallet not connected');
        return {
          success: false,
          error: 'Wallet not connected. Please connect your wallet to trade.'
        };
      }

      if (!sellTokenDto.mint) {
        this.logger.warn('Missing mint address');
        return {
          success: false,
          error: 'Token mint address is required'
        };
      }

      if (!sellTokenDto.amount || sellTokenDto.amount <= 0) {
        this.logger.warn('Invalid token amount:', sellTokenDto.amount);
        return {
          success: false,
          error: 'Invalid token amount. Amount must be greater than 0'
        };
      }

      this.logger.log('Calling pump-direct service...');
      const result = await this.pumpDirectService.buildAndSimulateSellTransaction({
        mint: sellTokenDto.mint,
        seller: sellTokenDto.publicKey,
        tokenAmount: sellTokenDto.amount,
        slippage: sellTokenDto.slippage || 1,
        priorityFee: sellTokenDto.priorityFee || 0.00001,
        simulate: sellTokenDto.simulate !== false,
      });

      this.logger.log('Direct service result:', result.success ? 'SUCCESS' : 'FAILED');
      
      if (result.success && result.data) {
        this.logger.log('✅ Sell transaction built successfully');
        
        if (result.data.simulation && !result.data.simulation.willSucceed) {
          this.logger.warn('⚠️ Transaction simulation failed:', result.data.simulation.error);
        }
        
        return {
          success: true,
          data: {
            transaction: result.data.transaction,
            mint: sellTokenDto.mint,
            amount: sellTokenDto.amount,
            expectedSol: result.data.expectedSol,
            action: 'sell',
            mode: 'direct',
            simulation: result.data.simulation,
            warning: result.data.warning,
          }
        };
      } else {
        this.logger.error('❌ Failed to build transaction:', result.error);
        return {
          success: false,
          error: result.error || 'Failed to build sell transaction',
        };
      }
    } catch (error: any) {
      this.logger.error('💥 Sell transaction exception:', error);
      return {
        success: false,
        error: error.message || 'Sell transaction failed. Please try again.',
      };
    }
  }

  async simulateTransaction(transaction: string): Promise<any> {
    try {
      this.logger.log('Simulating transaction');
      const result = await this.pumpDirectService.simulateTransaction(transaction, false);
      
      return {
        success: true,
        data: {
          willSucceed: result.willSucceed,
          error: result.error,
          logs: result.logs,
          unitsConsumed: result.unitsConsumed,
        }
      };
    } catch (error: any) {
      this.logger.error('Simulation error:', error);
      return {
        success: false,
        error: error.message || 'Simulation failed'
      };
    }
  }

  async getTokenInfo(mintAddress: string): Promise<any> {
    try {
      this.logger.log(`Getting token info for: ${mintAddress}`);
      const result = await this.pumpDirectService.getTokenInfo(mintAddress);
      
      return result;
    } catch (error: any) {
      this.logger.error('Get token info error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get token info'
      };
    }
  }

  async getQuote(mint: string, amount: number, action: 'buy' | 'sell'): Promise<any> {
    try {
      this.logger.log(`Getting quote: ${action} ${amount} for ${mint}`);
      
      return {
        success: true,
        data: {
          mint,
          action,
          amount,
          price: 0,
          estimatedOutput: 0,
          priceImpact: 0,
          slippageEstimate: 1,
          fees: amount * 0.01,
        }
      };
    } catch (error: any) {
      this.logger.error('Get quote error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get quote'
      };
    }
  }

  async checkTokenStatus(mint: string): Promise<any> {
    try {
      this.logger.log(`Checking token status: ${mint}`);
      const result = await this.pumpDirectService.getTokenInfo(mint);
      
      return {
        success: true,
        data: {
          mint,
          exists: result.success,
          ...result.data
        }
      };
    } catch (error: any) {
      this.logger.error('Check token status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to check token status'
      };
    }
  }

  async debugTokenAccounts(mint: string, buyer: string): Promise<any> {
    try {
      this.logger.log(`Debugging accounts for mint: ${mint}, buyer: ${buyer}`);
      const result = await this.pumpDirectService.debugTokenAccounts(mint, buyer);
      
      return result;
    } catch (error: any) {
      this.logger.error('Debug accounts error:', error);
      return {
        success: false,
        error: error.message || 'Failed to debug accounts'
      };
    }
  }
}