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
  TransactionInstruction,
} from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
} from '@solana/spl-token';

// Program constants
const PUMP_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const PUMP_GLOBAL = new PublicKey('4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf');
const PUMP_FEE_RECIPIENT = new PublicKey('CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM');
const PUMP_EVENT_AUTHORITY = new PublicKey('Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1');
const MPL_TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const RENT = new PublicKey('SysvarRent111111111111111111111111111111111');

// Bonding curve constants (from pump.fun)
const TOKEN_DECIMALS = 6;
const TOTAL_SUPPLY = 1_000_000_000; // 1 billion tokens with 6 decimals
const INITIAL_VIRTUAL_TOKEN_RESERVES = new BN(1073000000).mul(new BN(10).pow(new BN(TOKEN_DECIMALS)));
const INITIAL_VIRTUAL_SOL_RESERVES = new BN(30).mul(new BN(LAMPORTS_PER_SOL));
const INITIAL_REAL_TOKEN_RESERVES = new BN(793100000).mul(new BN(10).pow(new BN(TOKEN_DECIMALS)));
const CREATE_FEE = 0.02 * LAMPORTS_PER_SOL; // 0.02 SOL creation fee

@Injectable()
export class PumpIdlService {
  private readonly logger = new Logger(PumpIdlService.name);
  private connection: Connection;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Create a token on pump.fun with bonding curve
   * Based on the official pump.fun IDL 'create' instruction
   */
  async createToken(params: {
    name: string;
    symbol: string;
    uri: string; // IPFS/Arweave URI for metadata
    creator: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      this.logger.log('Creating pump.fun token with bonding curve');

      const creatorPubkey = new PublicKey(params.creator);
      const mintKeypair = Keypair.generate();
      
      // Derive mint authority PDA (used by pump.fun)
      const [mintAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from('mint-authority')],
        PUMP_PROGRAM_ID
      );

      // Derive bonding curve PDA
      const [bondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from('bonding-curve'), mintKeypair.publicKey.toBuffer()],
        PUMP_PROGRAM_ID
      );

