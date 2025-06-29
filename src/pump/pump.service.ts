import { Injectable, Logger } from '@nestjs/common';
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ConfigService } from '@nestjs/config';
import { PumpFunSDK, DEFAULT_DECIMALS } from 'pumpdotfun-sdk';
import { AnchorProvider } from '@coral-xyz/anchor';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { CreateTokenDto, BuyTokenDto, SellTokenDto } from './dto/pump.dto';
import BN from 'bn.js';
import * as fs from 'fs';

@Injectable()
export class PumpService {
  private readonly logger = new Logger(PumpService.name);
  private connection: Connection;
  private payer: Keypair;
  private provider: AnchorProvider;
  private pumpFunSdk: PumpFunSDK;
  private readonly rpcUrl: string;

  constructor(private configService: ConfigService) {
    this.rpcUrl = this.configService.get<string>('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(this.rpcUrl, 'confirmed');

    const privateKey = this.configService.get<string>('SOLANA_PRIVATE_KEY');
    if (!privateKey) {
      this.logger.error('SOLANA_PRIVATE_KEY environment variable is not set. Using a dummy keypair for demonstration.');
      this.payer = Keypair.generate();
    } else {
      try {
        const secretKeyArray = JSON.parse(privateKey);
        this.payer = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
        this.logger.log(`Wallet loaded: ${this.payer.publicKey.toBase58()}`);
      } catch (e) {
        this.logger.error('Failed to parse SOLANA_PRIVATE_KEY. Ensure it is a valid JSON array string of numbers.', e);
        this.payer = Keypair.generate();
        this.logger.log(` Devnet Wallet Address: ${this.payer.publicKey.toBase58()}`);

      }
    }

    // Create AnchorProvider with NodeWallet
    const wallet = new NodeWallet(this.payer);
    this.provider = new AnchorProvider(this.connection, wallet, { 
      commitment: 'confirmed',
      preflightCommitment: 'confirmed' 
    });

    // Initialize PumpFunSDK with the provider
    this.pumpFunSdk = new PumpFunSDK(this.provider);
  }

  /**
   * Creates a new token on Pump.fun and buys some tokens immediately.
   * @param data DTO containing name, symbol, and description.
   * @param buyAmountSol Amount of SOL to spend on initial purchase (default: 0.0001 SOL).
   * @param imageFile Optional image file buffer for token logo.
   * @param imageFilePath Optional path to image file (alternative to imageFile buffer).
   * @returns Transaction result with success status and signature.
   */
  async createToken(
    data: CreateTokenDto, 
    buyAmountSol: number = 0.0001, 
    imageFile?: Buffer, 
    imageFilePath?: string
  ): Promise<any> {
    this.logger.log(`Attempting to create token: ${data.name} (${data.symbol})`);
    try {
      // Generate a new mint keypair for the token
      const mint = Keypair.generate();
      
      // Handle image file
      let fileBuffer = imageFile;
      if (!fileBuffer && imageFilePath) {
        try {
          fileBuffer = await fs.promises.readFile(imageFilePath);
        } catch (error) {
          this.logger.warn(`Failed to read image file: ${imageFilePath}`, error.message);
          fileBuffer = Buffer.alloc(0);
        }
      }

      // Convert Buffer to Blob for SDK compatibility
      const fileBlob = fileBuffer ? new Blob([fileBuffer]) : new Blob();
      const tokenMetadata = {
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        file: fileBlob, 
      };

      const SLIPPAGE_BASIS_POINTS = 500n; // 5% slippage
      const buyAmount = BigInt(Math.floor(buyAmountSol * LAMPORTS_PER_SOL));

      // Use createAndBuy method from SDK
      const result = await this.pumpFunSdk.createAndBuy(
        this.payer,
        mint,
        tokenMetadata,
        buyAmount,
        SLIPPAGE_BASIS_POINTS,
        {
          unitLimit: 250000,
          unitPrice: 250000,
        }
      );

      if (result.success) {
        this.logger.log(`Token created successfully. Mint: ${mint.publicKey.toBase58()}`);
        this.logger.log(`Transaction signature: ${result.signature}`);
        return {
          success: true,
          signature: result.signature,
          mintAddress: mint.publicKey.toBase58(),
          pumpUrl: `https://pump.fun/${mint.publicKey.toBase58()}`
        };
      } else {
        this.logger.error('Token creation failed:', result.error);
        throw new Error(`Token creation failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Error in createToken:', error.message, error.stack);
      throw new Error(`Failed to create token: ${error.message}`);
    }
  }

  /**
   * Buys a specified amount of a token on Pump.fun.
   * @param data DTO containing mint address and amount (in SOL).
   * @returns Transaction result with success status and signature.
   */
  async buyToken(data: BuyTokenDto): Promise<any> {
    this.logger.log(`Attempting to buy token ${data.mintAddress} for ${data.amountSol} SOL`);
    try {
      const mint = new PublicKey(data.mintAddress);
      const buyAmount = BigInt(Math.floor(data.amountSol * LAMPORTS_PER_SOL));
      const SLIPPAGE_BASIS_POINTS = 500n; // 5% slippage

      const result = await this.pumpFunSdk.buy(
        this.payer,
        mint,
        buyAmount,
        SLIPPAGE_BASIS_POINTS,
        {
          unitLimit: 250000,
          unitPrice: 250000,
        }
      );

      if (result.success) {
        this.logger.log(`Buy transaction successful: ${result.signature}`);
        return {
          success: true,
          signature: result.signature,
          mintAddress: data.mintAddress
        };
      } else {
        this.logger.error('Buy transaction failed:', result.error);
        throw new Error(`Buy transaction failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Error in buyToken:', error.message, error.stack);
      throw new Error(`Failed to buy token: ${error.message}`);
    }
  }

  /**
   * Sells a specified amount of a token on Pump.fun.
   * @param data DTO containing mint address and amount (of tokens to sell).
   * @returns Transaction result with success status and signature.
   */
  async sellToken(data: SellTokenDto): Promise<any> {
    this.logger.log(`Attempting to sell ${data.amountTokens} tokens of ${data.mintAddress}`);
    try {
      const mint = new PublicKey(data.mintAddress);
      // Convert token amount to raw amount (multiply by decimals)
      const sellAmount = BigInt(Math.floor(data.amountTokens * Math.pow(10, DEFAULT_DECIMALS)));
      const SLIPPAGE_BASIS_POINTS = 500n; // 5% slippage

      const result = await this.pumpFunSdk.sell(
        this.payer,
        mint,
        sellAmount,
        SLIPPAGE_BASIS_POINTS,
        {
          unitLimit: 250000,
          unitPrice: 250000,
        }
      );

      if (result.success) {
        this.logger.log(`Sell transaction successful: ${result.signature}`);
        return {
          success: true,
          signature: result.signature,
          mintAddress: data.mintAddress
        };
      } else {
        this.logger.error('Sell transaction failed:', result.error);
        throw new Error(`Sell transaction failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Error in sellToken:', error.message, error.stack);
      throw new Error(`Failed to sell token: ${error.message}`);
    }
  }

  /**
   * Get token balance for the current wallet
   * @param mintAddress The mint address of the token
   * @returns Token balance
   */
  async getTokenBalance(mintAddress: string): Promise<number> {
    try {
      const mint = new PublicKey(mintAddress);
      // You'll need to implement getSPLBalance utility similar to the SDK example
      // This is a placeholder - you'll need to add the actual balance checking logic
      this.logger.log(`Getting balance for token: ${mintAddress}`);
      
      // For now, return 0 - you should implement proper balance checking
      return 0;
    } catch (error) {
      this.logger.error('Error getting token balance:', error.message);
      throw new Error(`Failed to get token balance: ${error.message}`);
    }
  }

  /**
   * Get bonding curve information for a token
   * @param mintAddress The mint address of the token
   * @returns Bonding curve account data
   */
  async getBondingCurve(mintAddress: string): Promise<any> {
    try {
      const mint = new PublicKey(mintAddress);
      const bondingCurve = await this.pumpFunSdk.getBondingCurveAccount(mint);
      return bondingCurve;
    } catch (error) {
      this.logger.error('Error getting bonding curve:', error.message);
      throw new Error(`Failed to get bonding curve: ${error.message}`);
    }
  }

  /**
   * Get global Pump.fun account information
   * @returns Global account data
   */
  async getGlobalAccount(): Promise<any> {
    try {
      const globalAccount = await this.pumpFunSdk.getGlobalAccount();
      return globalAccount;
    } catch (error) {
      this.logger.error('Error getting global account:', error.message);
      throw new Error(`Failed to get global account: ${error.message}`);
    }
  }
}