# YourBourse API Integration Setup Guide

## 🎉 What's Been Done

The application has been successfully integrated with the YourBourse Trading API in **Demo Mode**! Here's what's been implemented:

### ✅ Completed Features

1. **YourBourse API Service** (`src/services/yourBourseAPI.ts`)
   - HMAC-SHA256 authentication
   - REST API methods for:
     - Authentication (`/authorize`)
     - Get symbols/market data
     - Get account state
     - Create orders
     - Query positions
     - Close positions
   - WebSocket connection for real-time price streaming
   - Automatic keep-alive (ping/pong)

2. **Data Adapters** (`src/lib/yourBourseAdapter.ts`)
   - Converts YourBourse API responses to your app's data format
   - Filters popular forex pairs for the dashboard

3. **Dashboard Integration** (`src/pages/Dashboard.tsx`)
   - Loads real market data from YourBourse
   - Displays live account balance
   - Shows real-time price updates via WebSocket
   - Creates actual orders through the API
   - Displays and manages real positions
   - Loading states during API initialization

4. **Simulated Trading System** (`src/lib/simulatedTrading.ts`)
   - **Demo mode** - No real money at risk!
   - Uses real-time YourBourse prices
   - Simulates trades locally (stored in localStorage)
   - Auto-executes TP/SL when prices hit targets
   - Tracks P/L in real-time
   - Persists balance and trades across sessions
   - Perfect for testing emotional detection system

5. **Dependencies**
   - Installed `crypto-js` for HMAC signature generation
   - Installed `@types/crypto-js` for TypeScript support

## 🔧 What You Need to Do

### Step 1: Add Your Credentials

Create or update your `.env` file in the project root:

```bash
# YourBourse API Credentials
VITE_YB_ACCOUNT_ID=7
VITE_YB_PASSWORD=your_password_here

# Claude API (existing)
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Replace:**
- `7` with your actual YourBourse account ID
- `your_password_here` with your YourBourse password

### Step 2: Restart the Development Server

After adding your credentials, restart the dev server:

```bash
npm run dev
```

### Step 3: Test the Connection

When you open the app:
1. You should see a "Connecting to YourBourse API..." loading screen
2. Then a success toast: "Connected to YourBourse API"
3. Your real account balance will be displayed in the header
4. Real forex pairs will load in the Markets section
5. Prices will update in real-time via WebSocket

## 📊 How It Works

### Authentication Flow
1. App authenticates using HMAC-SHA256 signature
2. Receives API token
3. Uses token for price data requests

### Real-Time Price Updates
1. WebSocket connects to `wss://yourbourse.trade:32220/ws/v1`
2. Subscribes to L1 price data for each symbol
3. Updates prices in real-time as they come in
4. Sends ping every 10 seconds to keep connection alive
5. **Auto-reconnects if connection drops** (3 second retry)
6. **Automatically resubscribes** to all symbols after reconnection
7. **Price updates also update simulated positions in real-time**

### Trading Flow (Demo Mode)
1. User clicks "Quick Trade" on a pair
2. Fills out trade form (lots, TP, SL)
3. Submits order → **Creates SIMULATED trade locally**
4. Trade is saved to localStorage (persists across sessions)
5. Real-time prices update the P/L continuously
6. When price hits TP or SL → Trade auto-closes
7. User can manually close positions
8. **All trades are simulated - no real money involved!**

### Emotional Detection Integration
- Every trade is tracked by `emotionDetector`
- Real price movements provide realistic trading experience
- Perfect for testing behavioral patterns
- Balance starts at $10,000 (can be reset)

## 🔍 API Endpoints Used