      // Get associated token account for bonding curve
      const associatedBondingCurve = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        bondingCurve,
        true // Allow PDA owner
      );

      // Derive metadata PDA (Metaplex standard)
      const [metadata] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          MPL_TOKEN_METADATA_PROGRAM.toBuffer(),
          mintKeypair.publicKey.toBuffer(),
        ],
        MPL_TOKEN_METADATA_PROGRAM
      );

      const transaction = new Transaction();

      // Add priority fee for better confirmation
      transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 350000 }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50000 })
      );

      // Build create instruction based on IDL
      const createInstruction = await this.buildCreateInstruction({
        mint: mintKeypair.publicKey,
        mintAuthority,
        bondingCurve,
        associatedBondingCurve,
        global: PUMP_GLOBAL,
        mplTokenMetadata: MPL_TOKEN_METADATA_PROGRAM,
        metadata,
        user: creatorPubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: RENT,
        eventAuthority: PUMP_EVENT_AUTHORITY,
        program: PUMP_PROGRAM_ID,
        name: params.name,
        symbol: params.symbol,
        uri: params.uri,
      });

      transaction.add(createInstruction);

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = creatorPubkey;

      // Sign with mint keypair (required as it's a signer in the instruction)
      transaction.partialSign(mintKeypair);

      // Serialize for wallet to sign
      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      this.logger.log(`Token creation transaction prepared - Mint: ${mintKeypair.publicKey.toString()}`);

      return {
        success: true,
        data: {
          transaction: serializedTx.toString('base64'),
          mint: mintKeypair.publicKey.toString(),
          bondingCurve: bondingCurve.toString(),
          associatedBondingCurve: associatedBondingCurve.toString(),
          metadata: metadata.toString(),
          lastValidBlockHeight,
          message: 'Transaction ready for signing. Requires 0.02 SOL creation fee plus gas.',
          tokenInfo: {
            totalSupply: TOTAL_SUPPLY,
            decimals: TOKEN_DECIMALS,
            initialLiquidity: {
              virtualTokenReserves: INITIAL_VIRTUAL_TOKEN_RESERVES.toString(),
              virtualSolReserves: INITIAL_VIRTUAL_SOL_RESERVES.toString(),
              realTokenReserves: INITIAL_REAL_TOKEN_RESERVES.toString(),
            }
          }
        }
      };

    } catch (error: any) {
      this.logger.error('Failed to create token:', error);
      return {
        success: false,
        error: error.message || 'Failed to create token transaction',
      };
    }
  }

  /**
   * Build the create instruction according to pump.fun IDL
   */
  private buildCreateInstruction(params: {
    mint: PublicKey;
    mintAuthority: PublicKey;
    bondingCurve: PublicKey;
    associatedBondingCurve: PublicKey;
    global: PublicKey;
    mplTokenMetadata: PublicKey;
    metadata: PublicKey;
    user: PublicKey;
    systemProgram: PublicKey;
    tokenProgram: PublicKey;
    associatedTokenProgram: PublicKey;
    rent: PublicKey;
    eventAuthority: PublicKey;
    program: PublicKey;
    name: string;
    symbol: string;
    uri: string;
  }): TransactionInstruction {
    // Instruction discriminator for 'create' (8 bytes)
    // This is the Anchor-generated discriminator from the IDL
    const discriminator = Buffer.from([0x18, 0x1e, 0xc8, 0x28, 0x05, 0x1c, 0x07, 0x77]);

    // Encode instruction data
    // String encoding for Anchor: 4 bytes length + string bytes
    const nameBytes = Buffer.from(params.name);
    const symbolBytes = Buffer.from(params.symbol);
    const uriBytes = Buffer.from(params.uri);

    // Build data buffer with proper encoding
    const data = Buffer.concat([
      discriminator,
      // Name: 4 bytes length + string
      Buffer.from(new Uint8Array(new BN(nameBytes.length).toArray('le', 4))),
      nameBytes,
      // Symbol: 4 bytes length + string
      Buffer.from(new Uint8Array(new BN(symbolBytes.length).toArray('le', 4))),
      symbolBytes,
      // URI: 4 bytes length + string
      Buffer.from(new Uint8Array(new BN(uriBytes.length).toArray('le', 4))),
      uriBytes,
    ]);

    // Build accounts array according to IDL
    const keys = [
      { pubkey: params.mint, isSigner: true, isWritable: true },
      { pubkey: params.mintAuthority, isSigner: false, isWritable: false },
      { pubkey: params.bondingCurve, isSigner: false, isWritable: true },
      { pubkey: params.associatedBondingCurve, isSigner: false, isWritable: true },
      { pubkey: params.global, isSigner: false, isWritable: false },
      { pubkey: params.mplTokenMetadata, isSigner: false, isWritable: false },
      { pubkey: params.metadata, isSigner: false, isWritable: true },
      { pubkey: params.user, isSigner: true, isWritable: true },
      { pubkey: params.systemProgram, isSigner: false, isWritable: false },
      { pubkey: params.tokenProgram, isSigner: false, isWritable: false },
      { pubkey: params.associatedTokenProgram, isSigner: false, isWritable: false },
      { pubkey: params.rent, isSigner: false, isWritable: false },
      { pubkey: params.eventAuthority, isSigner: false, isWritable: false },
      { pubkey: params.program, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
      keys,
      programId: PUMP_PROGRAM_ID,
      data,
    });
  }

  /**
   * Buy tokens from bonding curve
   */
  async buyToken(params: {
    mint: string;
    buyer: string;
    solAmount: number; // in SOL
    slippage?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const mintPubkey = new PublicKey(params.mint);
      const buyerPubkey = new PublicKey(params.buyer);
      
      // Derive bonding curve
      const [bondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from('bonding-curve'), mintPubkey.toBuffer()],
        PUMP_PROGRAM_ID
      );

      // Get associated token accounts
      const associatedBondingCurve = await getAssociatedTokenAddress(
        mintPubkey,
        bondingCurve,
        true
      );

      const associatedUser = await getAssociatedTokenAddress(
        mintPubkey,
        buyerPubkey
      );

      const transaction = new Transaction();

      // Add compute budget
      transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 200000 }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50000 })
      );

      // Calculate amount and slippage
      const solLamports = new BN(params.solAmount * LAMPORTS_PER_SOL);
      const slippage = params.slippage || 0.01; // 1% default
      const maxSolCost = solLamports.mul(new BN(1 + slippage * 100)).div(new BN(100));

      // Build buy instruction
      const buyInstruction = this.buildBuyInstruction({
        global: PUMP_GLOBAL,
        feeRecipient: PUMP_FEE_RECIPIENT,
        mint: mintPubkey,
        bondingCurve,
        associatedBondingCurve,
        associatedUser,
        user: buyerPubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: RENT,
        eventAuthority: PUMP_EVENT_AUTHORITY,
        program: PUMP_PROGRAM_ID,
        amount: solLamports,
        maxSolCost,
      });

      transaction.add(buyInstruction);

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = buyerPubkey;

      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      return {
        success: true,
        data: {
          transaction: serializedTx.toString('base64'),
          message: 'Buy transaction ready for signing',
        }
      };

    } catch (error: any) {
      this.logger.error('Failed to create buy transaction:', error);
      return {
        success: false,
        error: error.message || 'Failed to create buy transaction',
      };
    }
  }

  /**
   * Build buy instruction according to IDL
   */
  private buildBuyInstruction(params: {
    global: PublicKey;
    feeRecipient: PublicKey;
    mint: PublicKey;
    bondingCurve: PublicKey;
    associatedBondingCurve: PublicKey;
    associatedUser: PublicKey;
    user: PublicKey;
    systemProgram: PublicKey;
    tokenProgram: PublicKey;
    rent: PublicKey;
    eventAuthority: PublicKey;
    program: PublicKey;
    amount: BN;
    maxSolCost: BN;
  }): TransactionInstruction {
    // Discriminator for 'buy'
    const discriminator = Buffer.from([0x66, 0x06, 0x3d, 0x12, 0x01, 0xda, 0xeb, 0xea]);

    // Encode data
    const data = Buffer.concat([
      discriminator,
      params.amount.toArrayLike(Buffer, 'le', 8),
      params.maxSolCost.toArrayLike(Buffer, 'le', 8),
    ]);

    const keys = [
      { pubkey: params.global, isSigner: false, isWritable: false },
      { pubkey: params.feeRecipient, isSigner: false, isWritable: true },
      { pubkey: params.mint, isSigner: false, isWritable: false },
      { pubkey: params.bondingCurve, isSigner: false, isWritable: true },
      { pubkey: params.associatedBondingCurve, isSigner: false, isWritable: true },
      { pubkey: params.associatedUser, isSigner: false, isWritable: true },
      { pubkey: params.user, isSigner: true, isWritable: true },
      { pubkey: params.systemProgram, isSigner: false, isWritable: false },
      { pubkey: params.tokenProgram, isSigner: false, isWritable: false },
      { pubkey: params.rent, isSigner: false, isWritable: false },
      { pubkey: params.eventAuthority, isSigner: false, isWritable: false },
      { pubkey: params.program, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
      keys,
      programId: PUMP_PROGRAM_ID,
      data,
    });
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
    unitsConsumed?: number;
  }> {
    try {
      const transaction = Transaction.from(Buffer.from(transactionBase64, 'base64'));
      
      // Get fresh blockhash for simulation
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const simulation = await this.connection.simulateTransaction(transaction);
      
      const willSucceed = !simulation.value.err;
      
      return {
        success: true,
        willSucceed,
        error: simulation.value.err ? JSON.stringify(simulation.value.err) : undefined,
        logs: simulation.value.logs || [],
        unitsConsumed: simulation.value.unitsConsumed || 0,
      };

    } catch (error: any) {
      this.logger.error('Simulation failed:', error);
      return {
        success: false,
        willSucceed: false,
        error: error.message,
      };
    }
  }
}