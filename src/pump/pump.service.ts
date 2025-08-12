import { Injectable, Logger } from '@nestjs/common';
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ConfigService } from '@nestjs/config';
import { DEFAULT_DECIMALS, PumpFunSDK } from 'pumpdotfun-sdk';
import { AnchorProvider } from '@coral-xyz/anchor';
// Fixed NodeWallet import problem
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { CreateTokenDto, BuyTokenDto, SellTokenDto } from './dto/pump.dto';
import * as fs from 'fs';

@Injectable()
export class PumpService {
  private readonly logger = new Logger(PumpService.name);
  private connection: Connection;
  private payer: Keypair;
  private provider: AnchorProvider;
  private pumpFunSdk: PumpFunSDK;
  private readonly rpcUrl: string;
  private readonly programId: PublicKey;

  constructor(private configService: ConfigService) {
    //boggey the connection to soL RPC
    this.rpcUrl = this.configService.get<string>('SOLANA_RPC_URL') || 'https://api.devnet.solana.com';
    this.connection = new Connection(this.rpcUrl, 'confirmed');

    // Set the correct program ID
    this.programId = new PublicKey(
      this.configService.get<string>('PUMP_PROGRAM_ID') ||
        '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
    );

    // Load or generate payer keypair
    const privateKey = this.configService.get<string>('SOLANA_PRIVATE_KEY');
    if (!privateKey) {
      this.logger.error('SOLANA_PRIVATE_KEY not set; generating a random keypair (dev only).');
      this.payer = Keypair.generate();
    } else {
      try {
        const secret = JSON.parse(privateKey);
        this.payer = Keypair.fromSecretKey(new Uint8Array(secret));
        this.logger.log(`Wallet loaded: ${this.payer.publicKey.toBase58()}`);
      } catch (err) {
        this.logger.error('Failed to parse SOLANA_PRIVATE_KEY; generating random keypair', err);
        this.payer = Keypair.generate();
        this.logger.log(`Generated dev Wallet: ${this.payer.publicKey.toBase58()}`);
      }
    }

    // Anchor provider
    const wallet = new NodeWallet(this.payer);
    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    });

    // Initialize PumpFunSDK (it uses default program ID internally)
    this.pumpFunSdk = new PumpFunSDK(this.provider);
    this.logger.log(`Using Pump.fun program: ${this.programId.toBase58()}`);
  }

  // Helper method to convert Buffer to Blob safely
  private bufferToBlob(buffer: Buffer): Blob {
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    return new Blob([arrayBuffer]);
  }

  async createToken(
    data: CreateTokenDto,
    buyAmountSol: number = 0.001,
    imageFile?: Buffer,
    imageFilePath?: string
  ): Promise<any> {
    this.logger.log(`Attempting to create token: ${data.name} (${data.symbol})`);
    try {
      const balance = await this.connection.getBalance(this.payer.publicKey);
      const balanceInSol = balance / LAMPORTS_PER_SOL;
      if (balanceInSol < buyAmountSol + 0.01) {
        throw new Error(`Insufficient SOL: need ${buyAmountSol + 0.01}, have ${balanceInSol}`);
      }

      const mint = Keypair.generate();
      this.logger.log(`Generated mint: ${mint.publicKey.toBase58()}`);

      const [creatorVault] = await PublicKey.findProgramAddress(
        [Buffer.from('creator_vault'), this.payer.publicKey.toBuffer(), mint.publicKey.toBuffer()],
        this.programId
      );
      this.logger.log(`Expected creator vault: ${creatorVault.toBase58()}`);

      let fileBuffer: Buffer | undefined = imageFile;
      if (!fileBuffer && imageFilePath) {
        try {
          fileBuffer = await fs.promises.readFile(imageFilePath);
        } catch {
          this.logger.warn('Failed to read image file, using empty buffer');
          fileBuffer = Buffer.alloc(0);
        }
      }

      const fileBlob = fileBuffer && fileBuffer.length > 0 ? this.bufferToBlob(fileBuffer) : new Blob();

      const tokenMetadata = {
        name: data.name,
        symbol: data.symbol,
        description: data.description || '',
        file: fileBlob,
      };

      const buyLamports = BigInt(Math.floor(buyAmountSol * LAMPORTS_PER_SOL));
      const slippage = 500n;

      const computeBudgetOpts = {
        unitLimit: 300000,
        unitPrice: 1000000,
      };

      const result = await this.pumpFunSdk.createAndBuy(
        this.payer,
        mint,
        tokenMetadata,
        buyLamports,
        slippage,
        computeBudgetOpts
      );

      if (result.success) {
        return {
          success: true,
          signature: result.signature,
          mintAddress: mint.publicKey.toBase58(),
          pumpUrl: `https://pump.fun/${mint.publicKey.toBase58()}`,
          creatorVault: creatorVault.toBase58(),
        };
      } else {
        this.logger.error('CreateAndBuy failed:', result.error);
        throw new Error(`Token creation failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Error in createToken:', error);

      if (error.message.includes('ConstraintSeeds')) {
        throw new Error('PDA seed constraint violation: verify program ID and account derivation');
      } else if (error.message.includes('0x7d6')) {
        throw new Error('Anchor constraint violation: check account seeds and program ID');
      } else {
        throw new Error(`Token creation failed: ${error.message}`);
      }
    }
  }

  async createTokenOnly(data: CreateTokenDto, imageFile?: Buffer): Promise<any> {
    this.logger.log(`Creating token with minimal buy: ${data.name} (${data.symbol})`);
    try {
      const mint = Keypair.generate();
      const fileBlob = imageFile && imageFile.length > 0 ? this.bufferToBlob(imageFile) : new Blob();

      const tokenMetadata = {
        name: data.name,
        symbol: data.symbol,
        description: data.description || '',
        file: fileBlob,
      };

      const minimalBuyLamports = BigInt(Math.floor(0.0001 * LAMPORTS_PER_SOL));
      const slippage = 500n;
      const computeBudgetOpts = { unitLimit: 200000, unitPrice: 1000000 };

      const result = await this.pumpFunSdk.createAndBuy(
        this.payer,
        mint,
        tokenMetadata,
        minimalBuyLamports,
        slippage,
        computeBudgetOpts
      );

      if (result.success) {
        return {
          success: true,
          signature: result.signature,
          mintAddress: mint.publicKey.toBase58(),
          pumpUrl: `https://pump.fun/${mint.publicKey.toBase58()}`,
        };
      } else {
        throw new Error(`Token creation failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Error in createTokenOnly:', error);
      throw new Error(`Token creation failed: ${error.message}`);
    }
  }

  async buyToken(data: BuyTokenDto): Promise<any> {
    this.logger.log(`Attempting to buy ${data.amountSol} SOL of ${data.mintAddress}`);
    try {
      const balance = await this.connection.getBalance(this.payer.publicKey);
      const balanceInSol = balance / LAMPORTS_PER_SOL;
      if (balanceInSol < data.amountSol + 0.01) {
        throw new Error(`Insufficient SOL: need ${data.amountSol + 0.01}, have ${balanceInSol}`);
      }

      const mint = new PublicKey(data.mintAddress);
      const buyLamports = BigInt(Math.floor(data.amountSol * LAMPORTS_PER_SOL));
      const slippage = 500n;
      const computeBudgetOpts = { unitLimit: 300000, unitPrice: 1000000 };

      const bondingCurve = await this.getBondingCurve(data.mintAddress);
      if (!bondingCurve) {
        throw new Error('Token bonding curve not found - token may not exist on Pump.fun');
      }

      const result = await this.pumpFunSdk.buy(
        this.payer,
        mint,
        buyLamports,
        slippage,
        computeBudgetOpts
      );

      if (result.success) {
        return { success: true, signature: result.signature };
      } else {
        throw new Error(`Buy failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Error in buyToken:', error.message);
      throw new Error(error.message);
    }
  }

  async sellToken(data: SellTokenDto): Promise<any> {
    this.logger.log(`Attempting to sell ${data.amountTokens} of ${data.mintAddress}`);
    try {
      const mint = new PublicKey(data.mintAddress);
      const sellAmount = BigInt(Math.floor(data.amountTokens * Math.pow(10, DEFAULT_DECIMALS)));
      const slippage = 500n;
      const computeBudgetOpts = { unitLimit: 300000, unitPrice: 1000000 };

      const result = await this.pumpFunSdk.sell(
        this.payer,
        mint,
        sellAmount,
        slippage,
        computeBudgetOpts
      );

      if (result.success) {
        return { success: true, signature: result.signature };
      } else {
        throw new Error(`Sell failed: ${result.error}`);
      }
    } catch (error) {
      this.logger.error('Error in sellToken:', error.message);
      throw new Error(error.message);
    }
  }

  async getTokenBalance(mintAddress: string): Promise<number> {
    const mint = new PublicKey(mintAddress);
    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
    const ata = await getAssociatedTokenAddress(mint, this.payer.publicKey);
    try {
      const bal = await this.connection.getTokenAccountBalance(ata);
      return bal.value.uiAmount || 0;
    } catch {
      return 0;
    }
  }

  async getBondingCurve(mintAddress: string): Promise<any> {
    try {
      const mint = new PublicKey(mintAddress);
      return await this.pumpFunSdk.getBondingCurveAccount(mint);
    } catch (error) {
      this.logger.warn(`Failed to get bonding curve for ${mintAddress}:`, error.message);
      return null;
    }
  }

  async getGlobalAccount(): Promise<any> {
    return this.pumpFunSdk.getGlobalAccount();
  }

  async getWalletBalance(): Promise<number> {
    const bal = await this.connection.getBalance(this.payer.publicKey);
    return bal / LAMPORTS_PER_SOL;
  }

  getWalletAddress(): string {
    return this.payer.publicKey.toBase58();
  }

  async debugPDADerivation(mintAddress: string): Promise<any> {
    const mint = new PublicKey(mintAddress);

    const [creatorVault, creatorVaultBump] = await PublicKey.findProgramAddress(
      [Buffer.from('creator_vault'), this.payer.publicKey.toBuffer(), mint.toBuffer()],
      this.programId
    );

    const [bondingCurve, bondingCurveBump] = await PublicKey.findProgramAddress(
      [Buffer.from('bonding_curve'), mint.toBuffer()],
      this.programId
    );

    return {
      mint: mint.toBase58(),
      creator: this.payer.publicKey.toBase58(),
      programId: this.programId.toBase58(),
      creatorVault: creatorVault.toBase58(),
      creatorVaultBump,
      bondingCurve: bondingCurve.toBase58(),
      bondingCurveBump,
    };
  }
}
