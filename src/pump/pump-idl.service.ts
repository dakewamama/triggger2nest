import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { BN } from '@project-serum/anchor';
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';

const PUMP_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const PUMP_GLOBAL = new PublicKey('4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf');
const PUMP_FEE_RECIPIENT = new PublicKey('CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM');
const PUMP_EVENT_AUTHORITY = new PublicKey('Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1');
const MPL_TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Constants for pump.fun
const TOKEN_DECIMALS = 6;
const TOTAL_SUPPLY = 1000000000; // 1 billion tokens

@Injectable()
export class PumpIdlService {
  private readonly logger = new Logger(PumpIdlService.name);
  private connection: Connection;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Create a token on pump.fun
   * NOTE: This is experimental based on reverse-engineered instructions
   */
  async createToken(params: {
    name: string;
    symbol: string;
    uri: string; // IPFS/Arweave URI for metadata
    creator: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      this.logger.log('Attempting to create pump.fun token');

      const creatorPubkey = new PublicKey(params.creator);
      const mintKeypair = Keypair.generate();
      
      // Derive PDAs
      const [bondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from('bonding-curve'), mintKeypair.publicKey.toBuffer()],
        PUMP_PROGRAM_ID
      );

      const [metadata] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          MPL_TOKEN_METADATA_PROGRAM.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        MPL_TOKEN_METADATA_PROGRAM
      );

      const associatedBondingCurve = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        bondingCurve,
        true
      );

      const transaction = new Transaction();

      // Add compute budget
      transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 250000 })
      );

      // Create instruction - this is the experimental part
      // Discriminator for 'create' (hypothetical - needs verification)
      const discriminator = Buffer.from([181, 157, 89, 67, 143, 182, 52, 72]);
      
      // Encode instruction data
      const nameBuffer = Buffer.alloc(32);
      nameBuffer.write(params.name.slice(0, 32));
      
      const symbolBuffer = Buffer.alloc(10);
      symbolBuffer.write(params.symbol.slice(0, 10));
      
      const uriBuffer = Buffer.alloc(200);
      uriBuffer.write(params.uri.slice(0, 200));

      const data = Buffer.concat([
        discriminator,
        nameBuffer,
        symbolBuffer,
        uriBuffer,
      ]);

      const keys = [
        { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: PUMP_GLOBAL, isSigner: false, isWritable: false },
        { pubkey: PUMP_FEE_RECIPIENT, isSigner: false, isWritable: true },
        { pubkey: bondingCurve, isSigner: false, isWritable: true },
        { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
        { pubkey: metadata, isSigner: false, isWritable: true },
        { pubkey: creatorPubkey, isSigner: true, isWritable: true },
        { pubkey: MPL_TOKEN_METADATA_PROGRAM, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: PUMP_EVENT_AUTHORITY, isSigner: false, isWritable: false },
        { pubkey: PUMP_PROGRAM_ID, isSigner: false, isWritable: false },
      ];

      transaction.add(
        new anchor.web3.TransactionInstruction({
          keys,
          programId: PUMP_PROGRAM_ID,
          data,
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = creatorPubkey;

      // Add mint as partial signer
      transaction.partialSign(mintKeypair);

      // Serialize for wallet to sign
      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      this.logger.log('Create transaction built (experimental)');

      return {
        success: true,
        data: {
          transaction: serializedTx.toString('base64'),
          mint: mintKeypair.publicKey.toString(),
          bondingCurve: bondingCurve.toString(),
          warning: 'This is experimental and may not work. Use pump.fun website for guaranteed token creation.',
        }
      };

    } catch (error: any) {
      this.logger.error('Failed to create token:', error);
      return {
        success: false,
        error: 'Token creation failed. This feature is experimental. Use pump.fun website for reliable token creation.',
      };
    }
  }

  /**
   * Simulate any pump.fun transaction
   */
  async simulateTransaction(
    transactionBase64: string
  ): Promise<{
    success: boolean;
    willSucceed: boolean;
    error?: string;
    logs?: string[];
    message?: string;
  }> {
    try {
      const transaction = Transaction.from(Buffer.from(transactionBase64, 'base64'));
      
      // Get fresh blockhash for simulation
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const simulation = await this.connection.simulateTransaction(transaction);
      
      const willSucceed = !simulation.value.err;
      
      if (!willSucceed) {
        // Parse error for user-friendly message
        const errorStr = JSON.stringify(simulation.value.err);
        let message = 'Transaction would fail';
        
        if (errorStr.includes('0x1') || errorStr.includes('InsufficientFunds')) {
          message = 'Insufficient SOL balance. You need to fund your wallet.';
        } else if (errorStr.includes('0x0')) {
          message = 'Account not initialized. The token might not exist.';
        } else if (errorStr.includes('custom program error')) {
          message = 'Program error. The operation is not valid.';
        }

        return {
          success: true,
          willSucceed: false,
          error: errorStr,
          message,
          logs: simulation.value.logs || [],
        };
      }

      return {
        success: true,
        willSucceed: true,
        message: 'Transaction will succeed!',
        logs: simulation.value.logs || [],
      };

    } catch (error: any) {
      this.logger.error('Simulation failed:', error);
      return {
        success: false,
        willSucceed: false,
        error: error.message,
        message: 'Failed to simulate transaction',
      };
    }
  }
}