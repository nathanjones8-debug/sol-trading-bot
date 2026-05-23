# Solana Trading Bot 🤖

An automated trading bot for the Solana network that uses technical analysis to identify and execute trades based on support levels, volume, and price action.

## Features

✅ **Technical Analysis**
- Automatic support/resistance level detection
- Volume analysis (above/below average)
- Simple Moving Average (SMA)
- Relative Strength Index (RSI)
- Signal strength scoring (0-100)

✅ **Trading Strategy**
- Buy signals at support levels with above-average volume
- Configurable stop loss (default: 1%)
- Configurable take profit (default: 5%)
- Position tracking and P&L calculation

✅ **Multi-Timeframe Analysis**
- Analyzes 5-minute to weekly candles
- Flexible analysis intervals
- Real-time signal generation

✅ **Wallet Integration**
- Secure Solana wallet connection
- Balance checking
- SPL token support

## Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn**
- A **Solana wallet** (devnet for testing, mainnet for production)
- SOL tokens for trading

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/nathanjones8-debug/sol-trading-bot.git
cd sol-trading-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Edit `.env` with your settings**
```env
NETWORK=devnet                    # devnet or mainnet-beta
WALLET_PRIVATE_KEY=[...]          # Your wallet private key
WALLET_PUBLIC_KEY=...             # Your wallet public address
TRADE_SIZE_SOL=0.2                # Amount per trade
STOP_LOSS_PERCENT=1               # Stop loss %
TAKE_PROFIT_PERCENT=5             # Take profit %
```

## Running the Bot

### Development Mode (Testing)
```bash
npm run dev
```
This runs the bot with hot-reload and shows all debug output.

### Production Mode
```bash
npm run build
npm start
```

## Configuration

Edit `.env` to customize:

| Variable | Default | Description |
|----------|---------|-------------|
| `NETWORK` | devnet | Network to trade on |
| `TRADE_SIZE_SOL` | 0.2 | SOL amount per trade |
| `STOP_LOSS_PERCENT` | 1 | Stop loss percentage |
| `TAKE_PROFIT_PERCENT` | 5 | Take profit percentage |
| `SUPPORT_LEVEL_LOOKBACK` | 50 | Candles to analyze for support |
| `VOLUME_THRESHOLD_PERCENT` | 150 | Volume must be X% above average |
| `ANALYSIS_INTERVAL` | 60 | Seconds between analysis runs |

## How It Works

### Analysis Loop

1. **Fetch Price Data** - Retrieves OHLCV candles from DEXs
2. **Calculate Indicators** - Support/resistance, SMA, RSI, volume
3. **Generate Signal** - BUY/SELL/HOLD based on conditions
4. **Execute Trade** - Opens positions if conditions met
5. **Monitor Positions** - Checks stop loss and take profit
6. **Wait** - Repeats after interval (default 60s)

### Buy Signal Conditions

✅ Price within 2% of support level
✅ Volume above average (150%+)
✅ Signal strength >= 70/100

### Sell Signal Conditions

✅ Stop loss hit (-1% from entry)
✅ Take profit hit (+5% from entry)
✅ Weak signal (strength < 30) + low volume

## Project Structure

```
sol-trading-bot/
├── src/
│   ├── main.ts              # Bot entry point & main loop
│   ├── config.ts            # Configuration management
│   ├── wallet.ts            # Solana wallet integration
│   ├── dataFetcher.ts       # Price/volume data fetching
│   ├── technicalAnalysis.ts # Technical indicators
│   ├── trading.ts           # Trading logic & positions
│   └── utils.ts             # Helper functions & logger
├── dist/                    # Compiled JavaScript (after build)
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## Security Notes

⚠️ **IMPORTANT**: Never commit your `.env` file or private keys to Git!

- Always use `.env.example` as template
- Keep private keys secure and rotated
- Test on devnet before mainnet
- Start with small trade sizes
- Monitor bot regularly

## Roadmap

- [ ] Implement real Jupiter API integration
- [ ] Add more technical indicators (Bollinger Bands, MACD)
- [ ] Implement trade execution on Solana
- [ ] Add email/Discord alerts
- [ ] Cloud deployment guide (AWS, DigitalOcean)
- [ ] Backtesting framework
- [ ] Risk management improvements

## Troubleshooting

### "WALLET_PRIVATE_KEY is required"
```bash
# Check your .env file has the private key set
grep WALLET_PRIVATE_KEY .env
```

### "Failed to connect to RPC"
```bash
# Check your RPC endpoint is correct
# For devnet: https://api.devnet.solana.com
# For mainnet: https://api.mainnet-beta.solana.com
```

### No price data available
```bash
# API endpoints might be down
# Check Jupiter/Birdeye API status
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - see LICENSE file for details

## Disclaimer

⚠️ **Risk Warning**: Trading cryptocurrency involves risk. This bot is provided as-is without warranty. Always:
- Test thoroughly on devnet first
- Start with small amounts
- Use stop losses
- Never risk more than you can afford to lose

---

Created with ❤️ for the Solana community
