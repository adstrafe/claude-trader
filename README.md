# AI Trading Platform

A demo React + Vite trading platform with AI-powered trade suggestions using Anthropic Claude.

## ⚠️ Educational Demo

This is a **simulation-only** platform for educational purposes. No real money or trading occurs. Not financial advice.

## Features

- **Live Market Simulation**: Real-time price updates for forex pairs (USD/JPY, EUR/USD, GBP/USD, BTC/USD)
- **AI Trading Assistant**: Powered by Anthropic Claude for trade suggestions and market analysis
- **Interactive Charts**: Candlestick charts with multiple timeframes
- **Risk Management**: Three risk profiles (Guardian, Copilot, Maverick) with automatic risk scoring
- **Position Management**: Track open positions, P&L, and trade history
- **Quick Trading**: Fast trade execution with auto TP/SL calculation (1:2 risk-reward ratio)

## Tech Stack

- React 18 + Vite 5
- TypeScript
- React Router v6
- Tailwind CSS 3 (dark/light mode)
- React Hook Form v7
- Lightweight Charts 4
- Anthropic AI SDK
- Lucide React (icons)

## Setup

### Prerequisites

- Node.js 18+ (or pnpm)
- Anthropic API key

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Add your Anthropic API key to .env
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

### Development

```bash
# Start dev server
pnpm dev

# Open http://localhost:8080
```

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn components
│   ├── AIAssistant.tsx
│   ├── CandlestickChart.tsx
│   ├── ForexCard.tsx
│   ├── TradeForm.tsx
│   └── ...
├── lib/              # Utilities and helpers
│   ├── mockData.ts
│   ├── priceSimulator.ts
│   ├── riskProfiles.ts
│   └── tradingUtils.ts
├── pages/            # Route pages
│   ├── Dashboard.tsx
│   ├── PairDetail.tsx
│   ├── Positions.tsx
│   ├── PositionDetail.tsx
│   ├── History.tsx
│   └── Settings.tsx
└── services/         # External services
    └── claudeAPI.ts  # Anthropic AI integration
```

## Features Overview

### Dashboard
- Market overview with 4 forex pairs
- AI-generated trade suggestions
- Open positions summary
- Collapsible AI assistant sidebar

### Pair Detail
- Interactive candlestick charts
- Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1D)
- Trade panel with BUY/SELL
- AI risk analysis

### Risk Profiles

| Profile | Max Lots | Warn | Block |
|---------|----------|------|-------|
| Guardian | 0.2 | 30 | 50 |
| Copilot (default) | 0.5 | 50 | 70 |
| Maverick | 10 | 70 | 85 |

### AI Features

- **Trade Suggestions**: AI generates 5 diverse trade ideas with risk scores
- **Chat Assistant**: Ask questions about markets and get contextual advice
- **Risk Analysis**: AI evaluates each trade's risk level

## Deployment

### GitHub Pages

The project includes a GitHub Actions workflow for automatic deployment:

1. Set `base: '/ai-trading-platform/'` in `vite.config.js`
2. Push to `main` branch
3. Enable GitHub Pages in repository settings
4. Site will be live at `https://username.github.io/ai-trading-platform/`

### Environment Variables

For GitHub Pages deployment, add `VITE_ANTHROPIC_API_KEY` as a repository secret.

## Customization

### Adding New Pairs

Edit `src/lib/mockData.ts`:

```typescript
export const MOCK_PAIRS: ForexPair[] = [
  {
    symbol: "NEWPAIR",
    name: "NEW/PAIR",
    price: 1.0,
    // ...
  },
];
```

### Changing Risk Profiles

Edit `src/lib/riskProfiles.ts`:

```typescript
export const RISK_PROFILES = {
  CUSTOM: {
    name: "Custom",
    description: "Your custom profile",
    warnThreshold: 40,
    blockThreshold: 60,
    maxLots: 1.0,
  },
};
```

## License

MIT

## Disclaimer

This is a demo platform for educational purposes only. No real financial transactions occur. Not financial advice. Trade at your own risk.
