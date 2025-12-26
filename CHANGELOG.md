# Changelog

All notable changes to Xandeum Pulse Analytics Platform.

## [Unreleased]

### Added - 3D Globe Visualization (2025-12-26)

#### 🌍 MapLibre GL 3D Globe
- **Interactive 3D Globe Visualization**
  - 3D spherical Earth with globe projection
  - Theme-aware styling (automatic dark/light mode switching)
  - Smooth rotation and zoom controls
  - Atmospheric effects with fog and stars
  - Professional CartoDB basemap tiles

- **Theme Integration**
  - **Dark Mode**: Custom dark theme matching dashboard colors
    - Dark blue ocean/space background
    - Desaturated, muted map tiles (50% opacity)
    - Teal atmospheric glow (primary theme color)
    - Enhanced star field for depth
  - **Light Mode**: Clean bright CartoDB light theme
    - Light gray background
    - Full opacity bright map tiles
    - Subtle teal atmosphere
    - Minimal stars for daytime appearance

- **Interactive Regional Markers**
  - Compact, professional marker design (16-22px)
  - Color-coded for 8 global regions
  - Smart sizing based on node count
  - Smooth hover animations (1.5x scale + glow)
  - Click to show detailed statistics popup

- **Regional Coverage**
  - US-East (Blue #3b82f6) - New York, NY
  - US-West (Purple #8b5cf6) - San Francisco, CA
  - EU-Central (Green #10b981) - Frankfurt, Germany
  - EU-West (Teal #14b8a6) - London, UK
  - Asia-Pacific (Orange #f59e0b) - Tokyo, Japan
  - South America (Pink #ec4899) - São Paulo, Brazil
  - Africa (Red #ef4444) - Nairobi, Kenya
  - Oceania (Cyan #06b6d4) - Sydney, Australia

- **Interactive Features**
  - Drag to rotate the globe
  - Scroll to zoom (optimized at 2.5x default)
  - Navigation controls (top-right)
  - Click markers for detailed region stats
  - Legend with node counts per region
  - Real-time statistics display

- **Performance & UX**
  - 60 FPS rendering target
  - WebGL hardware acceleration
  - Efficient instanced rendering for markers
  - Responsive canvas sizing
  - Optimized geometry with LOD

#### 📦 New Dependencies
- **maplibre-gl** (^5.15.0) - Open-source mapping library (MapLibre GL JS)
- **react-map-gl** (^8.1.0) - React wrapper for MapLibre GL

#### 🎨 UI Updates
- Added "Global Map" tab with MapLibre visualization
- Interactive markers with popup details
- Color-coded regional legend
- Smooth map controls (pan, zoom, rotate)
- Consistent dark theme styling

#### 📝 Files Added/Modified
- **Created**: [src/components/MapLibreGlobe.tsx](src/components/MapLibreGlobe.tsx) - MapLibre GL map component
- **Modified**: [src/components/GlobeWrapper.tsx](src/components/GlobeWrapper.tsx) - Updated to use MapLibre
- **Modified**: [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx) - Integrated global map tab
- **Modified**: package.json - Added MapLibre GL dependencies, removed Three.js

#### ⚡ Performance Enhancements
- Lightweight MapLibre GL implementation (~500KB gzipped)
- Vector tile rendering for smooth 60 FPS performance
- Hardware-accelerated WebGL rendering
- Efficient marker rendering with automatic clustering
- Responsive design for mobile and desktop

#### 🐛 Bug Fixes
- **Fixed PNodeCard null reference errors**
  - Added null checks for `cpuPercent` before calling `toFixed()`
  - Added null checks for `credits` before calling `toLocaleString()`
  - Prevents "Cannot read properties of null" crashes
  - File: [src/components/PNodeCard.tsx](src/components/PNodeCard.tsx)

---

### Added - AI Chatbot & Backend Deployment (2025-12-24)

#### 🤖 AI Chatbot Assistant
- **Multi-Provider AI Integration**
  - OpenAI GPT-4 support (primary provider)
  - Google Gemini support (fallback provider)
  - Local knowledge base fallback (offline mode)
  - Automatic provider selection and fallback logic

- **Chatbot UI Components**
  - Floating chat widget accessible from any page ([src/components/Chatbot.tsx](src/components/Chatbot.tsx))
  - Modern, clean interface with smooth animations
  - Welcome screen with branding and quick start guide
  - Message history with user/assistant differentiation
  - Auto-scroll to latest message
  - Loading states and typing indicators

- **Suggested Questions Feature**
  - 8 pre-defined clickable questions for quick answers
  - Welcome screen displays 6 suggestion buttons for first-time users
  - Quick suggestion chips (4 questions) appear above input during conversation
  - Questions cover: What is Xandeum, pNodes, XAND tokens, tokenomics, roadmap, developer integration, use cases, achievements

- **Comprehensive Knowledge Base** ([src/services/chatbot.ts](src/services/chatbot.ts))
  - What is Xandeum and the network
  - pNodes infrastructure and how they work
  - XAND tokens vs XAND credits (important distinction)
  - Tokenomics and economics
  - Technology architecture (Golang, Solana, consensus)
  - Developer integration guides
  - Roadmap and achievements
  - Use cases and applications

- **Context Management**
  - Global state management with React Context ([src/contexts/ChatbotContext.tsx](src/contexts/ChatbotContext.tsx))
  - Conversation history persistence
  - Provider availability checking
  - Error handling and fallback logic

#### 🚀 Backend Deployment to Heroku
- **Production Deployment**
  - Deployed backend sync service to Heroku
  - Live at: https://xandeum-pulse-backend-d14bfb49c722.herokuapp.com/
  - Syncing 214 nodes every 30 seconds
  - Automatic data synchronization from pRPC endpoints to Supabase

- **Heroku Configuration Files**
  - Added `Procfile` for Heroku deployment configuration
  - Updated `package.json` with `heroku-postbuild` script
  - Created `.slugignore` to optimize deployment size
  - Full deployment documentation in [backend/README.md](backend/README.md)

- **Environment Variables**
  - Configured all required environment variables on Heroku
  - NODE_ENV, SUPABASE_URL, SUPABASE_SERVICE_KEY
  - PRPC_ENDPOINTS, SYNC_INTERVAL_SECONDS
  - API_TIMEOUT_MS, MAX_RETRIES, LOG_LEVEL

- **Health Monitoring**
  - Health endpoint: `/health`
  - Sync status endpoint: `/sync/status`
  - Manual trigger endpoint: `/sync/trigger`

#### 📝 Terminology Clarification
- **XAND Token vs XAND Credits**
  - XAND Token: Native cryptocurrency, tradeable digital asset
  - XAND Credits: Internal reward units shown in dashboard
  - Clear distinction enforced throughout chatbot responses
  - Updated system prompt with explicit rules
  - Knowledge base entries updated for accuracy

#### 🐛 Bug Fixes
- **Node Detail Pages Fixed** ([src/pages/PNodeDetail.tsx](src/pages/PNodeDetail.tsx))
  - Fixed crash: "Cannot read properties of undefined (reading 'toLocaleString')"
  - Corrected property names to match PNode type:
    - `storageCapacity` → `storageCommitted` (with byte-to-GB conversion)
    - `uptime` → `uptimeSeconds` (calculated to percentage)
  - Removed references to non-existent properties:
    - Removed `shredVersion` field
    - Removed `featureSet` field
  - Added proper calculations for storage and uptime displays
  - Node pages now properly display based on node pubkey

#### 🎨 UI/UX Improvements
- **Mobile App Section Cleanup**
  - Removed duplicate mobile app download section from homepage ([src/pages/Index.tsx](src/pages/Index.tsx))
  - Retained mobile app download links in footer ([src/components/Footer.tsx](src/components/Footer.tsx))
  - Cleaner, more organized layout

#### 📚 Documentation Updates
- **Main README.md**
  - Added AI Chatbot Assistant section with features and configuration
  - Added Backend Deployment section with Heroku steps
  - Updated project structure to include chatbot components
  - Added terminology section (XAND Token vs Credits)
  - Updated metrics explanations
  - Expanded deployment options with Heroku guide

- **Backend README.md** ([backend/README.md](backend/README.md))
  - Added comprehensive Heroku deployment guide
  - Included initial setup, configuration, and verification steps
  - Added troubleshooting section for common deployment issues
  - Documented required files for Heroku deployment
  - Added live backend URL reference

- **Features Documentation** ([FEATURES.md](FEATURES.md))
  - Added complete AI Chatbot Assistant section
  - Documented multi-provider architecture
  - Listed all 8 suggested questions
  - Included configuration examples
  - Documented knowledge base topics

#### 🔧 Technical Improvements
- **Type Safety**
  - Fixed PNode interface property mismatches
  - Proper type alignment throughout codebase
  - Corrected storage metrics (bytes to GB conversion)
  - Fixed uptime calculations (seconds to percentage)

- **Code Organization**
  - Added `src/contexts/` directory for React Context providers
  - Added `src/services/chatbot.ts` for AI service layer
  - Improved separation of concerns

---

## Previous Changes

### Added - WebSocket Real-Time Updates & Credits Integration
- 5-second sync interval (changed from 60 seconds)
- Credits API integration from `https://podcredits.xandeum.network/api/pods-credits`
- WebSocket real-time updates replacing polling
- 22x faster update latency (~2.7 seconds vs 60 seconds)
- Credits display in node cards and details
- Comprehensive real-time subscription system

### Added - Core Analytics Platform
- Live pRPC integration with JSON-RPC 2.0
- Advanced analytics with 6 visualization tabs
- Geographic visualization with interactive world map
- Node comparison tool (up to 4 nodes)
- Alert & notification system
- Export functionality (JSON, CSV, TXT)
- Advanced search and filtering
- Supabase integration for historical data
- Responsive design with mobile support

---

## Migration Notes

### Environment Variables Required

**.env (Frontend)**
```env
# Optional: AI Provider API Keys
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key

# Existing variables
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**backend/.env**
```env
# Heroku will set these via heroku config:set
NODE_ENV=production
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
PRPC_ENDPOINTS=your-endpoints
SYNC_INTERVAL_SECONDS=30
```

### Files Added
- `src/components/Chatbot.tsx` - Chatbot UI component
- `src/contexts/ChatbotContext.tsx` - Chatbot state management
- `src/services/chatbot.ts` - AI service with knowledge base
- `backend/Procfile` - Heroku deployment configuration
- `backend/.slugignore` - Heroku build optimization
- `CHANGELOG.md` - This file

### Files Modified
- `src/pages/Index.tsx` - Removed mobile app section
- `src/pages/PNodeDetail.tsx` - Fixed type mismatches
- `src/services/chatbot.ts` - Added XAND token/credits distinction
- `backend/package.json` - Added heroku-postbuild script
- `backend/README.md` - Added Heroku deployment guide
- `README.md` - Added chatbot and deployment sections
- `FEATURES.md` - Added chatbot documentation

---

## Links

- **Live Backend**: https://xandeum-pulse-backend-d14bfb49c722.herokuapp.com/
- **GitHub**: [Your Repository URL]
- **Documentation**: See README.md and FEATURES.md
- **Xandeum Network**: https://xandeum.network
