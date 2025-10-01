import { Controller, Get, Param, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PortfolioService } from './portfolio.service';
import {
  PortfolioResponse,
  TokenBalanceResponse,
  TransactionHistoryResponse,
} from './interfaces/portfolio.interface';

@Controller('api/wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly portfolioService: PortfolioService,
  ) {}

  /**
   * Get SOL balance for a wallet
   */
  @Get(':address/balance')
  async getBalance(@Param('address') address: string) {
    try {
      const balance = await this.walletService.getBalance(address);
      return { 
        success: true,
        address, 
        balance 
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        balance: 0,
      };
    }
  }

  /**
   * Get complete portfolio with all token holdings
   */
  @Get(':address/portfolio')
  async getPortfolio(@Param('address') address: string): Promise<PortfolioResponse> {
    return this.portfolioService.getPortfolio(address);
  }

  /**
   * Get balance for a specific token
   */
  @Get(':address/token/:mint')
  async getTokenBalance(
    @Param('address') address: string,
    @Param('mint') mint: string,
  ): Promise<TokenBalanceResponse> {
    return this.portfolioService.getTokenBalance(address, mint);
  }

  /**
   * Get transaction history
   */
  @Get(':address/transactions')
  async getTransactions(
    @Param('address') address: string,
    @Query('limit') limit: string = '50',
  ): Promise<TransactionHistoryResponse> {
    return this.portfolioService.getTransactionHistory(
      address,
      parseInt(limit, 10)
    );
  }

  /**
   * Get all token accounts (raw data)
   */
  @Get(':address/tokens')
  async getTokenAccounts(@Param('address') address: string) {
    try {
      const tokens = await this.walletService.getTokenAccounts(address);
      return {
        success: true,
        data: tokens,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  }
}