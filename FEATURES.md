# Xandeum Pulse - Complete Feature Documentation

## 🎯 Overview

Xandeum Pulse is a comprehensive analytics platform for monitoring Xandeum pNodes (storage provider nodes). This platform provides real-time insights into the decentralized storage network built on Solana.

## ✨ Features Implemented

### 1. **AI Chatbot Assistant** ✅

#### Component (`src/components/Chatbot.tsx`)
- Floating chat widget accessible from any page
- Modern, clean interface with smooth animations
- Welcome screen with branding and quick start guide
- Message history with user/assistant differentiation

#### Service Layer (`src/services/chatbot.ts`)
**Multi-Provider Architecture:**
- OpenAI GPT-4 (primary)
- Google Gemini (fallback)
- Local knowledge base (offline mode)

**Knowledge Base Topics:**
- What is Xandeum
- pNodes and infrastructure
- XAND tokens vs XAND credits
- Tokenomics and economics
- Technology and architecture
- Developers and integration
- Roadmap and achievements
- Use cases and applications

**Important Terminology Handling:**
- XAND Token: Native cryptocurrency, tradeable digital asset
- XAND Credits: Internal rewards shown in dashboard
- Clear distinction enforced in all responses

#### Context Management (`src/contexts/ChatbotContext.tsx`)
- Global state management with React Context
- Conversation history persistence
- Provider availability checking
- Error handling and fallback logic

#### Features
- **8 Suggested Questions**: Clickable pre-defined questions for quick answers
  1. What is Xandeum?
  2. How do pNodes work?
  3. What are XAND tokens?
  4. Tell me about tokenomics
  5. What's the roadmap?
  6. How can developers integrate?
  7. What are the use cases?
  8. Tell me about achievements

- **Welcome Screen**: 6 suggestion buttons for first-time users
- **Quick Chips**: 4 quick suggestion chips above input during conversation
- **Smart Responses**: Context-aware with knowledge base integration
- **Loading States**: Typing indicators and disabled states
- **Auto-scroll**: Automatically scrolls to latest message

#### Configuration
```env
# Optional: Set your preferred AI provider
VITE_OPENAI_API_KEY=your-openai-api-key
# Or
VITE_GEMINI_API_KEY=your-gemini-api-key
```

---

### 2. **Interactive 3D Globe** ✅

#### Component (`src/components/Globe3D.tsx`)
- Beautiful 3D Earth visualization with WebGL rendering
- Real-time node distribution across global regions
- Interactive rotation and zoom controls
- Hover tooltips with regional statistics

#### Technologies Used
- **Three.js**: 3D graphics engine
- **React Three Fiber**: React renderer for Three.js
- **React Three Drei**: Helper components (OrbitControls, Sphere, Html)

#### Features
- **Realistic Earth Model**
  - Textured globe with continents and oceans
  - Atmospheric glow effect
  - Cloud layer with independent rotation
  - Star field background with 5000 stars

- **Regional Markers**
  - Color-coded markers for each region
  - Size based on node count (logarithmic scale)
  - Pulse animation for active regions
  - Glow effects on hover

- **Interactive Controls**
  - Auto-rotation (0.5 speed, can be paused by interaction)
  - Zoom in/out with mouse wheel (3-10 distance range)
  - Drag to rotate globe in any direction
  - Smooth animations and transitions

- **Regional Statistics Display**
  - Hover over markers to see detailed stats
  - Node count (total and online)
  - Total storage capacity in TB
  - Average uptime percentage
  - Color-coded health badges

- **Supported Regions**
  - 🔵 US-East (New York)
  - 🟣 US-West (San Francisco)
  - 🟢 EU-Central (Frankfurt)
  - 🟦 EU-West (London)
  - 🟠 Asia-Pacific (Tokyo)
  - 🌸 South America (São Paulo)
  - 🔴 Africa (Nairobi)
  - 🔷 Oceania (Sydney)