| Endpoint | Purpose | Mode |
|----------|---------|------|
| `POST /api/v1/authorize` | Get API token | Active |
| `GET /api/v1/symbols/query` | Get all trading symbols | Active |
| WebSocket `/ws/v1` | Real-time price streams | Active |
| ~~`POST /api/v1/orders/create`~~ | ~~Place orders~~ | Not used (simulated) |
| ~~`GET /api/v1/positions/query`~~ | ~~Get positions~~ | Not used (simulated) |
| ~~`POST /api/v1/positions/close`~~ | ~~Close positions~~ | Not used (simulated) |

**Demo Mode**: Only uses authentication and price data APIs. All trading is simulated locally.

## 🚨 Important Notes

### 🎮 Demo Mode Active
- **No real money at risk!**
- Uses real YourBourse price data
- All trades are simulated locally
- Perfect for testing and demonstrations
- Balance starts at $10,000
- Trades persist in localStorage

### SSL Certificate
The YourBourse API uses a valid Let's Encrypt certificate. Your browser should trust it automatically.

### Rate Limits
- Each endpoint has a weight limit
- Check response headers for `X-YB-USED-WEIGHT`
- Demo mode uses minimal API calls (auth + prices only)

### Error Handling
- Authentication errors → Check credentials in `.env`
- Connection errors → Check internet connection
- Simulated trades → All stored in browser localStorage

### Known API Limitations
These endpoints are **NOT implemented** on the server (will cause connection hang):
- `GET /account/balances`
- `GET /limits`
- WebSocket balances channel

The app avoids these endpoints.

## 🎯 Next Steps (Optional)

To extend the integration to other pages:

1. **Positions Page** (`src/pages/Positions.tsx`)
   - Load positions from API
   - Add modify position functionality

2. **History Page** (`src/pages/History.tsx`)
   - Query closed positions/orders
   - Display trade history

3. **Pair Detail Page** (`src/pages/PairDetail.tsx`)
   - Show more detailed symbol information
   - Add order book data if available

## 🐛 Troubleshooting

### "Failed to connect to YourBourse API"
- Check your credentials in `.env`
- Ensure account ID is numeric (not a string)
- Verify password is correct
- Check browser console for detailed error

### "No symbols loading"
- Check network tab in browser dev tools
- Verify API responses
- Check if symbols/query endpoint is accessible

### "WebSocket disconnects"
- Normal - it will reconnect automatically
- Check for network issues
- Verify WebSocket URL is correct

### "Orders fail to place"
- Check account balance
- Verify symbol name is correct
- Check lot size is within limits
- Look at API error response in console

## 📝 Environment Variables Summary

```bash
# Required for YourBourse API
VITE_YB_ACCOUNT_ID=<your_account_id>    # Numeric ID
VITE_YB_PASSWORD=<your_password>         # Your password

# Optional (existing functionality)
VITE_ANTHROPIC_API_KEY=<your_key>        # For AI features
```

## 🎓 Code Structure

```
src/
├── services/
│   ├── yourBourseAPI.ts       # Main API service
│   └── claudeAPI.ts           # Existing Claude AI service
├── lib/
│   ├── yourBourseAdapter.ts   # Data format converters
│   └── mockData.ts            # Type definitions (still used)
└── pages/
    └── Dashboard.tsx          # Integrated with real API
```

## ✅ Testing Checklist

- [ ] Credentials added to `.env` file
- [ ] Dev server restarted
- [ ] App loads without errors
- [ ] "Connected to YourBourse API" toast appears
- [ ] Demo balance shows $10,000.00 in header
- [ ] Forex pairs load (8-12 pairs)
- [ ] Prices update in real-time
- [ ] Can open a simulated position (shows "DEMO" tag)
- [ ] Position appears in dashboard
- [ ] Position P/L updates in real-time
- [ ] Can manually close position
- [ ] Position auto-closes when hitting TP/SL
- [ ] Balance updates after closing positions
- [ ] Emotional detection system tracks trades
- [ ] WebSocket stays connected
- [ ] Trades persist after page refresh (localStorage)

---

**Need Help?** Check the browser console for detailed error messages. All API calls and WebSocket messages are logged for debugging.

