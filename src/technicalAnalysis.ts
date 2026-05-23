import { OHLCVData } from './dataFetcher';
import { Logger, calculatePercentChange } from './utils';

export interface TechnicalSignals {
  supportLevels: number[];
  resistanceLevels: number[];
  currentPrice: number;
  averageVolume: number;
  aboveAverageVolume: boolean;
  sma20: number;
  rsi: number;
  signalStrength: number; // 0-100
}

export class TechnicalAnalyzer {
  // Calculate simple moving average
  static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  // Calculate relative strength index
  static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gainSum = 0;
    let lossSum = 0;

    for (let i = 1; i <= period; i++) {
      const diff = prices[prices.length - i] - prices[prices.length - i - 1];
      if (diff > 0) {
        gainSum += diff;
      } else {
        lossSum += Math.abs(diff);
      }
    }

    const avgGain = gainSum / period;
    const avgLoss = lossSum / period;

    if (avgLoss === 0) return avgGain > 0 ? 100 : 0;

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    return rsi;
  }

  // Find support levels (local minima)
  static findSupportLevels(data: OHLCVData[], lookback: number = 50): number[] {
    const prices = data.slice(-lookback).map(d => d.low);
    const support: number[] = [];

    for (let i = 1; i < prices.length - 1; i++) {
      if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
        support.push(prices[i]);
      }
    }

    return support.sort((a, b) => b - a); // Highest first
  }

  // Find resistance levels (local maxima)
  static findResistanceLevels(data: OHLCVData[], lookback: number = 50): number[] {
    const prices = data.slice(-lookback).map(d => d.high);
    const resistance: number[] = [];

    for (let i = 1; i < prices.length - 1; i++) {
      if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
        resistance.push(prices[i]);
      }
    }

    return resistance.sort((a, b) => a - b); // Lowest first
  }

  // Calculate average volume and check if current is above threshold
  static analyzeVolume(volumes: number[], threshold: number = 150): [number, boolean] {
    if (volumes.length === 0) return [0, false];

    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const percentAboveAvg = (currentVolume / avgVolume) * 100;

    return [avgVolume, percentAboveAvg >= threshold];
  }

  // Analyze price action relative to support/resistance
  static analyzePrice(
    currentPrice: number,
    supportLevels: number[],
    resistanceLevels: number[]
  ): number {
    let strength = 50; // Base score

    // Check proximity to support (bullish)
    if (supportLevels.length > 0) {
      const nearestSupport = supportLevels[0];
      const supportDistance = ((currentPrice - nearestSupport) / nearestSupport) * 100;
      if (supportDistance < 2) strength += 25; // Close to support
      else if (supportDistance < 5) strength += 15;
    }

    // Check proximity to resistance (bearish)
    if (resistanceLevels.length > 0) {
      const nearestResistance = resistanceLevels[0];
      const resistanceDistance = ((nearestResistance - currentPrice) / nearestResistance) * 100;
      if (resistanceDistance < 2) strength -= 25; // Close to resistance
      else if (resistanceDistance < 5) strength -= 15;
    }

    return Math.max(0, Math.min(100, strength));
  }

  // Generate comprehensive technical signals
  static generateSignals(
    data: OHLCVData[],
    lookback: number = 50,
    volumeThreshold: number = 150
  ): TechnicalSignals {
    const prices = data.map(d => d.close);
    const volumes = data.map(d => d.volume);
    const currentPrice = prices[prices.length - 1];

    const supportLevels = this.findSupportLevels(data, lookback);
    const resistanceLevels = this.findResistanceLevels(data, lookback);
    const [averageVolume, aboveAverageVolume] = this.analyzeVolume(volumes, volumeThreshold);
    const sma20 = this.calculateSMA(prices, 20);
    const rsi = this.calculateRSI(prices, 14);
    const priceStrength = this.analyzePrice(currentPrice, supportLevels, resistanceLevels);
    const volumeStrength = aboveAverageVolume ? 75 : 25;

    const signalStrength = (priceStrength + volumeStrength) / 2;

    return {
      supportLevels: supportLevels.slice(0, 3),
      resistanceLevels: resistanceLevels.slice(0, 3),
      currentPrice,
      averageVolume,
      aboveAverageVolume,
      sma20,
      rsi,
      signalStrength: Math.round(signalStrength),
    };
  }
}