#### Performance
- Optimized 3D rendering at 60 FPS
- Efficient marker system with instancing
- Responsive canvas sizing (600px height)
- Hardware-accelerated WebGL rendering

---

### 3. **Live pRPC Integration** ✅

#### RPC Service Layer (`src/services/rpc.ts`)
- Full JSON-RPC 2.0 client implementation
- Configurable endpoints with fallback support
- Automatic retry logic with exponential backoff
- Request timeout handling
- Support for both mock and live data modes

#### Configuration (`src/config/api.ts`)
- Environment-based configuration
- Primary and fallback endpoints
- WebSocket support
- Polling intervals
- Customizable timeout and retry settings

**Available RPC Methods:**
- `getClusterNodes` - Fetch all pNodes from gossip
- `getNodeInfo` - Get specific node details
- `getNetworkStats` - Retrieve network statistics
- `getClusterInfo` - Get blockchain cluster info
- `getGossipNodes` - Fetch nodes from gossip protocol
- `healthCheck` - Verify RPC endpoint health

---

### 2. **Error Handling & Loading States** ✅

#### Components Created
- `LoadingState.tsx` - Spinner with customizable sizes
- `LoadingCard.tsx` - Skeleton loading cards
- `LoadingGrid.tsx` - Grid of loading skeletons
- `LoadingOverlay.tsx` - Full-screen loading overlay
- `ErrorState.tsx` - Error display with retry
- `ConnectionError.tsx` - Network connection errors
- `ErrorBoundaryFallback.tsx` - React error boundary

#### Features
- Graceful error handling with user-friendly messages
- Retry mechanisms for failed requests
- Loading indicators during data fetches
- Skeleton screens for better UX
- Error boundaries to catch React errors

---

### 3. **Real-Time Updates** ✅

#### WebSocket Implementation (`src/services/websocket.ts`)
- Full-duplex communication with pRPC servers
- Automatic reconnection with exponential backoff
- Message type system for different update types
- Subscription management for specific nodes

#### React Hooks (`src/hooks/useWebSocket.ts`)
- `useWebSocketConnection` - Manage WS connection
- `useRealtimePNodes` - Receive node updates
- `useRealtimeNode` - Subscribe to specific node
- `useWebSocketStatus` - Connection status indicator
- `useWebSocketMessage` - Custom message handler

#### Auto-Refresh
- Configurable polling interval (default: 30s)
- React Query cache invalidation
- Background data synchronization
- Manual refresh controls

**Message Types Supported:**
- `node_update` - Single node data update
- `node_status_change` - Status change notifications
- `network_stats` - Network-wide statistics
- `nodes_update` - Bulk node updates
- `error` - Error messages from server

---

### 4. **Advanced Analytics** ✅

#### Component (`src/components/AdvancedAnalytics.tsx`)

**6 Analytics Tabs:**

1. **Performance Distribution**
   - Pie chart of uptime ranges (Excellent/Good/Fair/Poor)
   - Replica sets distribution bar chart
   - Visual performance metrics

2. **Storage Analytics**
   - Storage utilization by node (bar chart)
   - Capacity vs utilization scatter plot
   - Top 20 nodes by storage usage
   - Identify storage bottlenecks

3. **Credits Analysis**
   - Credits distribution across ranges
   - Bar chart visualization
   - Performance-to-rewards correlation

4. **Regional Performance**
   - Average uptime by region
   - Node count per region
   - Dual-axis bar charts
   - Geographic performance insights

5. **Version Distribution**
   - Pie chart of software versions
   - Version adoption tracking
   - Identify outdated nodes

6. **Top Performers**
   - Top 10 nodes by credits
   - Horizontal bar chart
   - Uptime and storage metrics
   - Leaderboard functionality

**Charts Used:**
- Pie Charts (performance, versions)
- Bar Charts (storage, credits, replica sets)
- Scatter Plots (capacity vs utilization)
- Line Charts (trends)

---

### 5. **Geographic Visualization** ✅

#### Component (`src/components/GeographicMap.tsx`)

