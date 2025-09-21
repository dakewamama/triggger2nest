// src/pump/pump.service.ts
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

      // Use PumpPortal for trading transactions
      const tradeData = {
        publicKey: buyTokenDto.publicKey,
        action: 'buy',
        mint: buyTokenDto.mint,
        denominatedInSol: true,
        amount: buyTokenDto.solAmount,
        slippage: buyTokenDto.slippage || 1,
        priorityFee: buyTokenDto.priorityFee || 0.00001,
        pool: 'pump'
      };

      const response = await axios.post(`${this.PUMPPORTAL_API}/trade-local`, tradeData, {
        headers: {
          'Content-Type': 'application/json',
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
        throw new Error('No transaction data received');
      }
    } catch (error: any) {
      this.logger.error('Buy transaction failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Buy failed'
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
      
      const tradeData = {
        publicKey: sellTokenDto.publicKey,
        action: 'sell',
        mint: sellTokenDto.mint,
        denominatedInSol: false,
        amount: sellTokenDto.amount,
        slippage: sellTokenDto.slippage || 1,
        priorityFee: sellTokenDto.priorityFee || 0.00001,
        pool: 'pump'
      };

      const response = await axios.post(`${this.PUMPPORTAL_API}/trade-local`, tradeData, {
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
            transaction: response.data,
            mint: sellTokenDto.mint,
            amount: sellTokenDto.amount,
            action: 'sell'
          }
        };
      } else {
        throw new Error('No transaction data received');
      }
    } catch (error: any) {
      this.logger.error('Sell transaction failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Sell failed'
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

      this.logger.log('Quote calculated successfully');
      
      return {
        success: true,
        data: quote
      };
    } catch (error: any) {
      this.logger.error('Failed to get quote:', error);
      return {
        success: false,
        error: error.message || 'Failed to get quote'
      };
    }
  }

  async healthCheck() {
    try {
      this.logger.log('Running comprehensive health check...');
      
      const results = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'pump-service',
        apis: {}
      };

      // Test pump.fun v3 API
      try {
        await this.callPumpApiWithFallback('/coins', { limit: 1 });
        results.apis['pump_fun'] = 'connected';
        this.logger.log('✅ Pump.fun API is healthy');
      } catch (error) {
        results.apis['pump_fun'] = 'disconnected';
        this.logger.warn('❌ Pump.fun API health check failed');
      }

      // Test PumpPortal API
      try {
        await this.callPumpPortalApi('', {}); // Basic endpoint check
        results.apis['pump_portal'] = 'connected';
        this.logger.log('✅ PumpPortal API is healthy');
      } catch (error) {
        results.apis['pump_portal'] = 'disconnected';
        this.logger.warn('❌ PumpPortal API health check failed');
      }

      // Determine overall status
      const connectedApis = Object.values(results.apis).filter(status => status === 'connected').length;
      
      if (connectedApis === 0) {
        results.status = 'error';
      } else if (connectedApis === 1) {
        results.status = 'degraded';
      }

      this.logger.log(`Health check complete - Status: ${results.status}`);
      return results;
    } catch (error: any) {
      this.logger.error('Health check failed completely:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'pump-service',
        error: error.message,
        apis: {
          pump_fun: 'unknown',
          pump_portal: 'unknown'
        }
      };
    }
  }
}