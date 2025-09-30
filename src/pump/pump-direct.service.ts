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
  createInitializeMintInstruction,
  createMintToInstruction,
} from '@solana/spl-token';
import { PumpIdlService } from './pump-idl.service';
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

	constructor(private configService: ConfigService,
		private pumpIdlService: PumpIdlService,
	) {
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
				// Parse bonding curve data (need to decode based on the actual structure)
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

			// Simulate the transaction using correct signature for @solana/web3.js
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

// Add to pump-direct.service.ts token Creation via IDL

	/**
	 * Create a new token on pump.fun using direct program interaction
	 * NOTE: Pump.fun token creation is complex and requires specific program state
	 */
	async createTokenDirect(params: {
		name: string;
		symbol: string;
		description?: string;
		imageUri?: string;
		creator: string;
	}): Promise<{ success: boolean; data?: any; error?: string }> {
		try {
			this.logger.log('Attempting to create token directly on-chain');


			return {
				success: false,
				error: 'Direct token creation is not possible without pump.fun backend coordination. The program only handles trading of existing tokens, not creation of new ones.',
				data: {
					explanation: 'Token creation requires:',
					requirements: [
						'1. Create SPL token mint',
						'2. Upload metadata to IPFS',
						'3. Initialize bonding curve',
						'4. Register with pump.fun backend',
						'5. Set initial liquidity parameters'
					],
					alternative: 'Use pump.fun website or wait for API access'
				}
			};


		} catch (error: any) {
			this.logger.error('Failed to create token:', error);
			return {
				success: false,
				error: 'Token creation failed: ' + error.message,
			};
		}
	}

	/**
	 * Alternative: Create a standard SPL token (not on pump.fun)
	 */
	async createStandardSPLToken(params: {
		name: string;
		symbol: string;
		decimals?: number;
		supply?: number;
		creator: string;
	}): Promise<{ success: boolean; data?: any; error?: string }> {
		try {
			this.logger.log('Creating standard SPL token');

			const creatorPubkey = new PublicKey(params.creator);
			const mintKeypair = Keypair.generate();
			const decimals = params.decimals || TOKEN_DECIMALS;
			const supply = params.supply || 1000000000; // 1 billion default

			const transaction = new Transaction();

			// Calculate rent
			const lamports = await this.connection.getMinimumBalanceForRentExemption(82);

			// Create mint account
			transaction.add(
				SystemProgram.createAccount({
					fromPubkey: creatorPubkey,
					newAccountPubkey: mintKeypair.publicKey,
					space: 82,
					lamports,
					programId: TOKEN_PROGRAM_ID,
				})
			);

			// Initialize mint
			transaction.add(
				createInitializeMintInstruction(
					mintKeypair.publicKey,
					decimals,
					creatorPubkey,
					creatorPubkey,
					TOKEN_PROGRAM_ID
				)
			);

			// Create associated token account
			const associatedTokenAddress = await getAssociatedTokenAddress(
				mintKeypair.publicKey,
				creatorPubkey
			);

			transaction.add(
				createAssociatedTokenAccountInstruction(
					creatorPubkey,
					associatedTokenAddress,
					creatorPubkey,
					mintKeypair.publicKey
				)
			);

			// Mint initial supply
			transaction.add(
				createMintToInstruction(
					mintKeypair.publicKey,
					associatedTokenAddress,
					creatorPubkey,
					supply * Math.pow(10, decimals),
					[],
					TOKEN_PROGRAM_ID
					)
			);

			// Get recent blockhash
			const { blockhash } = await this.connection.getLatestBlockhash();
			transaction.recentBlockhash = blockhash;
			transaction.feePayer = creatorPubkey;

			// Add mint keypair as partial signer
			transaction.partialSign(mintKeypair);

			// Serialize for wallet to sign
			const serializedTx = transaction.serialize({
				requireAllSignatures: false,
				verifySignatures: false,
			});
			
			return {
				success: true,
				data: {
					transaction: serializedTx.toString('base64'),
					mint: mintKeypair.publicKey.toString(),
					decimals,
					supply,
					note: 'This creates a standard SPL token, NOT a pump.fun token'
				}
			};

		} catch (error: any) {
			this.logger.error('Failed to create SPL token:', error);
			return {
				success: false,
				error: error.message,
			};
		}
	}


	/**
	 * Debug method to check all accounts involved in a trade
	 */
	async debugTokenAccounts(mint: string, buyer: string): Promise<any> {
		try {
			this.logger.log('=== DEBUGGING TOKEN ACCOUNTS ===');

			const mintPubkey = new PublicKey(mint);
			const buyerPubkey = new PublicKey(buyer);

			// 1. Check mint account
			const mintAccount = await this.connection.getAccountInfo(mintPubkey);
			this.logger.log(`1. Mint account exists: ${!!mintAccount}`);

			// 2. Get bonding curve PDA
			const [bondingCurve] = await PublicKey.findProgramAddress(
				[Buffer.from('bonding-curve'), mintPubkey.toBuffer()],
				PUMP_PROGRAM_ID
			);
			const bondingCurveAccount = await this.connection.getAccountInfo(bondingCurve);
			this.logger.log(`2. Bonding curve exists: ${!!bondingCurveAccount}`);
			this.logger.log(` 	 Address: ${bondingCurve.toString()}`);

			// 3. Check associated token account for bonding curve
			const associatedBondingCurve = await getAssociatedTokenAddress(
				mintPubkey,
				bondingCurve,
				true // Allow owner off curve
			);
			const bondingCurveTokenAccount = await this.connection.getAccountInfo(associatedBondingCurve);
			this.logger.log(`3. Bonding curve token account exists: ${!!bondingCurveTokenAccount}`);
			this.logger.log(` 	 Address: ${associatedBondingCurve.toString()}`);

			// 4. Check user's associated token account
			const userTokenAccount = await getAssociatedTokenAddress(
				mintPubkey,
				buyerPubkey
			);
			const userAccount = await this.connection.getAccountInfo(userTokenAccount);
			this.logger.log(`4. User token account exists: ${!!userAccount}`);
			this.logger.log(` 	 Address: ${userTokenAccount.toString()}`);
			this.logger.log(` 	 Will be created: ${!userAccount}`);

			// 5. Check fee recipient
			const feeAccount = await this.connection.getAccountInfo(PUMP_FEE_RECIPIENT);
			this.logger.log(`5. Fee recipient exists: ${!!feeAccount}`);

			// 6. Check event authority
			const eventAccount = await this.connection.getAccountInfo(PUMP_EVENT_AUTHORITY);
			this.logger.log(`6. Event authority exists: ${!!eventAccount}`);

			// 7. Build the buy instruction keys to verify
			this.logger.log('\n=== INSTRUCTION ACCOUNTS ===');
			const keys = [
				{ pubkey: PUMP_GLOBAL, isSigner: false, isWritable: false, name: 'Global' },
				{ pubkey: PUMP_FEE_RECIPIENT, isSigner: false, isWritable: true, name: 'Fee Recipient' },
				{ pubkey: mintPubkey, isSigner: false, isWritable: false, name: 'Mint' },
				{ pubkey: bondingCurve, isSigner: false, isWritable: true, name: 'Bonding Curve' },
				{ pubkey: associatedBondingCurve, isSigner: false, isWritable: true, name: 'BC Token Account' },
				{ pubkey: userTokenAccount, isSigner: false, isWritable: true, name: 'User Token Account' },
				{ pubkey: buyerPubkey, isSigner: true, isWritable: true, name: 'Buyer' },
				{ pubkey: SystemProgram.programId, isSigner: false, isWritable: false, name: 'System' },
				{ pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false, name: 'Token Program' },
				{ pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false, name: 'ATA Program' },
				{ pubkey: PUMP_EVENT_AUTHORITY, isSigner: false, isWritable: false, name: 'Event Authority' },
				{ pubkey: PUMP_PROGRAM_ID, isSigner: false, isWritable: false, name: 'Pump Program' },
			];

			for (const [index, key] of keys.entries()) {
				const exists = await this.connection.getAccountInfo(key.pubkey);
				this.logger.log(`${index}. ${key.name}: ${key.pubkey.toString().slice(0, 8)}... exists: ${!!exists}`);
			}

			return {
				success: true,
				accounts: {
					mint: {
						address: mint,
						exists: !!mintAccount,
					},
					bondingCurve: {
						address: bondingCurve.toString(),
						exists: !!bondingCurveAccount,
						size: bondingCurveAccount?.data.length,
					},
					bondingCurveTokenAccount: {
						address: associatedBondingCurve.toString(),
						exists: !!bondingCurveTokenAccount,
						needsCreation: !bondingCurveTokenAccount,
					},
					userTokenAccount: {
						address: userTokenAccount.toString(),
						exists: !!userAccount,
						willBeCreated: !userAccount,
					},
					feeRecipient: {
						address: PUMP_FEE_RECIPIENT.toString(),
						exists: !!feeAccount,
					},
				},
				problem: !bondingCurveTokenAccount ?
					'Bonding curve token account does not exist. Token may be newly created or in invalid state.' :
					'All required accounts exist. Issue may be with instruction data or program state.',
			};
		} catch (error: any) {
			this.logger.error('Debug failed:', error);
			return {
				success: false,
				error: error.message,
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
