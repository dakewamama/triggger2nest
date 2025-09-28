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
  // The duplicate placeholder method 'checkTokenStatus' has been removed.
  private readonly logger = new Logger(PumpService.name);

  constructor(
    private configService: ConfigService,
    private pumpDirectService: PumpDirectService,
  ) {}

  async healthCheck(): Promise<any> {
    return {
      status: 'ok',
      network: this.configService.get('SOLANA_NETWORK') || 'mainnet-beta',
      timestamp: new Date().toISOString(),
      mode: 'direct-contract',
      message: 'Using direct blockchain interaction (no external APIs)',
    };
  }

  async createToken(createTokenDto: CreateTokenDto, file?: any): Promise<TokenResponse> {
    // Token creation requires different approach - would need to deploy via program
    this.logger.warn('Token creation not implemented in direct mode');
    return {
      success: false,
      error: 'Token creation requires pump.fun website or API access',
    };
  }

  async buyToken(buyTokenDto: BuyTokenDto & { simulate?: boolean }): Promise<TokenResponse> {
    try {
      this.logger.log('Processing buy request (direct mode):', buyTokenDto);
      
      // Validate input
      if (!buyTokenDto.publicKey || buyTokenDto.publicKey === 'wallet_not_connected') {
        return {
          success: false,
          error: 'Wallet not connected. Please connect your wallet to trade.'
        };
      }

      if (!buyTokenDto.mint) {
        return {
          success: false,
          error: 'Token mint address is required'
        };
      }

      if (!buyTokenDto.solAmount || buyTokenDto.solAmount <= 0) {
        return {
          success: false,
          error: 'Invalid SOL amount. Amount must be greater than 0'
        };
      }

      // Use direct service to build and simulate transaction
      const result = await this.pumpDirectService.buildAndSimulateBuyTransaction({
        mint: buyTokenDto.mint,
        buyer: buyTokenDto.publicKey,
        solAmount: buyTokenDto.solAmount,
        slippage: buyTokenDto.slippage || 1,
        priorityFee: buyTokenDto.priorityFee || 0.00001,
        simulate: buyTokenDto.simulate !== false, // Default to true
      });

      if (result.success && result.data) {
        this.logger.log('Buy transaction built successfully');
        
        // Check simulation result
        if (result.data.simulation && !result.data.simulation.willSucceed) {
          this.logger.warn('Transaction simulation failed:', result.data.simulation.error);
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
        return {
          success: false,
          error: result.error || 'Failed to build buy transaction',
        };
      }
    } catch (error: any) {
      this.logger.error('Buy transaction failed:', error);
      return {
        success: false,
        error: error.message || 'Buy transaction failed. Please try again.',
      };
    }
  }

  async sellToken(sellTokenDto: SellTokenDto & { simulate?: boolean }): Promise<TokenResponse> {
    try {
      this.logger.log('Processing sell request (direct mode):', sellTokenDto);
      
      if (!sellTokenDto.publicKey || sellTokenDto.publicKey === 'wallet_not_connected') {
        return {
          success: false,
          error: 'Wallet not connected. Please connect your wallet to trade.'
        };
      }

      if (!sellTokenDto.mint) {
        return {
          success: false,
          error: 'Token mint address is required'
        };
      }

      if (!sellTokenDto.amount || sellTokenDto.amount <= 0) {
        return {
          success: false,
          error: 'Invalid token amount. Amount must be greater than 0'
        };
      }

      // Use direct service to build and simulate transaction
      const result = await this.pumpDirectService.buildAndSimulateSellTransaction({
        mint: sellTokenDto.mint,
        seller: sellTokenDto.publicKey,
        tokenAmount: sellTokenDto.amount,
        slippage: sellTokenDto.slippage || 1,
        priorityFee: sellTokenDto.priorityFee || 0.00001,
        simulate: sellTokenDto.simulate !== false, // Default to true
      });

      if (result.success && result.data) {
        this.logger.log('Sell transaction built successfully');
        
        // Check simulation result
        if (result.data.simulation && !result.data.simulation.willSucceed) {
          this.logger.warn('Transaction simulation failed:', result.data.simulation.error);
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
        return {
          success: false,
          error: result.error || 'Failed to build sell transaction',
        };
      }
    } catch (error: any) {
      this.logger.error('Sell transaction failed:', error);
      return {
        success: false,
        error: error.message || 'Sell transaction failed. Please try again.',
      };
    }
  }

  async simulateTransaction(transactionBase64: string): Promise<any> {
    try {
      const result = await this.pumpDirectService.simulateTransaction(transactionBase64, true);
      return result;
    } catch (error: any) {
      this.logger.error('Simulation failed:', error);
      return {
        success: false,
        error: error.message || 'Simulation failed',
      };
    }
  }

  async getTokenInfo(mintAddress: string): Promise<any> {
    return this.pumpDirectService.getTokenInfo(mintAddress);
  }

  async getQuote(mint: string, amount: number, action: 'buy' | 'sell'): Promise<any> {
    const result = await this.pumpDirectService.getQuote(mint, amount, action);
    return result;
  }
  
  async checkTokenStatus(mint: string): Promise<any> {
    return this.pumpDirectService.checkTokenStatus(mint);
  }
}
