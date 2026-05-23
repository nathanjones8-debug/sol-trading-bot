import { Logger } from './utils';
import { config, validateConfig } from './config';
import { initializeWallet } from './wallet';
import { initializeDataFetcher } from './dataFetcher';
import { TechnicalAnalyzer } from './technicalAnalysis';
import { TradingEngine } from './trading';

async function main() {
  Logger.info('🤖 Solana Trading Bot Starting...');
  Logger.info(`Network: ${config.network}`);
  Logger.info(`Trade Size: ${config.tradeSizeSOL} SOL`);
  Logger.info(`Stop Loss: ${config.stopLossPercent}%`);
  Logger.info(`Take Profit: ${config.takeProfitPercent}%`);
  Logger.info('');

  // Validate configuration
  if (!validateConfig()) {
    Logger.error('Configuration validation failed. Please check your .env file.');
    process.exit(1);
  }

  try {
    // Initialize components
    const wallet = await initializeWallet();
    const dataFetcher = await initializeDataFetcher();
    const tradingEngine = new TradingEngine();

    Logger.success('All components initialized successfully!');
    Logger.info('');

    // Main bot loop
    let analysisCount = 0;

    const runAnalysis = async () => {
      analysisCount++;
      Logger.info(`=== Analysis #${analysisCount} ===`);

      try {
        // Fetch price data
        Logger.info('📈 Fetching price data...');
        const priceData = await dataFetcher.fetchPriceData('SOL', 5, 100);

        if (priceData.length === 0) {
          Logger.error('No price data available');
          return;
        }

        // Run technical analysis
        Logger.info('🔍 Analyzing technical indicators...');
        const signals = TechnicalAnalyzer.generateSignals(
          priceData,
          config.supportLevelLookback,
          config.volumeThresholdPercent
        );

        // Log analysis results
        Logger.info('');
        Logger.info('📊 Analysis Results:');
        Logger.info(`   Current Price: ${signals.currentPrice.toFixed(6)}`);
        Logger.info(
          `   Support Levels: ${signals.supportLevels.map(s => s.toFixed(6)).join(', ')}`
        );
        Logger.info(
          `   Resistance Levels: ${signals.resistanceLevels.map(r => r.toFixed(6)).join(', ')}`
        );
        Logger.info(`   Avg Volume: ${signals.averageVolume.toFixed(2)}`);
        Logger.info(`   Volume Above Avg: ${signals.aboveAverageVolume ? '✅ Yes' : '❌ No'}`);
        Logger.info(`   SMA(20): ${signals.sma20.toFixed(6)}`);
        Logger.info(`   Signal Strength: ${signals.signalStrength}/100`);
        Logger.info('');

        // Generate trade signal
        const tradeSignal = tradingEngine.generateTradeSignal(signals, 'SOL');
        tradingEngine.logTradeSignal(tradeSignal);

        Logger.info(`🎯 Trade Signal: ${tradeSignal.action.toUpperCase()}`);
        Logger.info(`   Reason: ${tradeSignal.reason}`);
        Logger.info(`   Confidence: ${tradeSignal.confidence}/100`);
        Logger.info('');

        // Execute if buy signal (DEMO MODE - not executing real trades yet)
        if (tradeSignal.action === 'buy') {
          const position = tradingEngine.executePosition(tradeSignal, 'SOL');
          if (position) {
            Logger.success(`📍 NEW POSITION OPENED (DEMO MODE)`);
            Logger.info(`   Entry Price: ${position.entryPrice.toFixed(6)}`);
            Logger.info(`   Stop Loss: ${position.stopLoss.toFixed(6)}`);
            Logger.info(`   Take Profit: ${position.takeProfit.toFixed(6)}`);
            Logger.info('');
          }
        }

        // Check existing positions
        const openPositions = tradingEngine.getOpenPositions();
        const stats = tradingEngine.getPositionStats();

        Logger.info(`📍 Open Positions: ${openPositions.length}`);
        Logger.info(`   Total Closed: ${stats.totalClosed}`);
        Logger.info(`   Win Rate: ${stats.winRate}%`);
        Logger.info('');

        // Schedule next analysis
        Logger.info(
          `⏳ Waiting ${config.analysisInterval} seconds before next analysis...`
        );
        Logger.info('---');
        Logger.info('');
      } catch (error) {
        Logger.error(`Analysis failed: ${error}`);
      }
    };

    // Run initial analysis
    await runAnalysis();

    // Schedule recurring analysis
    setInterval(runAnalysis, config.analysisInterval * 1000);
  } catch (error) {
    Logger.error(`Fatal error: ${error}`);
    process.exit(1);
  }
}

main();
