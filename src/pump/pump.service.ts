// src/pump/pump.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { BuyTokenDto } from './dto/buy-token.dto';
import { SellTokenDto } from './dto/sell-token.dto';
import axios from 'axios';

export interface TokenResponse {
  success: boolean;
  signature?: string;
  error?: string;
  data?: any;
}

@Injectable()
export class PumpService {
  private readonly logger = new Logger(PumpService.name);
  
  // PumpPortal API for real trading
  private readonly PUMPPORTAL_BASE = 'https://pumpportal.fun/api';
  
  // Official pump.fun API for token info
  private readonly PUMP_API_BASE = 'https://frontend-api.pump.fun';

  async createToken(createTokenDto: CreateTokenDto, imageFile?: any): Promise<TokenResponse> {
    try {
      this.logger.log('Creating token with real pump.fun API:', createTokenDto);
      
      // Note: Token creation requires connecting to pump.fun directly through their web interface
      // or using their smart contract. This is a complex operation that typically requires:
      // 1. Wallet connection
      // 2. Transaction signing
      // 3. Image upload to IPFS
      // 4. Metadata creation
      
      // For now, we'll prepare the transaction data that would be used
      const tokenData = {
        name: createTokenDto.name,
        symbol: createTokenDto.symbol,
        description: createTokenDto.description,
        website: createTokenDto.website,
        twitter: createTokenDto.twitter,
        telegram: createTokenDto.telegram,
      };

      if (imageFile) {
        this.logger.log('Image file received:', imageFile.originalname || 'unknown');
        // Handle image upload logic here when wallet integration is added
      }

      this.logger.log('Token creation prepared. Real implementation requires wallet integration.');
      
      // In a real implementation, you would:
      // 1. Upload image to IPFS
      // 2. Create metadata JSON
      // 3. Use Solana SDK to create the token
      // 4. Submit to pump.fun bonding curve
      
      return {
        success: false,
        error: 'Token creation requires wallet integration and frontend transaction signing. Use the pump.fun website directly.',
        data: tokenData
      };
    } catch (error) {
      this.logger.error('Failed to create token:', error);
      return {
        success: false,
        error: error.message || 'Token creation failed'
      };
    }
  }

