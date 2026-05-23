import { Logger, formatPrice, formatSOL, calculatePercent } from './utils';
import { TechnicalSignals } from './technicalAnalysis';
import { config } from './config';

export interface OpenPosition {
  id: string;
  tokenMint: string;
  entryPrice: number;
  entryAmount: number;
  stopLoss: number;
  takeProfit: number;
  openedAt: number;
  status: 'open' | 'closed';
}

export interface TradeSignal {
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
  price: number;
}

export class TradingEngine {
  private positions: Map<string, OpenPosition> = new Map();
  private tradeHistory: TradeSignal[] = [];

  generateTradeSignal(signals: TechnicalSignals, tokenMint: string): TradeSignal {
    const { supportLevels, aboveAverageVolume, signalStrength, currentPrice, sma20 } = signals;

    // BUY Conditions
    if (
      supportLevels.length > 0 &&
      currentPrice <= supportLevels[0] * 1.02 && // Near support (within 2%)
      aboveAverageVolume && // High volume
      signalStrength >= 70 // Strong signal
    ) {
      return {
        action: 'buy',
        confidence: signalStrength,
        reason: 'Price at support with above-average volume',
        price: currentPrice,
      };
    }

    // SELL Conditions
    if (signalStrength < 30 && !aboveAverageVolume) {
      return {
        action: 'sell',
        confidence: 100 - signalStrength,
        reason: 'Weak signal: Low price action and volume',
        price: currentPrice,
      };
    }

    return {
      action: 'hold',
      confidence: signalStrength,
      reason: 'No clear signal',
      price: currentPrice,
    };
  }

  executePosition(signal: TradeSignal, tokenMint: string): OpenPosition | null {
    if (signal.action !== 'buy') return null;

    const position: OpenPosition = {
      id: `pos_${Date.now()}`,
      tokenMint,
      entryPrice: signal.price,
      entryAmount: config.tradeSizeSOL,
      stopLoss: signal.price * (1 - config.stopLossPercent / 100),
      takeProfit: signal.price * (1 + config.takeProfitPercent / 100),
      openedAt: Date.now(),
      status: 'open',
    };

    this.positions.set(position.id, position);
    return position;
  }

  checkPositions(currentPrice: number): OpenPosition[] {
    const closedPositions: OpenPosition[] = [];

    this.positions.forEach((position) => {
      if (position.status === 'closed') return;

      // Check stop loss
      if (currentPrice <= position.stopLoss) {
        position.status = 'closed';
        const loss = calculatePercent(position.entryPrice, -config.stopLossPercent);
        Logger.warn(
          `🛑 Stop Loss Hit: ${position.id} | Loss: ${formatPrice(loss)}`
        );
        closedPositions.push(position);
        return;
      }

      // Check take profit
      if (currentPrice >= position.takeProfit) {
        position.status = 'closed';
        const profit = calculatePercent(position.entryPrice, config.takeProfitPercent);
        Logger.success(
          `💰 Take Profit Hit: ${position.id} | Profit: ${formatPrice(profit)}`
        );
        closedPositions.push(position);
        return;
      }
    });

    return closedPositions;
  }

  getOpenPositions(): OpenPosition[] {
    return Array.from(this.positions.values()).filter(p => p.status === 'open');
  }

  getPositionStats(): { totalOpen: number; totalClosed: number; winRate: number } {
    const positions = Array.from(this.positions.values());
    const closedPositions = positions.filter(p => p.status === 'closed');
    const openPositions = positions.filter(p => p.status === 'open');

    let wins = 0;
    closedPositions.forEach((p) => {
      if (p.takeProfit > p.entryPrice) wins++;
    });

    const winRate = closedPositions.length > 0 ? (wins / closedPositions.length) * 100 : 0;

    return {
      totalOpen: openPositions.length,
      totalClosed: closedPositions.length,
      winRate: Math.round(winRate),
    };
  }

  logTradeSignal(signal: TradeSignal): void {
    this.tradeHistory.push(signal);
  }
}
