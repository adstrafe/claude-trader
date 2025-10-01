# 🎮 Demo Mode - Simulated Trading System

## Overview

The trading platform now operates in **Demo Mode**, combining the best of both worlds:
- ✅ **Real-time market data** from YourBourse API
- ✅ **Simulated trading** with zero risk
- ✅ **Emotional detection** system fully functional

## How It Works

### Real Market Data
- Connects to YourBourse WebSocket for live prices
- 49 forex pairs with real-time updates
- Authentic trading experience

### Simulated Trading
- **All trades are simulated locally**
- **No real money at risk**
- **No actual orders sent to broker**
- Perfect for:
  - Testing the emotional detection system
  - Demonstrations and presentations
  - Learning and experimentation

## Features

### 💰 Starting Balance
- **$10,000** initial demo balance
- Stored in localStorage
- Persists across browser sessions

### 📊 Position Management
- Open positions with real-time P/L updates
- Automatic TP/SL execution
- Manual position closing
- All data stored locally

### 🎯 Auto-Execution
When real prices from YourBourse hit your:
- **Take Profit** → Position auto-closes with profit
- **Stop Loss** → Position auto-closes with loss
- Get instant notification with P/L

### 💾 Data Persistence
- Trades saved in localStorage
- Balance persists across sessions
- Trade history maintained
- Can reset anytime via browser console

## Usage

### Opening a Trade
1. Click "Quick Trade" on any pair
2. Set lot size, TP, and SL
3. Click "Place Buy/Sell Order"
4. See notification: "Order placed (DEMO)"
5. Position appears in dashboard

### Monitoring Positions
- Real-time P/L updates as prices change
- Current price shown for each position
- Distance to TP/SL visible
- Equity updates automatically

### Closing a Trade
**Manual Close:**
- Click "Close" button on position card
- See notification with final P/L
- Balance updates immediately

**Auto Close (TP/SL):**
- Position closes when price hits target
- Notification: "Position closed automatically"
- Shows final P/L

## Emotional Detection Integration

Every simulated trade is tracked by the emotional detection system:

### Tracked Events
- ✅ Trade placement (recorded)
- ✅ Trading after loss (detected)
- ✅ Position size changes (monitored)
- ✅ Rapid trading patterns (flagged)

### Emotional Indicators
- **Emotion Score Bar** (top right)
- **Risk warnings** when score drops
- **Behavioral alerts** for patterns
- **Market Panic Index** for context

## Developer Tools

### Reset Demo Account
Open browser console and run:
```javascript
// Reset all trades and balance
simulatedTrading.reset()
location.reload()
```

### View Current State
```javascript
// Check balance
simulatedTrading.getBalance()

// Check equity (balance + unrealized P/L)
simulatedTrading.getEquity()

// View open trades
simulatedTrading.getOpenTrades()

// View closed trades
simulatedTrading.getClosedTrades()
```

### Inspect Storage
```javascript
// View stored trades
localStorage.getItem('simulated_trades')

// View balance
localStorage.getItem('simulated_balance')
```

## Technical Details

### Trade Simulation Logic
Located in: `src/lib/simulatedTrading.ts`

**P/L Calculation:**
```typescript
priceDiff = direction === 'BUY' 
  ? currentPrice - entryPrice 
  : entryPrice - currentPrice

pipValue = symbol.includes('JPY') ? 1000 : 10
pnl = priceDiff * lots * pipValue
```

**TP/SL Checking:**
- Runs on every price update from WebSocket
- Compares current price to TP/SL levels
- Auto-closes when condition met

### Price Updates
1. WebSocket receives real price from YourBourse
2. Updates display prices for all pairs
3. Updates P/L for all open positions
4. Checks TP/SL conditions
5. Auto-closes positions if triggered

## Benefits for Demo

### For Presentations
- Show realistic trading without risk
- Demonstrate emotional detection live
- No need for real broker account
- Reset demo easily between presentations

### For Development
- Test emotional detection algorithms
- Verify TP/SL logic
- Experiment with risk profiles
- Debug without financial risk

### For Users
- Learn trading with real market data
- Practice risk management
- Test strategies safely
- Build confidence before real trading

## Migration to Live Trading

To switch to real trading (if needed):

1. Update `Dashboard.tsx` to use `yourBourseAPI` methods
2. Replace `simulatedTrading.openTrade()` with `yourBourseAPI.createOrder()`
3. Replace position management with real API calls
4. Update balance source to use `yourBourseAPI.getAccountState()`

**Note:** Current implementation is optimized for demo/testing. Live trading would require additional error handling, risk management, and user confirmations.

## Disclaimer

⚠️ **Demo Mode Notice**

This is a simulated trading environment:
- No real money is used
- No actual orders are placed
- Uses real market data for prices
- Perfect for testing and demonstrations
- Not connected to your real trading account

---

**Ready to test the emotional detection system with realistic market conditions!** 🚀

