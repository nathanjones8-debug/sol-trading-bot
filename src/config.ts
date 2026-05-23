import dotenv from 'dotenv';

dotenv.config();

export interface BotConfig {
  network: 'mainnet-beta' | 'devnet' | 'testnet';
  rpcEndpoint: string;
  walletPrivateKey: number[];
  walletPublicKey: string;
  tradeSizeSOL: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  supportLevelLookback: number;
  resistanceLevelLookback: number;
  volumeThresholdPercent: number;
  analysisInterval: number;
  jupiterApiUrl: string;
  birdeyeApiUrl: string;
}

function parsePrivateKey(keyString: string): number[] {
  try {
    // Try parsing as JSON array
    return JSON.parse(keyString);
  } catch {
    // If that fails, try base64
    try {
      const buffer = Buffer.from(keyString, 'base64');
      return Array.from(buffer);
    } catch {
      console.error('❌ Invalid private key format. Use JSON array or base64.');
      process.exit(1);
    }
  }
}

export const config: BotConfig = {
  network: (process.env.NETWORK as any) || 'devnet',
  rpcEndpoint: process.env.RPC_ENDPOINT || 'https://api.devnet.solana.com',
  walletPrivateKey: parsePrivateKey(process.env.WALLET_PRIVATE_KEY || '[]'),
  walletPublicKey: process.env.WALLET_PUBLIC_KEY || '',
  tradeSizeSOL: parseFloat(process.env.TRADE_SIZE_SOL || '0.2'),
  stopLossPercent: parseFloat(process.env.STOP_LOSS_PERCENT || '1'),
  takeProfitPercent: parseFloat(process.env.TAKE_PROFIT_PERCENT || '5'),
  supportLevelLookback: parseInt(process.env.SUPPORT_LEVEL_LOOKBACK || '50'),
  resistanceLevelLookback: parseInt(process.env.RESISTANCE_LEVEL_LOOKBACK || '50'),
  volumeThresholdPercent: parseInt(process.env.VOLUME_THRESHOLD_PERCENT || '150'),
  analysisInterval: parseInt(process.env.ANALYSIS_INTERVAL || '60'),
  jupiterApiUrl: process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6',
  birdeyeApiUrl: process.env.BIRDEYE_API_URL || 'https://public-api.birdeye.so',
};

export function validateConfig(): boolean {
  const errors: string[] = [];

  if (!config.walletPublicKey) {
    errors.push('❌ WALLET_PUBLIC_KEY is required');
  }

  if (!config.walletPrivateKey || config.walletPrivateKey.length === 0) {
    errors.push('❌ WALLET_PRIVATE_KEY is required');
  }

  if (config.tradeSizeSOL <= 0) {
    errors.push('❌ TRADE_SIZE_SOL must be greater than 0');
  }

  if (config.stopLossPercent <= 0) {
    errors.push('❌ STOP_LOSS_PERCENT must be greater than 0');
  }

  if (errors.length > 0) {
    errors.forEach(err => console.error(err));
    return false;
  }

  return true;
}
