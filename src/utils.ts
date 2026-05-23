export class Logger {
  static info(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  static success(message: string): void {
    console.log(`✅ ${message}`);
  }

  static error(message: string): void {
    console.error(`❌ ${message}`);
  }

  static warn(message: string): void {
    console.warn(`⚠️  ${message}`);
  }

  static debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(`🐛 ${message}`);
    }
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(6)}`;
}

export function formatSOL(amount: number): string {
  return `${amount.toFixed(4)} SOL`;
}

export function calculatePercent(value: number, percent: number): number {
  return value * (percent / 100);
}

export function calculatePercentChange(old: number, current: number): number {
  return ((current - old) / old) * 100;
}

export function calculateProfitLoss(entryPrice: number, exitPrice: number, amount: number): number {
  return (exitPrice - entryPrice) * amount;
}

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function validatePriceData(data: PriceData[]): boolean {
  return data.length > 0 && data.every(d => d.close > 0 && d.volume >= 0);
}