**Features:**
- Interactive world map with node markers
- Pulse animations on active regions
- Marker size based on node count
- Hover tooltips with detailed stats
- Color-coded health indicators (>80%, 50-80%, <50%)
- Regional breakdown table

**Supported Regions:**
- US-East (New York)
- US-West (San Francisco)
- EU-Central (Frankfurt)
- EU-West (London)
- Asia-Pacific (Tokyo)
- South America (São Paulo)

**Regional Metrics:**
- Total nodes per region
- Online node count
- Total storage capacity
- Average uptime percentage

---

### 6. **Node Comparison Tool** ✅

#### Component (`src/components/NodeComparison.tsx`)

**Features:**
- Side-by-side comparison of up to 4 nodes
- Search and select nodes to compare
- Real-time metric highlighting (best/worst)
- Comprehensive comparison table

**Metrics Compared:**
- Basic Info (Region, Version, Status)
- Performance (Uptime %, Credits)
- Storage (Capacity, Used, Utilization %)
- Network (Replica Sets, Last Seen, Addresses)
- Visual indicators for best/worst performers

**Visual Indicators:**
- 🔺 Green up arrow = Best performance
- 🔻 Red down arrow = Worst performance
- ➖ Gray dash = Neutral/Equal

---

### 7. **Alert & Notification System** ✅

#### Component (`src/components/NotificationSystem.tsx`)

**Notification Types:**
- 🔴 Node Offline - When a node goes offline
- 🟢 Node Online - When a node comes back online
- ⚠️ Low Storage - Storage below threshold
- ⚠️ High Utilization - Storage usage above threshold
- ℹ️ Version Outdated - Node running old version

**Features:**
- Real-time toast notifications
- Notification history panel
- Unread count badge
- Mark as read/unread
- Clear all functionality
- Customizable preferences

**User Preferences:**
- Enable/disable notifications
- Configure individual alert types
- Set storage threshold (default: 100 GB)
- Set utilization threshold (default: 90%)
- Settings persist in localStorage

---

### 8. **Data Export Functionality** ✅

#### Utility (`src/utils/export.ts`)

**Export Formats:**
- **JSON** - Complete structured data
- **CSV** - Spreadsheet-compatible format
- **TXT** - Human-readable plain text

**Export Options:**

1. **pNode Data Export**
   - Individual node details
   - Filtered node lists
   - All nodes with metadata

2. **Network Statistics Export**
   - Current network stats
   - Cluster information
   - Timestamp and metadata

3. **Current View Export**
   - Export exactly what you see
   - Includes filter information
   - Preserves sort order

**Exported Fields:**
- Public Key, Status, Addresses
- Version, Uptime %, Storage metrics
- Credits, Replica Sets, Region
- Last Seen, Shard Version, Feature Set

#### Component (`src/components/ExportButton.tsx`)
- Dropdown menu with format selection
- Separate options for nodes and stats
- Toast notifications on success/failure
- Loading state during export

---

### 9. **Advanced Search & Filtering** ✅

#### Component (`src/components/AdvancedSearchFilter.tsx`)

**Search Capabilities:**
- Text search across:
  - Public keys
  - IP addresses (gossip, pRPC)
  - Regions
  - Versions

**Quick Filters:**
- Status pills (All, Online, Syncing, Offline)
- One-click filter application
- Clear all filters button

**Advanced Filters Panel:**
- **Region Filter** - Dropdown of all regions
- **Version Filter** - Dropdown of all versions
- **Uptime Range** - Dual slider (0-100%)
- **Storage Range** - Capacity filtering
- **Sort Options** - 5 sort fields with ASC/DESC

**Filter State:**
- Active filter badges
- Visual indication of filtered results
- Filter persistence during session

---

### 10. **Sorting & Pagination** ✅

#### Features Implemented

**Sorting Options:**
- Public Key (alphabetical)
- Uptime (percentage)
- Credits (rewards earned)
- Storage (capacity/usage)
- Last Seen (timestamp)
- Ascending/Descending order toggle