  async buyToken(buyTokenDto: BuyTokenDto): Promise<TokenResponse> {
    try {
      this.logger.log('Initiating real token buy via PumpPortal:', buyTokenDto);
      
      // Check if wallet is connected
      if (!buyTokenDto.publicKey || buyTokenDto.publicKey === 'wallet_not_connected') {
        return {
          success: false,
          error: 'Wallet not connected. Please connect your wallet to trade tokens.'
        };
      }

      // Use PumpPortal for real trading
      const tradeData = {
        publicKey: buyTokenDto.publicKey,
        action: 'buy',
        mint: buyTokenDto.mint,
        denominatedInSol: true, // Amount is in SOL
        amount: buyTokenDto.solAmount, // Amount of SOL to spend
        slippage: buyTokenDto.slippage || 1, // 1% slippage
        priorityFee: buyTokenDto.priorityFee || 0.00001,
        pool: 'pump' // Trading on pump.fun
      };

      const response = await axios.post(`${this.PUMPPORTAL_BASE}/trade-local`, tradeData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      if (response.data) {
        this.logger.log('Trade transaction prepared successfully');
        
        return {
          success: true,
          data: {
            transaction: response.data, // Serialized transaction to sign
            mint: buyTokenDto.mint,
            amount: buyTokenDto.amount,
            solAmount: buyTokenDto.solAmount,
            action: 'buy'
          }
        };
      } else {
        throw new Error('No transaction data received');
      }
    } catch (error) {
      this.logger.error('Failed to buy token:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Buy failed'
      };
    }
  }

  async sellToken(sellTokenDto: SellTokenDto): Promise<TokenResponse> {
    try {
      this.logger.log('Initiating real token sell via PumpPortal:', sellTokenDto);
      
      // Check if wallet is connected
      if (!sellTokenDto.publicKey || sellTokenDto.publicKey === 'wallet_not_connected') {
        return {
          success: false,
          error: 'Wallet not connected. Please connect your wallet to trade tokens.'
        };
      }
      
      const tradeData = {
        publicKey: sellTokenDto.publicKey,
        action: 'sell',
        mint: sellTokenDto.mint,
        denominatedInSol: false, // Amount is in tokens
        amount: sellTokenDto.amount, // Number of tokens to sell (or "100%" for all)
        slippage: sellTokenDto.slippage || 1,
        priorityFee: sellTokenDto.priorityFee || 0.00001,
        pool: 'pump'
      };

      const response = await axios.post(`${this.PUMPPORTAL_BASE}/trade-local`, tradeData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      if (response.data) {
        this.logger.log('Sell transaction prepared successfully');
        
        return {
          success: true,
          data: {
            transaction: response.data, // Serialized transaction to sign
            mint: sellTokenDto.mint,
            amount: sellTokenDto.amount,
            action: 'sell'
          }
        };
      } else {
        throw new Error('No transaction data received');
      }
    } catch (error) {
      this.logger.error('Failed to sell token:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Sell failed'
      };
    }
  }

  async getTokenInfo(mintAddress: string): Promise<TokenResponse> {
    try {
      this.logger.log('Fetching real token info for:', mintAddress);
      
      const response = await axios.get(`${this.PUMP_API_BASE}/coins/${mintAddress}`, {
        timeout: 10000,
      });

      if (response.data) {
        this.logger.log(`Fetched token info: ${response.data.name || 'Unknown'}`);
        
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error('Token not found');
      }
    } catch (error) {
      this.logger.error(`Failed to get token info for ${mintAddress}:`, error);
      return {
        success: false,
        error: error.response?.status === 404 ? 'Token not found' : 'Failed to get token info'
      };
    }
  }

  async getQuote(mint: string, amount: number, action: 'buy' | 'sell'): Promise<TokenResponse> {
    try {
      this.logger.log(`Getting quote for ${action} ${amount} of ${mint}`);
      
      // Get current token info for price calculation
      const tokenInfo = await this.getTokenInfo(mint);
      if (!tokenInfo.success || !tokenInfo.data) {
        throw new Error('Could not fetch token info for quote');
      }

      const token = tokenInfo.data;
      const { virtual_sol_reserves, virtual_token_reserves } = token;
      
      // Calculate estimated price based on bonding curve
      let estimatedPrice = 0;
      if (virtual_token_reserves > 0) {
        estimatedPrice = virtual_sol_reserves / virtual_token_reserves;
      }

      const quote = {
        mint,
        action,
        amount,
        estimatedPrice,
        estimatedSolAmount: action === 'buy' ? amount : amount * estimatedPrice,
        estimatedTokenAmount: action === 'buy' ? amount / estimatedPrice : amount,
        virtualSolReserves: virtual_sol_reserves,
        virtualTokenReserves: virtual_token_reserves,
        timestamp: Date.now(),
      };

      this.logger.log('Quote calculated:', quote);
      
      return {
        success: true,
        data: quote
      };
    } catch (error) {
      this.logger.error('Failed to get quote:', error);
      return {
        success: false,
        error: error.message || 'Failed to get quote'
      };
    }
  }

  async healthCheck() {
    try {
      // Test connection to pump.fun API
      const response = await axios.get(`${this.PUMP_API_BASE}/coins`, {
        params: { limit: 1 },
        timeout: 5000,
      });

      const isHealthy = response.status === 200;
      
      return {
        status: isHealthy ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        service: 'pump-service',
        externalApi: {
          pumpFun: isHealthy ? 'connected' : 'disconnected',
          pumpPortal: 'available' // PumpPortal doesn't have a health endpoint
        }
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'pump-service',
        error: error.message,
        externalApi: {
          pumpFun: 'disconnected',
          pumpPortal: 'unknown'
        }
      };
    }
  }
}