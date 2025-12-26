# Xandeum Pulse - pNode Network Analytics Platform

<div align="center">

![Xandeum Pulse](https://img.shields.io/badge/Xandeum-Pulse-06b6d4?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-success?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**Real-time analytics platform for monitoring Xandeum pNode network performance**

[Live Demo](#) • [Documentation](./FEATURES.md) • [Quick Start](./QUICKSTART.md)

</div>

---

## 🌟 About Xandeum Pulse

Xandeum Pulse is a comprehensive analytics platform designed to monitor and analyze the Xandeum pNode network. Built for the Xandeum ecosystem, it provides real-time insights into the decentralized storage infrastructure that powers scalable storage for Solana dApps.

### What is Xandeum?

Xandeum is building a **scalable storage layer for Solana dApps**. We think of it as a second tier of Solana accounts that can grow to **exabytes and beyond**. This lives on its own network of storage provider nodes, which we call **pNodes**.

---

## ✨ Key Features

### 🔴 Live Data Integration
- Real-time pRPC endpoint connectivity
- WebSocket support for live updates
- Auto-refresh every 30 seconds
- Configurable polling intervals
- Health monitoring and status indicators
- Supabase integration for historical data storage
- Smart data fetching: Supabase → pRPC fallback

### 📊 Advanced Analytics Dashboard
- **6 Analytics Views:**
  - Performance distribution (pie charts)
  - Storage utilization (bar & scatter charts)
  - Credits distribution
  - Regional performance comparison
  - Version adoption tracking
  - Top 10 performers leaderboard

### 🌍 3D Global Map Visualization
- **Interactive 3D Globe** powered by MapLibre GL
- Spherical Earth projection with atmospheric effects
- Theme-aware styling (auto dark/light mode switching)
- 8 regional markers with color coding
- Drag to rotate, scroll to zoom
- Click markers for detailed regional statistics
- Real-time node counts and health indicators

### 🔍 Advanced Search & Filtering
- Multi-field search (pubkey, IP, region, version)
- Status filters (online, syncing, offline)
- Uptime range slider
- Storage capacity filtering
- Region and version dropdowns

### ⚡ Smart Features
- **AI Chatbot Assistant** - Intelligent chatbot with multi-provider support (OpenAI, Gemini, local fallback)
- **Suggested Questions** - Clickable pre-defined questions for quick answers
- **Node Comparison** - Compare up to 4 nodes side-by-side
- **Notifications** - Real-time alerts for node status changes
- **Data Export** - JSON, CSV, TXT formats
- **Sorting & Pagination** - 5 sort fields, customizable page sizes
- **Mobile Apps** - Download links available in footer

### 📚 In-App Documentation
- Comprehensive 5-tab documentation
- User guides and tutorials
- Metric explanations
- API configuration help

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd xandeum-pulse

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Configuration

Edit the `.env` file (copied from `.env.example`):

#### Option 1: Development with Mock Data (Default)

```env
VITE_USE_MOCK_DATA=true
VITE_NETWORK=devnet
```

#### Option 2: Connect to Live pRPC Endpoint

```env
# pRPC endpoint - supports IP addresses (e.g., http://192.168.1.100:6000/rpc)
VITE_PRPC_ENDPOINT=http://192.168.1.100:6000/rpc
VITE_PRPC_WS_ENDPOINT=ws://192.168.1.100:6000
VITE_USE_MOCK_DATA=false
VITE_NETWORK=devnet
```

**Important**: All pRPC endpoints must include the `/rpc` path.

#### Option 3: With Supabase Historical Data

```env
# pRPC endpoint
VITE_PRPC_ENDPOINT=http://192.168.1.100:6000/rpc
VITE_USE_MOCK_DATA=false

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ENABLE_HISTORICAL_DATA=true

# Optional settings
VITE_POLLING_INTERVAL=30000
VITE_API_TIMEOUT=10000
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_NOTIFICATIONS=true
```

---

## 🏗️ Technology Stack

### Core
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Vite 5.4.19** - Build tool & dev server

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Lucide React** - Icon system
- **Recharts 2.15.4** - Data visualization

### 3D Graphics
- **Three.js** - Pure WebGL 3D rendering engine

### State & Data
- **TanStack React Query 5.83.0** - Server state management
- **React Router DOM 6.30.1** - Client-side routing
- **WebSocket API** - Real-time updates
- **Supabase** - PostgreSQL database for historical data & analytics

### Forms & Validation
- **React Hook Form 7.61.1** - Form handling
- **Zod** - Schema validation

---

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components (40+)
│   ├── AdvancedAnalytics.tsx
│   ├── AdvancedSearchFilter.tsx
│   ├── Chatbot.tsx      # AI chatbot interface
│   ├── ErrorState.tsx
│   ├── ExportButton.tsx
│   ├── Globe3DSimple.tsx # Pure Three.js 3D globe
│   ├── GlobeWrapper.tsx  # Globe lazy loading wrapper
│   ├── LoadingState.tsx
│   ├── MobileAppDownloadCompact.tsx
│   ├── NetworkCharts.tsx
│   ├── NodeComparison.tsx
│   ├── NotificationSystem.tsx
│   └── PNodeGrid.tsx
├── config/
│   ├── api.ts           # API configuration
│   └── supabase.ts      # Supabase client config
├── contexts/
│   └── ChatbotContext.tsx  # Chatbot state management
├── hooks/
│   ├── useRpcQuery.ts   # React Query hooks
│   └── useWebSocket.ts  # WebSocket hooks
├── pages/
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Docs.tsx         # Documentation
│   ├── Index.tsx        # Home page
│   └── PNodeDetail.tsx  # Node details
├── services/
│   ├── chatbot.ts       # AI chatbot service with knowledge base
│   ├── rpc.ts           # RPC client
│   ├── supabase.ts      # Supabase service layer
│   └── websocket.ts     # WebSocket client
├── types/
│   └── pnode.ts         # TypeScript types
└── utils/
    └── export.ts        # Export utilities

backend/
├── src/
│   ├── config/          # Backend configuration
│   ├── services/        # Sync and pRPC services
│   ├── types/           # TypeScript types
│   └── index.ts         # Express server
├── Procfile             # Heroku deployment config
└── package.json         # Backend dependencies

supabase/
└── schema.sql           # Database schema & migrations
```

---

## 📖 Documentation

- **[FEATURES.md](./FEATURES.md)** - Complete feature documentation (15+ pages)
- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[.env.example](./.env.example)** - Environment configuration template

---

## 🎯 Usage

### Main Features

1. **Dashboard** (`/`) - Network overview and pNode grid
2. **Documentation** (`/docs`) - In-app help and guides
3. **Node Detail** (`/node/:pubkey`) - Detailed node information

### Key Actions

- **Search** - Find nodes by pubkey, IP, or region
- **Filter** - Use status pills or advanced filters
- **Sort** - Click column headers to sort
- **Export** - Download data in multiple formats
- **Compare** - Select up to 4 nodes for comparison
- **Notifications** - Configure alerts for important events

---

## 🔧 Development

### Available Scripts

```bash
# Development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Connecting to Live pRPC

Xandeum Pulse connects to pNodes using the **JSON-RPC 2.0** protocol over HTTP.

#### pRPC API Overview

The pNode pRPC API provides three core methods:

- `get-version` - Returns pNode software version
- `get-stats` - Returns comprehensive node statistics (CPU, RAM, storage, uptime)
- `get-pods` - Returns list of peer pNodes in the gossip network

**Default Endpoint**: `http://<pnode-ip>:6000/rpc`

#### Setup Steps

1. **Configure your pNode endpoint** in `.env`:
   ```env
   VITE_PRPC_ENDPOINT=http://192.168.1.100:6000/rpc
   VITE_USE_MOCK_DATA=false
   ```

2. **Restart the development server**:
   ```bash
   npm run dev
   ```

3. **Verify connection**:
   - Check the header for "Live" badge status
   - View pNodes appearing in the dashboard
   - Open browser DevTools Network tab to see API calls

#### Network Ports

- **Port 6000**: pRPC API server (configurable IP binding)
- **Port 80**: Statistics dashboard (localhost only)
- **Port 9001**: Gossip protocol for peer discovery
- **Port 5000**: Atlas server connection

#### Multiple Endpoints (Load Balancing)

You can configure fallback endpoints in [src/config/api.ts](src/config/api.ts:19):

```typescript
fallbackEndpoints: [
  'http://192.168.1.101:6000/rpc',
  'http://192.168.1.102:6000/rpc',
]
```

### Setting Up Supabase (Historical Data)

Xandeum Pulse uses Supabase to store historical pNode data for analytics:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema**:
   - Go to SQL Editor in Supabase dashboard
   - Copy contents from [supabase/schema.sql](supabase/schema.sql)
   - Execute the SQL script

3. **Configure environment variables**:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_ENABLE_HISTORICAL_DATA=true
   ```

4. **Data Flow**:
   - When `VITE_USE_MOCK_DATA=false`, the app fetches from Supabase first
   - Falls back to direct pRPC calls if Supabase data is unavailable
   - Historical data enables trend analysis and time-series charts

The schema includes:
- `pnodes` - Current state of all pNodes
- `pnode_history` - Time-series data with automatic recording
- `network_stats` - Aggregated network metrics over time
- `pnode_metrics` - Detailed performance metrics

---

## 📊 Metrics Explained

### Node Metrics
- **Uptime** - Percentage of time node is online (99%+ = Excellent)
- **Storage Capacity** - Total committed storage space (GB/TB)
- **Storage Utilization** - Percentage of committed storage used (<70% = Healthy)
- **Credits** - XAND token rewards earned by pNode operators
- **Replica Sets** - Number of data replicas (1-8)
- **Version** - Software version

### Network Metrics
- **Total Nodes** - All registered pNodes
- **Online Nodes** - Currently operational nodes
- **Total Storage** - Combined capacity (TB)
- **Average Uptime** - Network reliability metric

### Important Terminology
- **XAND Token** - Native cryptocurrency of Xandeum network, tradeable digital asset
- **XAND Credits** - Internal reward units shown in dashboard, representing XAND tokens earned by pNode operators
- **pNode** - Storage provider node in the Xandeum network

---

## 🚢 Deployment

### Frontend Deployment

#### Build for Production

```bash
npm run build
```

The `dist/` folder contains the production-ready build.

#### Deploy Options

- **Vercel** - Recommended for Vite apps
- **Netlify** - Great for static sites
- **AWS S3 + CloudFront** - Scalable hosting
- **Self-hosted** - Nginx or Apache

### Backend Deployment

The backend sync service is deployed on **Heroku** and handles automatic data synchronization from pRPC endpoints to Supabase.

**Live Backend**: [https://xandeum-pulse-backend-d14bfb49c722.herokuapp.com/](https://xandeum-pulse-backend-d14bfb49c722.herokuapp.com/)

#### Heroku Deployment Steps

```bash
# Navigate to backend directory
cd backend

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your-supabase-url
heroku config:set SUPABASE_SERVICE_KEY=your-service-key
heroku config:set PRPC_ENDPOINTS=your-endpoints
heroku config:set SYNC_INTERVAL_SECONDS=30

# Initialize git and deploy
git init
git add .
git commit -m "Initial deployment"
heroku git:remote -a your-app-name
git push heroku main
```

#### Verify Deployment

```bash
# Check health endpoint
curl https://your-app-name.herokuapp.com/health

# Check sync status
curl https://your-app-name.herokuapp.com/sync/status
```

See [backend/README.md](backend/README.md) for detailed backend documentation.

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🤖 AI Chatbot Assistant

Xandeum Pulse includes an intelligent AI chatbot that answers questions about Xandeum, pNodes, and the network.

### Features
- **Multi-Provider Support**: OpenAI GPT-4, Google Gemini, and local fallback
- **Knowledge Base**: Comprehensive information about Xandeum ecosystem
- **Suggested Questions**: 8 clickable pre-defined questions for quick answers
- **Persistent Context**: Maintains conversation history
- **Floating Widget**: Accessible from any page

### Suggested Questions
1. What is Xandeum?
2. How do pNodes work?
3. What are XAND tokens?
4. Tell me about tokenomics
5. What's the roadmap?
6. How can developers integrate?
7. What are the use cases?
8. Tell me about achievements

### Configuration

Set your AI provider API key in `.env`:

```env
# OpenAI (recommended)
VITE_OPENAI_API_KEY=your-openai-api-key

# Or Google Gemini
VITE_GEMINI_API_KEY=your-gemini-api-key
```

The chatbot automatically falls back to a local knowledge base if no API keys are configured.

---

## 📱 Mobile Apps

Mobile app download links are available in the footer.

- App Store (iOS) - Download link in footer
- Google Play (Android) - Download link in footer

---

## 🔗 Links

- **Xandeum Website**: [xandeum.network](https://xandeum.network)
- **Documentation**: [docs.xandeum.network](https://docs.xandeum.network)
- **pNode Setup**: [pnodes.xandeum.network](https://pnodes.xandeum.network)
- **Discord**: [discord.gg/uqRSmmM5m](https://discord.gg/uqRSmmM5m)

---

## 👨‍💻 Developer

**Made with ❤️ by [0xstarhq](https://x.com/0xstarhq)**

- **Twitter/X**: [@0xstarhq](https://x.com/0xstarhq)
- **Superteam**: [0xstarhq](https://earn.superteam.fun/t/0xstarhq)
- **GitHub**: [@timedbase](https://github.com/timedbase)

---

## 📄 License

This project is built for the Xandeum Network ecosystem.

---

## 🙏 Acknowledgments

- **Xandeum Team** - For building the future of decentralized storage
- **Solana Foundation** - For the underlying blockchain infrastructure
- **Superteam** - For supporting Web3 builders

---

## 💬 Support

- Join our [Discord](https://discord.gg/uqRSmmM5m) for community support
- Check [Documentation](./FEATURES.md) for detailed guides
- Open an issue for bug reports or feature requests

---

<div align="center">

**Built for the Xandeum Network** 🚀

[Twitter](https://x.com/0xstarhq) • [Superteam](https://earn.superteam.fun/t/0xstarhq) • [GitHub](https://github.com/timedbase)

</div>
