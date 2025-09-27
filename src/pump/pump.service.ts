import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  private readonly configService: ConfigService = new ConfigService();
  
  // Use v3 API with proper configuration
  private readonly PUMP_API_V3 = 'https://frontend-api-v3.pump.fun';
  private readonly PUMP_API_V2 = 'https://frontend-api-v2.pump.fun';
  private readonly PUMP_API_V1 = 'https://frontend-api.pump.fun';
  private readonly PUMPPORTAL_API = 'https://pumpportal.fun/api';

  /**
   * Get proper headers for pump.fun API requests
   */
  private getApiHeaders(): Record<string, string> {
    return {
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      'Origin': 'https://pump.fun',
      'Referer': 'https://pump.fun/',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
    };
  }

  /**
   * Try pump.fun APIs in order: v3 -> v2 -> v1 -> PumpPortal
   */
  private async callPumpApiWithFallback(endpoint: string, params: any = {}): Promise<any> {
    const apis = [
      { name: 'v3', url: this.PUMP_API_V3 },
      { name: 'v2', url: this.PUMP_API_V2 },
      { name: 'v1', url: this.PUMP_API_V1 },
    ];

    for (const api of apis) {
      try {
        this.logger.log(`Attempting pump.fun ${api.name}: ${api.url}${endpoint}`);
        
        const response = await axios.get(`${api.url}${endpoint}`, {
          params,
          headers: this.getApiHeaders(),
          timeout: 12000,
          validateStatus: (status) => status < 500, // Don't throw on 4xx errors
        });

        if (response.status === 200 && response.data) {
          this.logger.log(`✅ Success with pump.fun ${api.name}`);
          return response.data;
        } else {
          this.logger.warn(`❌ pump.fun ${api.name} returned status ${response.status}`);
        }
      } catch (error: any) {
        this.logger.warn(`❌ pump.fun ${api.name} failed: ${error.response?.status || error.code} - ${error.message}`);
        continue;
      }
    }

    throw new Error('All pump.fun APIs failed');
  }

  /**
   * Call PumpPortal API as backup
   */
  private async callPumpPortalApi(endpoint: string, params: any = {}): Promise<any> {
    try {
      this.logger.log(`Attempting PumpPortal: ${this.PUMPPORTAL_API}${endpoint}`);
      
      const response = await axios.get(`${this.PUMPPORTAL_API}${endpoint}`, {
        params,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PumpFunController/1.0',
        },
        timeout: 10000,
      });

      if (response.status === 200 && response.data) {
        this.logger.log(`✅ Success with PumpPortal`);
        return response.data;
      }
    } catch (error: any) {
      this.logger.warn(`❌ PumpPortal failed: ${error.response?.status || error.code} - ${error.message}`);
      throw error;
    }
  }

  async healthCheck(): Promise<any> {
    try {
      const data = await this.callPumpApiWithFallback('/coins', { limit: 1 });
      return {
        success: true,
        message: 'Pump.fun API is healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'API health check failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async createToken(createTokenDto: CreateTokenDto, imageFile?: any): Promise<TokenResponse> {
    try {
      this.logger.log('Token creation request:', createTokenDto);
      
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
      }

      // Token creation on pump.fun requires frontend wallet integration
      return {
        success: false,
        error: 'Token creation requires wallet integration. Please use pump.fun directly or integrate wallet signing.',
        data: tokenData
      };
    } catch (error) {
      this.logger.error('Token creation failed:', error);
      return {
        success: false,
        error: error.message || 'Token creation failed'
      };
    }
  }

  async buyToken(buyTokenDto: BuyTokenDto): Promise<TokenResponse> {
    try {
      this.logger.log('Creating buy transaction:', buyTokenDto);
      
      if (!buyTokenDto.publicKey || buyTokenDto.publicKey === 'wallet_not_connected') {
        return {
          success: false,
          error: 'Wallet not connected. Please connect your wallet to trade.'
        };
      }

      // Prepare trade data for PumpPortal API
      const tradeData = {
        publicKey: buyTokenDto.publicKey,
        action: 'buy' as const,
        mint: buyTokenDto.mint,
        denominatedInSol: 'true', // Must be string
        amount: buyTokenDto.solAmount.toString(), // Must be string
        slippage: (buyTokenDto.slippage || 1).toString(), // Must be string
        priorityFee: (buyTokenDto.priorityFee || 0.00001).toString(), // Must be string
        pool: 'pump'
      };

      this.logger.log('Sending trade data to PumpPortal:', tradeData);

      try {
        const response = await axios.post(`${this.PUMPPORTAL_API}/trade-local`, tradeData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
        });

        if (response.data) {
          this.logger.log('Buy transaction prepared successfully');
          
          return {
            success: true,
            data: {
              transaction: response.data,
              mint: buyTokenDto.mint,
              amount: buyTokenDto.amount,
              solAmount: buyTokenDto.solAmount,
              action: 'buy'
            }
          };
        } else {
          throw new Error('No transaction data received from PumpPortal');
        }
      } catch (apiError: any) {
        // Handle PumpPortal API specific errors
        if (apiError.response?.status === 400) {
          this.logger.error('PumpPortal API validation error:', apiError.response?.data);
          return {
            success: false,
            error: apiError.response?.data?.error || 'Invalid trade parameters. Please check your input.'
          };
        } else if (apiError.response?.status === 404) {
          return {
            success: false,
            error: 'Token not found or not tradeable on pump.fun'
          };
        } else if (apiError.response?.status === 500) {
          return {
            success: false,
            error: 'PumpPortal service error. Please try again later.'
          };
        }
        throw apiError;
      }
    } catch (error: any) {
      this.logger.error('Buy transaction failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Buy transaction failed. Please try again.'
      };
    }
  }

  async sellToken(sellTokenDto: SellTokenDto): Promise<TokenResponse> {
    try {
      this.logger.log('Creating sell transaction:', sellTokenDto);
      
      if (!sellTokenDto.publicKey || sellTokenDto.publicKey === 'wallet_not_connected') {
        return {
          success: false,
          error: 'Wallet not connected. Please connect your wallet to trade.'
        };
      }
      
      // Prepare trade data for PumpPortal API
      const tradeData = {
        publicKey: sellTokenDto.publicKey,
        action: 'sell' as const,
        mint: sellTokenDto.mint,
        denominatedInSol: 'false', // Must be string
        amount: sellTokenDto.amount.toString(), // Must be string
        slippage: (sellTokenDto.slippage || 1).toString(), // Must be string
        priorityFee: (sellTokenDto.priorityFee || 0.00001).toString(), // Must be string
        pool: 'pump'
      };

      this.logger.log('Sending sell trade data to PumpPortal:', tradeData);

      try {
        const response = await axios.post(`${this.PUMPPORTAL_API}/trade-local`, tradeData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 30000,
        });

        if (response.data) {
          this.logger.log('Sell transaction prepared successfully');
          
          return {
            success: true,
            data: {
              transaction: response.data,
              mint: sellTokenDto.mint,
              amount: sellTokenDto.amount,
              action: 'sell'
            }
          };
        } else {
          throw new Error('No transaction data received from PumpPortal');
        }
      } catch (apiError: any) {
        // Handle PumpPortal API specific errors
        if (apiError.response?.status === 400) {
          this.logger.error('PumpPortal API validation error:', apiError.response?.data);
          return {
            success: false,
            error: apiError.response?.data?.error || 'Invalid trade parameters. Please check your input.'
          };
        } else if (apiError.response?.status === 404) {
          return {
            success: false,
            error: 'Token not found or not tradeable on pump.fun'
          };
        } else if (apiError.response?.status === 500) {
          return {
            success: false,
            error: 'PumpPortal service error. Please try again later.'
          };
        }
        throw apiError;
      }
    } catch (error: any) {
      this.logger.error('Sell transaction failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Sell transaction failed. Please try again.'
      };
    }
  }

  async getTokenInfo(mintAddress: string): Promise<TokenResponse> {
    try {
      this.logger.log('Fetching token info for:', mintAddress);
      
      // Try pump.fun APIs first
      try {
        const data = await this.callPumpApiWithFallback(`/coins/${mintAddress}`);
        
        if (data) {
          this.logger.log(`Token info found: ${data.name || 'Unknown'}`);
          return {
            success: true,
            data: data
          };
        }
      } catch (pumpError) {
        this.logger.warn('Pump.fun APIs failed for token info, trying PumpPortal...');
      }

      // Fallback to PumpPortal
      try {
        const data = await this.callPumpPortalApi(`/tokens/${mintAddress}`);
        
        if (data) {
          this.logger.log(`Token info found via PumpPortal: ${data.name || 'Unknown'}`);
          return {
            success: true,
            data: data
          };
        }
      } catch (portalError) {
        this.logger.warn('PumpPortal also failed for token info');
      }

      throw new Error('Token not found in any API');
    } catch (error: any) {
      this.logger.error(`Failed to get token info for ${mintAddress}:`, error);
      return {
        success: false,
        error: error.message || 'Failed to get token info'
      };
    }
  }

  async getQuote(mint: string, amount: number, action: 'buy' | 'sell'): Promise<TokenResponse> {
    try {
      this.logger.log(`Getting quote for ${action} ${amount} of ${mint}`);
      
      // Get current token info for price calculation
      const tokenInfo = await this.getTokenInfo(mint);
      if (!tokenInfo.success || !tokenInfo.data) {
        // Return default quote if token info fails
        return {
          success: true,
          data: {
            mint,
            action,
            amount,
            estimatedPrice: 0,
            estimatedSolAmount: 0,
            estimatedTokenAmount: 0,
            priceImpact: 0,
            slippage: 1.0,
            fees: 0.000005,
          }
        };
      }

      const token = tokenInfo.data;
      const virtualSolReserves = token.virtual_sol_reserves || 0;
      const virtualTokenReserves = token.virtual_token_reserves || 1;
      
      // Calculate estimated price based on bonding curve
      const currentPrice = virtualSolReserves / virtualTokenReserves;
      
      // Calculate outputs based on action
      let estimatedTokenAmount = 0;
      let estimatedSolAmount = 0;
      let priceImpact = 0;

      if (action === 'buy') {
        // Buying with SOL - calculate tokens received
        estimatedSolAmount = amount;
        
        // Simple bonding curve calculation
        // In reality, this would use the exact bonding curve formula
        const k = virtualSolReserves * virtualTokenReserves; // Constant product
        const newSolReserves = virtualSolReserves + amount;
        const newTokenReserves = k / newSolReserves;
        estimatedTokenAmount = virtualTokenReserves - newTokenReserves;
        
        // Calculate price impact
        const newPrice = newSolReserves / newTokenReserves;
        priceImpact = ((newPrice - currentPrice) / currentPrice) * 100;
        
      } else {
        // Selling tokens - calculate SOL received
        estimatedTokenAmount = amount;
        
        // Simple bonding curve calculation
        const k = virtualSolReserves * virtualTokenReserves;
        const newTokenReserves = virtualTokenReserves + amount;
        const newSolReserves = k / newTokenReserves;
        estimatedSolAmount = virtualSolReserves - newSolReserves;
        
        // Calculate price impact
        const newPrice = newSolReserves / newTokenReserves;
        priceImpact = ((currentPrice - newPrice) / currentPrice) * 100;
      }

      const quote = {
        mint,
        action,
        amount,
        estimatedPrice: currentPrice,
        estimatedSolAmount: Math.max(0, estimatedSolAmount),
        estimatedTokenAmount: Math.max(0, estimatedTokenAmount),
        priceImpact: Math.abs(priceImpact),
        slippage: 1.0, // 1% default
        fees: 0.000005, // SOL transaction fee
        virtualSolReserves,
        virtualTokenReserves,
      };

      this.logger.log(`Quote generated:`, quote);
      
      return {
        success: true,
        data: quote
      };
    } catch (error: any) {
      this.logger.error(`Failed to get quote for ${mint}:`, error);
      
      // Return a default quote on error
      return {
        success: true,
        data: {
          mint,
          action,
          amount,
          estimatedPrice: 0,
          estimatedSolAmount: 0,
          estimatedTokenAmount: 0,
          priceImpact: 0,
          slippage: 1.0,
          fees: 0.000005,
        }
      };
    }
  }
}