**Pagination:**
- Configurable page size (10, 20, 50, 100)
- Smart page navigation
- First/Previous/Next/Last controls
- Ellipsis for large page counts
- Page size selector
- Results counter

**Performance:**
- Client-side filtering and sorting
- Efficient memoization
- Only render current page items
- Smooth transitions

**User Experience:**
- Maintains filter state across pages
- Auto-reset to page 1 on filter change
- Keyboard navigation support
- Clear visual indicators

---

## 🏗️ Architecture

### Project Structure

```
src/
├── components/
│   ├── ui/                     # shadcn/ui components (40+)
│   ├── AdvancedAnalytics.tsx   # Analytics dashboard
│   ├── AdvancedSearchFilter.tsx # Filtering & search
│   ├── ClusterInfoBar.tsx      # Cluster info display
│   ├── ErrorState.tsx          # Error handling
│   ├── ExportButton.tsx        # Data export
│   ├── Footer.tsx              # App footer
│   ├── GeographicMap.tsx       # World map visualization
│   ├── Header.tsx              # App header
│   ├── LoadingState.tsx        # Loading indicators
│   ├── NetworkCharts.tsx       # Chart components
│   ├── NetworkOverview.tsx     # Stats overview
│   ├── NodeComparison.tsx      # Node comparison
│   ├── NotificationSystem.tsx  # Alerts & notifications
│   ├── PNodeCard.tsx           # Individual node card
│   ├── PNodeGrid.tsx           # Node grid with filters
│   ├── SearchFilter.tsx        # Basic search
│   └── StatCard.tsx            # Stat display card
├── config/
│   └── api.ts                  # API configuration
├── hooks/
│   ├── useRpcQuery.ts          # React Query hooks
│   └── useWebSocket.ts         # WebSocket hooks
├── lib/
│   ├── mock-data.ts            # Mock data generators
│   └── utils.ts                # Utility functions
├── pages/
│   ├── Dashboard.tsx           # Main dashboard (NEW)
│   ├── Index.tsx               # Home page
│   ├── NotFound.tsx            # 404 page
│   └── PNodeDetail.tsx         # Node details page
├── services/
│   ├── rpc.ts                  # RPC client service
│   └── websocket.ts            # WebSocket service
├── types/
│   └── pnode.ts                # TypeScript interfaces
├── utils/
│   └── export.ts               # Export utilities
└── App.tsx                     # Main app component
```

### Technology Stack

**Frontend:**
- React 18.3.1 with TypeScript
- Vite 5.4.19 (build tool)
- Tailwind CSS 3.4.17 (styling)
- shadcn/ui (UI components)

**State Management:**
- TanStack React Query 5.83.0 (server state)
- React Hook Form 7.61.1 (forms)
- Zustand (client state - if needed)

**Data Visualization:**
- Recharts 2.15.4 (charts)
- Custom SVG components (maps)

**Real-Time:**
- WebSocket API
- React Query polling
- Server-Sent Events (SSE) ready

**Routing:**
- React Router DOM 6.30.1

---

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Configuration

Edit `.env` file:

```env
# pRPC Configuration
VITE_PRPC_ENDPOINT=http://your-prpc-endpoint:6000
VITE_PRPC_WS_ENDPOINT=ws://your-prpc-endpoint:6000
VITE_USE_MOCK_DATA=false  # Set to true for mock data
VITE_NETWORK=devnet

# Feature Flags
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EXPORT=true

# Polling & Timeouts
VITE_API_TIMEOUT=10000
VITE_POLLING_INTERVAL=30000
```

### Running the App

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:8080`

---

## 🔌 API Integration

### Connecting to Live pRPC

1. **Update .env file:**
   ```env
   VITE_PRPC_ENDPOINT=http://your-endpoint:6000
   VITE_USE_MOCK_DATA=false
   ```

2. **Verify endpoint is accessible:**
   ```bash
   curl -X POST http://your-endpoint:6000 \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"health","params":[]}'
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

### Expected RPC Methods

