import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  Keypair,
} from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import { BN } from '@project-serum/anchor';
import { 
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import * as bs58 from 'bs58';

// Pump.fun Program ID (mainnet)
const PUMP_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');

// Pump.fun Global State
const PUMP_GLOBAL = new PublicKey('4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf');

// Pump.fun Fee Recipient
const PUMP_FEE_RECIPIENT = new PublicKey('CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM');

// Event Authority
const PUMP_EVENT_AUTHORITY = new PublicKey('Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1');

// Constants
const VIRTUAL_SOL_RESERVES = 30 * LAMPORTS_PER_SOL;
const VIRTUAL_TOKEN_RESERVES = 1073000000 * 1000000;
const INITIAL_REAL_TOKEN_RESERVES = 793100000 * 1000000;
const TOKEN_DECIMALS = 6;

@Injectable()
export class PumpDirectService {
  private readonly logger = new Logger(PumpDirectService.name);
  private connection: Connection;
  private program: anchor.Program | null = null;

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    this.initializeProgram();
  }

  private async initializeProgram() {
    try {
      const provider = new anchor.AnchorProvider(
        this.connection,
        {} as any, // We'll use wallet-less provider
        { commitment: 'confirmed' }
      );
      
      // Since we don't have IDL JSON, we'll construct instructions manually
      this.logger.log('Pump.fun direct service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize program:', error);
    }
  }

  /**
   * Calculate buy amount using bonding curve formula
   */
  private calculateBuyAmount(solAmount: number): number {
    const solLamports = solAmount * LAMPORTS_PER_SOL;
    const productOfReserves = VIRTUAL_SOL_RESERVES * VIRTUAL_TOKEN_RESERVES;
    const newSolReserves = VIRTUAL_SOL_RESERVES + solLamports;
    const newTokenReserves = productOfReserves / newSolReserves;
    const tokensOut = VIRTUAL_TOKEN_RESERVES - newTokenReserves;
    
    // Apply 1% fee
    const tokensAfterFee = tokensOut * 0.99;
    
    return Math.floor(tokensAfterFee / 1000000); // Convert to token units
  }

  /**
   * Calculate sell return using bonding curve formula
   */
  private calculateSellReturn(tokenAmount: number): number {
    const tokenLamports = tokenAmount * 1000000;
    const productOfReserves = VIRTUAL_SOL_RESERVES * VIRTUAL_TOKEN_RESERVES;
    const newTokenReserves = VIRTUAL_TOKEN_RESERVES + tokenLamports;
    const newSolReserves = productOfReserves / newTokenReserves;
    const solOut = VIRTUAL_SOL_RESERVES - newSolReserves;
    
    // Apply 1% fee
    const solAfterFee = solOut * 0.99;
    
    return solAfterFee / LAMPORTS_PER_SOL; // Convert to SOL
  }

  /**
   * Get bonding curve PDA for a token
   */
  private async getBondingCurve(mint: PublicKey): Promise<PublicKey> {
    const [bondingCurve] = await PublicKey.findProgramAddress(
      [Buffer.from('bonding-curve'), mint.toBuffer()],
      PUMP_PROGRAM_ID
    );
    return bondingCurve;
  }

  /**
   * Create buy instruction
   */
  private async createBuyInstruction(
    buyer: PublicKey,
    mint: PublicKey,
    solAmount: number,
    minTokens: number
  ): Promise<anchor.web3.TransactionInstruction> {
    const bondingCurve = await this.getBondingCurve(mint);
    const associatedBondingCurve = await getAssociatedTokenAddress(
      mint,
      bondingCurve,
      true
    );
    const associatedUser = await getAssociatedTokenAddress(
      mint,
      buyer
    );

    // Instruction discriminator for 'buy' (first 8 bytes of sha256('global:buy'))
    const discriminator = Buffer.from([102, 6, 61, 18, 1, 218, 235, 234]);
    
    // Encode instruction data
    const data = Buffer.concat([
      discriminator,
      new BN(solAmount * LAMPORTS_PER_SOL).toArrayLike(Buffer, 'le', 8),
      new BN(minTokens * 1000000).toArrayLike(Buffer, 'le', 8),
    ]);

    const keys = [
      { pubkey: PUMP_GLOBAL, isSigner: false, isWritable: false },
      { pubkey: PUMP_FEE_RECIPIENT, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: bondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedUser, isSigner: false, isWritable: true },
      { pubkey: buyer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: PUMP_EVENT_AUTHORITY, isSigner: false, isWritable: false },
      { pubkey: PUMP_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    return new anchor.web3.TransactionInstruction({
      keys,
      programId: PUMP_PROGRAM_ID,
      data,
    });
  }

  /**
   * Create sell instruction
   */
  private async createSellInstruction(
    seller: PublicKey,
    mint: PublicKey,
    tokenAmount: number,
    minSol: number
  ): Promise<anchor.web3.TransactionInstruction> {
    const bondingCurve = await this.getBondingCurve(mint);
    const associatedBondingCurve = await getAssociatedTokenAddress(
      mint,
      bondingCurve,
      true
    );
    const associatedUser = await getAssociatedTokenAddress(
      mint,
      seller
    );

    // Instruction discriminator for 'sell' (first 8 bytes of sha256('global:sell'))
    const discriminator = Buffer.from([51, 230, 133, 164, 1, 127, 131, 173]);
    
    // Encode instruction data
    const data = Buffer.concat([
      discriminator,
      new BN(tokenAmount * 1000000).toArrayLike(Buffer, 'le', 8),
      new BN(minSol * LAMPORTS_PER_SOL).toArrayLike(Buffer, 'le', 8),
    ]);

    const keys = [
      { pubkey: PUMP_GLOBAL, isSigner: false, isWritable: false },
      { pubkey: PUMP_FEE_RECIPIENT, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: bondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedUser, isSigner: false, isWritable: true },
      { pubkey: seller, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: PUMP_EVENT_AUTHORITY, isSigner: false, isWritable: false },
      { pubkey: PUMP_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    return new anchor.web3.TransactionInstruction({
      keys,
      programId: PUMP_PROGRAM_ID,
      data,
    });
  }

  /**
   * Build buy transaction
   */
  async buildBuyTransaction(params: {
    mint: string;
    buyer: string;
    solAmount: number;
    slippage?: number;
    priorityFee?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      this.logger.log('Building buy transaction:', params);

      const mintPubkey = new PublicKey(params.mint);
      const buyerPubkey = new PublicKey(params.buyer);
      
      // Calculate expected tokens with slippage
      const expectedTokens = this.calculateBuyAmount(params.solAmount);
      const slippage = params.slippage || 1; // Default 1%
      const minTokens = Math.floor(expectedTokens * (1 - slippage / 100));

      this.logger.log(`Buying ${params.solAmount} SOL worth, expecting ~${expectedTokens} tokens (min: ${minTokens})`);

      const transaction = new Transaction();

      // Add priority fee if specified
      if (params.priorityFee && params.priorityFee > 0) {
        const microLamports = Math.floor(params.priorityFee * LAMPORTS_PER_SOL * 1000000);
        transaction.add(
          ComputeBudgetProgram.setComputeUnitPrice({ microLamports })
        );
      }

      // Check if user has token account, create if not
      const userTokenAccount = await getAssociatedTokenAddress(mintPubkey, buyerPubkey);
      const accountInfo = await this.connection.getAccountInfo(userTokenAccount);
      
      if (!accountInfo) {
        this.logger.log('Creating associated token account for user');
        transaction.add(
          createAssociatedTokenAccountInstruction(
            buyerPubkey,
            userTokenAccount,
            buyerPubkey,
            mintPubkey
          )
        );
      }

      // Add buy instruction
      const buyIx = await this.createBuyInstruction(
        buyerPubkey,
        mintPubkey,
        params.solAmount,
        minTokens
      );
      transaction.add(buyIx);

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = buyerPubkey;

      // Serialize transaction
      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const base64Tx = serializedTx.toString('base64');

      this.logger.log('Buy transaction built successfully');

      return {
        success: true,
        data: {
          transaction: base64Tx,
          mint: params.mint,
          expectedTokens,
          minTokens,
          solAmount: params.solAmount,
        },
      };
    } catch (error: any) {
      this.logger.error('Failed to build buy transaction:', error);
      return {
        success: false,
        error: error.message || 'Failed to build buy transaction',
      };
    }
  }

  /**
   * Build sell transaction
   */
  async buildSellTransaction(params: {
    mint: string;
    seller: string;
    tokenAmount: number;
    slippage?: number;
    priorityFee?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      this.logger.log('Building sell transaction:', params);

      const mintPubkey = new PublicKey(params.mint);
      const sellerPubkey = new PublicKey(params.seller);
      
      // Calculate expected SOL with slippage
      const expectedSol = this.calculateSellReturn(params.tokenAmount);
      const slippage = params.slippage || 1; // Default 1%
      const minSol = expectedSol * (1 - slippage / 100);

      this.logger.log(`Selling ${params.tokenAmount} tokens, expecting ~${expectedSol} SOL (min: ${minSol})`);

      const transaction = new Transaction();

      // Add priority fee if specified
      if (params.priorityFee && params.priorityFee > 0) {
        const microLamports = Math.floor(params.priorityFee * LAMPORTS_PER_SOL * 1000000);
        transaction.add(
          ComputeBudgetProgram.setComputeUnitPrice({ microLamports })
        );
      }

      // Add sell instruction
      const sellIx = await this.createSellInstruction(
        sellerPubkey,
        mintPubkey,
        params.tokenAmount,
        minSol
      );
      transaction.add(sellIx);

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sellerPubkey;

      // Serialize transaction
      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      const base64Tx = serializedTx.toString('base64');

      this.logger.log('Sell transaction built successfully');

      return {
        success: true,
        data: {
          transaction: base64Tx,
          mint: params.mint,
          tokenAmount: params.tokenAmount,
          expectedSol,
          minSol,
        },
      };
    } catch (error: any) {
      this.logger.error('Failed to build sell transaction:', error);
      return {
        success: false,
        error: error.message || 'Failed to build sell transaction',
      };
    }
  }

  /**
   * Get token info from blockchain
   */
  async getTokenInfo(mint: string): Promise<any> {
    try {
      const mintPubkey = new PublicKey(mint);
      const bondingCurve = await this.getBondingCurve(mintPubkey);
      
      // Get bonding curve account data
      const accountInfo = await this.connection.getAccountInfo(bondingCurve);
      
      if (accountInfo) {
        // Parse bonding curve data (you'd need to decode based on the actual structure)
        return {
          success: true,
          data: {
            mint,
            bondingCurve: bondingCurve.toString(),
            exists: true,
            // Add more fields as needed
          },
        };
      }
      
      return {
        success: false,
        error: 'Token not found on pump.fun',
      };
    } catch (error: any) {
      this.logger.error('Failed to get token info:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get price quote
   */
  async getQuote(mint: string, amount: number, action: 'buy' | 'sell'): Promise<any> {
    try {
      if (action === 'buy') {
        const tokensOut = this.calculateBuyAmount(amount);
        return {
          success: true,
          data: {
            inputAmount: amount,
            outputAmount: tokensOut,
            price: amount / tokensOut,
            priceImpact: 0.1, // Calculate actual impact based on curve
            slippage: 1,
            fees: amount * 0.01, // 1% fee
          },
        };
      } else {
        const solOut = this.calculateSellReturn(amount);
        return {
          success: true,
          data: {
            inputAmount: amount,
            outputAmount: solOut,
            price: solOut / amount,
            priceImpact: 0.1,
            slippage: 1,
            fees: amount * 0.01,
          },
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Simulate transaction to check if it would succeed
   */
  async simulateTransaction(
    transactionBase64: string,
    includeAccounts?: boolean
  ): Promise<{
    success: boolean;
    willSucceed: boolean;
    error?: string;
    logs?: string[];
    unitsConsumed?: number;
    accountData?: any[];
  }> {
    try {
      this.logger.log('Simulating transaction...');
      
      // Decode the transaction
      const transaction = Transaction.from(
        Buffer.from(transactionBase64, 'base64')
      );

      // Get fresh blockhash for simulation
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Simulate the transaction - using correct signature for @solana/web3.js
      const simulation = await this.connection.simulateTransaction(
        transaction
      );

      const willSucceed = !simulation.value.err;
      
      this.logger.log(`Simulation result: ${willSucceed ? 'SUCCESS' : 'FAILED'}`);
      if (simulation.value.logs) {
        this.logger.log('Simulation logs:', simulation.value.logs);
      }
      if (simulation.value.err) {
        this.logger.error('Simulation error:', simulation.value.err);
      }

      return {
        success: true,
        willSucceed,
        error: simulation.value.err ? JSON.stringify(simulation.value.err) : undefined,
        logs: simulation.value.logs || [],
        unitsConsumed: simulation.value.unitsConsumed || 0,
        accountData: simulation.value.accounts || []
      };
    } catch (error: any) {
      this.logger.error('Failed to simulate transaction:', error);
      return {
        success: false,
        willSucceed: false,
        error: error.message || 'Failed to simulate transaction',
      };
    }
  }

  /**
   * Build and simulate buy transaction
   */
  async buildAndSimulateBuyTransaction(params: {
    mint: string;
    buyer: string;
    solAmount: number;
    slippage?: number;
    priorityFee?: number;
    simulate?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string; simulation?: any }> {
    try {
      // First build the transaction
      const buildResult = await this.buildBuyTransaction(params);
      
      if (!buildResult.success || !buildResult.data?.transaction) {
        return buildResult;
      }

      // If simulation is requested
      if (params.simulate !== false) { // Default to true
        this.logger.log('Running simulation for buy transaction...');
        const simulationResult = await this.simulateTransaction(
          buildResult.data.transaction,
          false
        );

        // Add simulation result to response
        buildResult.data.simulation = {
          willSucceed: simulationResult.willSucceed,
          error: simulationResult.error,
          logs: simulationResult.logs,
          unitsConsumed: simulationResult.unitsConsumed,
        };

        // Add warning if simulation failed
        if (!simulationResult.willSucceed) {
          buildResult.data.warning = 'Transaction simulation failed. This transaction will likely fail if submitted.';
          
          // Parse common errors
          const errorStr = simulationResult.error || '';
          if (errorStr.includes('InsufficientFunds') || errorStr.includes('0x1')) {
            buildResult.data.warning = 'Insufficient SOL balance for this transaction.';
          } else if (errorStr.includes('SlippageExceeded')) {
            buildResult.data.warning = 'Price moved too much. Try increasing slippage.';
          } else if (errorStr.includes('AccountNotFound')) {
            buildResult.data.warning = 'Token or bonding curve account not found. Token may have graduated.';
          }
        }
      }

      return buildResult;
    } catch (error: any) {
      this.logger.error('Failed to build and simulate buy transaction:', error);
      return {
        success: false,
        error: error.message || 'Failed to build and simulate transaction',
      };
    }
  }

  /**
   * Build and simulate sell transaction
   */
  async buildAndSimulateSellTransaction(params: {
    mint: string;
    seller: string;
    tokenAmount: number;
    slippage?: number;
    priorityFee?: number;
    simulate?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string; simulation?: any }> {
    try {
      // First build the transaction
      const buildResult = await this.buildSellTransaction(params);
      
      if (!buildResult.success || !buildResult.data?.transaction) {
        return buildResult;
      }

      // If simulation is requested
      if (params.simulate !== false) { // Default to true
        this.logger.log('Running simulation for sell transaction...');
        const simulationResult = await this.simulateTransaction(
          buildResult.data.transaction,
          false
        );

        // Add simulation result to response
        buildResult.data.simulation = {
          willSucceed: simulationResult.willSucceed,
          error: simulationResult.error,
          logs: simulationResult.logs,
          unitsConsumed: simulationResult.unitsConsumed,
        };

        // Add warning if simulation failed
        if (!simulationResult.willSucceed) {
          buildResult.data.warning = 'Transaction simulation failed. This transaction will likely fail if submitted.';
          
          // Parse common errors
          const errorStr = simulationResult.error || '';
          if (errorStr.includes('InsufficientFunds')) {
            buildResult.data.warning = 'Insufficient token balance for this transaction.';
          } else if (errorStr.includes('SlippageExceeded')) {
            buildResult.data.warning = 'Price moved too much. Try increasing slippage.';
          }
        }
      }

      return buildResult;
    } catch (error: any) {
      this.logger.error('Failed to build and simulate sell transaction:', error);
      return {
        success: false,
        error: error.message || 'Failed to build and simulate transaction',
      };
    }
  }

  /**
   * Check if a token is still on pump.fun or has graduated
   */
  async checkTokenStatus(mint: string): Promise<{
    exists: boolean;
    graduated: boolean;
    status: 'active' | 'graduated' | 'not_found';
    message: string;
    bondingCurve?: string;
    details?: any;
  }> {
    try {
      this.logger.log(`Checking status for token: ${mint}`);
      
      const mintPubkey = new PublicKey(mint);
      
      // Get bonding curve PDA
      const [bondingCurve] = await PublicKey.findProgramAddress(
        [Buffer.from('bonding-curve'), mintPubkey.toBuffer()],
        PUMP_PROGRAM_ID
      );
      
      // Check if bonding curve account exists
      const bondingCurveAccount = await this.connection.getAccountInfo(bondingCurve);
      
      if (bondingCurveAccount) {
        // Account exists - token is active on pump.fun
        this.logger.log(`Token ${mint} is ACTIVE on pump.fun`);
        
        return {
          exists: true,
          graduated: false,
          status: 'active',
          message: 'Token is actively trading on pump.fun',
          bondingCurve: bondingCurve.toString(),
          details: {
            bondingCurveAddress: bondingCurve.toString(),
            accountSize: bondingCurveAccount.data.length,
          }
        };
      } else {
        // Bonding curve doesn't exist - check if token exists at all
        const mintAccount = await this.connection.getAccountInfo(mintPubkey);
        
        if (mintAccount) {
          // Token exists but no bonding curve - it graduated
          this.logger.log(`Token ${mint} has GRADUATED from pump.fun`);
          
          return {
            exists: true,
            graduated: true,
            status: 'graduated',
            message: 'Token has graduated from pump.fun to Raydium. Trade on Raydium or other DEXs instead.',
            details: {
              mintExists: true,
              suggestion: 'Use Jupiter (jup.ag) or Raydium to trade this token',
            }
          };
        } else {
          // Token doesn't exist at all
          this.logger.log(`Token ${mint} does NOT exist`);
          
          return {
            exists: false,
            graduated: false,
            status: 'not_found',
            message: 'Token does not exist on Solana blockchain',
            details: {
              suggestion: 'Check the token address or get a valid token from pump.fun',
            }
          };
        }
      }
    } catch (error: any) {
      this.logger.error(`Failed to check token status: ${error.message}`);
      
      // If it's an invalid public key error
      if (error.message.includes('Invalid public key')) {
        return {
          exists: false,
          graduated: false,
          status: 'not_found',
          message: 'Invalid token address format',
          details: {
            error: 'Not a valid Solana address',
          }
        };
      }
      
      return {
        exists: false,
        graduated: false,
        status: 'not_found',
        message: `Error checking token: ${error.message}`,
      };
    }
  }
}

export default PumpDirectService;
