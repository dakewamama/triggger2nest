import { Injectable, Logger } from '@nestjs/common';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private connection: Connection;
  private heliusConnection: Connection;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';
    const heliusRpcUrl = this.configService.get<string>('HELIUS_RPC_URL');
    
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.heliusConnection = heliusRpcUrl 
      ? new Connection(heliusRpcUrl, 'confirmed')
      : this.connection;
  }

  async getBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await this.heliusConnection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      this.logger.error(`Failed to get balance for ${address}:`, error);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async getTokenAccounts(address: string): Promise<any[]> {
    try {
      const publicKey = new PublicKey(address);
      const tokenAccounts = await this.heliusConnection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      return tokenAccounts.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        owner: account.account.data.parsed.info.owner,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
      }));
    } catch (error) {
      this.logger.error(`Failed to get token accounts for ${address}:`, error);
      throw new Error(`Failed to get token accounts: ${error.message}`);
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}