The platform expects these JSON-RPC 2.0 methods:

```typescript
// Get all cluster nodes
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getClusterNodes",
  "params": []
}

// Get specific node info
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "getNodeInfo",
  "params": ["<pubkey>"]
}

// Get network statistics
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "getNetworkStats",
  "params": []
}

// Get cluster info
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "getClusterInfo",
  "params": []
}
```

### Expected Response Format

**PNode Object:**
```typescript
{
  pubkey: string;           // Base58 public key
  gossip: string;           // IP:PORT for gossip
  prpc: string;             // IP:PORT for pRPC
  version: string;          // Software version
  shredVersion: number;     // Shred version
  featureSet: number;       // Feature set number
  status: 'online' | 'offline' | 'syncing';
  uptime: number;           // 0-100 percentage
  storageCapacity: number;  // GB
  storageUsed: number;      // GB
  credits: number;          // XAND credits
  replicaSets: number;      // Number of replica sets
  lastSeen: string;         // ISO timestamp
  region?: string;          // Geographic region
}
```

---

## 📊 Dashboard Features

### Main Dashboard (`/`)

**4 Main Tabs:**

1. **Overview** - Network stats, charts, and node grid
2. **Analytics** - Advanced analytics with 6 sub-tabs
3. **Map** - Geographic distribution visualization
4. **Compare** - Side-by-side node comparison

**Top Bar:**
- Refresh button (manual data reload)
- Notification bell (with unread count)
- Export button (multiple formats)

### Node Detail Page (`/node/:pubkey`)

**Displays:**
- Node status and health
- Storage metrics with progress bars
- Network addresses (copy-to-clipboard)
- Historical uptime (if available)
- Replica set information
- Credits and rewards

---

## 🎨 UI/UX Features

### Design System
- Dark theme with teal/cyan accents
- Glassmorphism effects
- Smooth animations and transitions
- Responsive grid layouts (1-4 columns)
- Mobile-first approach

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Contrast-compliant colors

### Performance
- Code splitting
- Lazy loading
- Memoized computations
- Virtual scrolling (for large lists)
- Optimized re-renders

---

## 🧪 Mock Data Mode

For development and testing, the platform includes a robust mock data generator:

**Features:**
- 42 realistic pNode profiles
- Varied metrics (uptime, storage, credits)
- Regional distribution
- Version variety
- Simulated network delay

**Enable Mock Mode:**
```env
VITE_USE_MOCK_DATA=true
```

---

## 🔒 Security Considerations

- No sensitive data stored in localStorage (except preferences)
- CORS-compliant API requests
- Input sanitization for search queries
- XSS protection via React
- Safe JSON parsing with error handling

---

## 🐛 Troubleshooting

### WebSocket Connection Fails
- Check `VITE_PRPC_WS_ENDPOINT` in .env
- Verify WebSocket server is running
- Check browser console for errors
- Try disabling with `VITE_ENABLE_WEBSOCKET=false`

### Data Not Loading
- Verify `VITE_PRPC_ENDPOINT` is correct
- Check network tab in DevTools
- Enable mock mode for testing
- Check RPC server health

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

---

## 📈 Future Enhancements

Potential features for future releases:

- [ ] WebSocket support for live data streaming
- [ ] Custom dashboard layouts (drag & drop)
- [ ] Historical data charts and trends
- [ ] Alert rules engine
- [ ] Performance benchmarking
- [ ] Multi-network support
- [ ] API rate limiting UI
- [ ] Dark/Light theme toggle
- [ ] Export scheduled reports
- [ ] Advanced node health scoring

---

## 📝 License

This project is part of the Xandeum ecosystem.

---

## 🤝 Contributing

For questions or contributions, join the Xandeum Discord:
https://discord.gg/uqRSmmM5m

## 📚 Documentation

- Official Xandeum Docs: https://docs.xandeum.network
- pNode Setup Guide: https://pnodes.xandeum.network
- Xandeum Website: https://xandeum.network

---

**Built with ❤️ for the Xandeum Network**
