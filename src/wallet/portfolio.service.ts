import { Injectable, Logger } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  TokenBalance,
  TokenMetadata,
  PortfolioToken,
  Portfolio,
  PortfolioResponse,
  TokenBalanceResponse,
  TransactionHistoryResponse,
} from './interfaces/portfolio.interface';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);
  private connection: Connection;
  private readonly PUMP_API = 'https://frontend-api.pump.fun';

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Get complete portfolio for a wallet address
   */
  async getPortfolio(address: string): Promise<PortfolioResponse> {
    try {
      this.logger.log(`Fetching portfolio for ${address}`);
      
      const publicKey = new PublicKey(address);

      // Get SOL balance
      const solBalance = await this.connection.getBalance(publicKey);
      const solBalanceInSol = solBalance / 1e9;

      // Get all token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      this.logger.log(`Found ${tokenAccounts.value.length} token accounts`);

      // Process each token
      const portfolioTokens: PortfolioToken[] = [];
      let totalValue = 0;
      let totalChange24h = 0;

      for (const account of tokenAccounts.value) {
        const tokenData = account.account.data.parsed.info;
        const mint = tokenData.mint;
        const balance = tokenData.tokenAmount.uiAmount;

        // Skip if balance is 0
        if (balance === 0) continue;

        // Get token metadata and price from pump.fun
        const metadata = await this.getTokenMetadata(mint);

        const value = balance * (metadata.price || 0);
        const valueChange24h = value * ((metadata.priceChange24h || 0) / 100);

        portfolioTokens.push({
          mint,
          name: metadata.name || 'Unknown Token',
          symbol: metadata.symbol || '???',
          balance,
          decimals: tokenData.tokenAmount.decimals,
          image_uri: metadata.image_uri,
          price: metadata.price || 0,
          value,
          priceChange24h: metadata.priceChange24h || 0,
          valueChange24h,
        });

        totalValue += value;
        totalChange24h += valueChange24h;
      }

      // Sort by value (highest first)
      portfolioTokens.sort((a, b) => b.value - a.value);

      return {
        success: true,
        data: {
          tokens: portfolioTokens,
          totalValue,
          totalChange24h,
          solBalance: solBalanceInSol,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get portfolio: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get token metadata from pump.fun API
   */
  private async getTokenMetadata(mint: string): Promise<TokenMetadata> {
    try {
      // Try to get token data from pump.fun
      const response = await axios.get(`${this.PUMP_API}/coins/${mint}`, {
        timeout: 5000,
      });

      const data = response.data;

      return {
        name: data.name || 'Unknown',
        symbol: data.symbol || '???',
        image_uri: data.image_uri,
        price: this.calculatePrice(data),
        priceChange24h: 0, // Pump.fun doesn't provide 24h change directly
      };
    } catch (error) {
      this.logger.warn(`Failed to fetch metadata for ${mint}`);
      // Return default metadata
      return {
        name: 'Unknown Token',
        symbol: '???',
        price: 0,
        priceChange24h: 0,
      };
    }
  }

  /**
   * Calculate token price from bonding curve reserves
   */
  private calculatePrice(tokenData: any): number {
    try {
      if (!tokenData.virtual_sol_reserves || !tokenData.virtual_token_reserves) {
        return 0;
      }

      const solReserves = tokenData.virtual_sol_reserves;
      const tokenReserves = tokenData.virtual_token_reserves;

      // Price = SOL reserves / Token reserves
      const priceInSol = solReserves / tokenReserves;
      
      // Convert to USD (assuming SOL = $150, you can make this dynamic)
      const SOL_PRICE_USD = 150;
      return priceInSol * SOL_PRICE_USD;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get balance for a specific token
   */
  async getTokenBalance(
    walletAddress: string,
    mintAddress: string
  ): Promise<TokenBalanceResponse> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const mintPubkey = new PublicKey(mintAddress);

      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: mintPubkey }
      );

      if (tokenAccounts.value.length === 0) {
        return { success: true, balance: 0 };
      }

      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;

      return {
        success: true,
        balance,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get token balance: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get transaction history for portfolio tracking
   */
  async getTransactionHistory(
    address: string,
    limit: number = 50
  ): Promise<TransactionHistoryResponse> {
    try {
      const publicKey = new PublicKey(address);
      
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );

      const transactions = [];

      for (const sig of signatures.slice(0, 10)) { // Limit to 10 for performance
        const tx = await this.connection.getParsedTransaction(sig.signature);
        
        if (tx?.meta && !tx.meta.err) {
          transactions.push({
            signature: sig.signature,
            timestamp: sig.blockTime,
            success: !tx.meta.err,
            fee: tx.meta.fee,
          });
        }
      }

      return {
        success: true,
        data: transactions,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get transaction history: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}