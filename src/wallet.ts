import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import { config } from './config';
import { Logger } from './utils';

export class SolanaWallet {
  private keypair: Keypair;
  private connection: Connection;
  private publicKey: PublicKey;

  constructor() {
    try {
      // Create keypair from private key
      this.keypair = Keypair.fromSecretKey(new Uint8Array(config.walletPrivateKey));
      this.publicKey = this.keypair.publicKey;
      this.connection = new Connection(config.rpcEndpoint, 'confirmed');
      Logger.success(`Wallet initialized: ${this.publicKey.toString()}`);
    } catch (error) {
      Logger.error(`Failed to initialize wallet: ${error}`);
      throw error;
    }
  }

  getPublicKey(): PublicKey {
    return this.publicKey;
  }

  getKeypair(): Keypair {
    return this.keypair;
  }

  getConnection(): Connection {
    return this.connection;
  }

  async getBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      Logger.error(`Failed to get balance: ${error}`);
      return 0;
    }
  }

  async getTokenBalance(mint: string): Promise<number> {
    try {
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        this.publicKey,
        { mint: new PublicKey(mint) }
      );

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      const accountData = tokenAccounts.value[0].account.data.parsed.info.tokenAmount;
      return accountData.uiAmount;
    } catch (error) {
      Logger.error(`Failed to get token balance: ${error}`);
      return 0;
    }
  }
}

export async function initializeWallet(): Promise<SolanaWallet> {
  const wallet = new SolanaWallet();
  const balance = await wallet.getBalance();
  Logger.info(`Wallet Balance: ${balance.toFixed(4)} SOL`);
  return wallet;
}
