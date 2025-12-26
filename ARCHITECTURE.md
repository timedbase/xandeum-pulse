# Xandeum Pulse - System Architecture

This document describes the three-tier architecture of Xandeum Pulse.

---

## 🏗️ Architecture Overview

Xandeum Pulse uses a **three-tier architecture** to separate concerns and improve scalability:

```
┌─────────────────┐
│    Frontend     │  React App (Vite)
│   (Browser)     │  - Reads from Supabase ONLY
└────────┬────────┘  - No direct pRPC calls
         │
         │ Supabase Client (Read-Only)
         ▼
┌─────────────────┐
│    Supabase     │  PostgreSQL Database
│   (Database)    │  - Stores pNode data
└────────┬────────┘  - Stores network statistics
         │           - Provides historical data
         ▲
         │ Supabase Service Key (Write-Only)
         │
┌─────────────────┐
│ Backend Sync    │  Node.js/Express Server
│    Service      │  - Fetches from pRPC endpoints
└────────┬────────┘  - Updates Supabase every 5s
         │           - Port 3001
         │
         │ JSON-RPC 2.0 (All 4 methods)
         ▼
┌─────────────────┐
│  pRPC Endpoints │  pNode Network (8 endpoints)
│   (pNodes)      │  - get-version, get-stats
└─────────────────┘  - get-pods, get-pods-with-stats
```

---

## 📦 Components

### 1. Frontend (React + Vite)

**Location**: `/src`

**Purpose**: User interface for monitoring pNodes

**Technology Stack**:
- React 18.3.1
- TypeScript
- Tailwind CSS
- shadcn/ui components
- TanStack React Query
- Supabase JS client

**Data Flow**:
```typescript
// Frontend ONLY reads from Supabase
const { data: nodes } = useQuery({
  queryKey: ['pnodes'],
  queryFn: () => supabase.from('pnodes').select('*'),
  refetchInterval: 30000, // 30 seconds
});
```

**Key Files**:
- `src/services/rpc.ts` - RPC service (Supabase only)
- `src/services/supabase.ts` - Supabase client and queries
- `src/hooks/useRpcQuery.ts` - React Query hooks
- `src/config/api.ts` - API configuration

**Environment Variables**:
```env
VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### 2. Supabase (PostgreSQL Database)

**Location**: `/supabase/schema.sql`

**Purpose**: Central data store for pNode information

**Tables**:

#### `pnodes`
Current state of all pNodes in the network.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pubkey | TEXT | Unique node identifier |
| gossip | TEXT | Gossip endpoint (IP:port) |
| prpc | TEXT | pRPC endpoint (IP:port) |
| version | TEXT | Software version |
| status | TEXT | online, offline, or syncing |
| uptime | NUMERIC | Uptime percentage |
| storage_capacity | BIGINT | Total storage (GB) |
| storage_used | BIGINT | Used storage (GB) |
| credits | BIGINT | XAND credits earned |
| region | TEXT | Geographic region |
| last_seen | TIMESTAMPTZ | Last activity timestamp |
| updated_at | TIMESTAMPTZ | Last update time |

#### `pnode_history`
Time-series data for analytics and historical tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| pnode_id | UUID | Foreign key to pnodes |
| pubkey | TEXT | Node identifier |
| status | TEXT | Node status at time |
| uptime | NUMERIC | Uptime at time |
| storage_used | BIGINT | Storage used at time |
| credits | BIGINT | Credits at time |
| recorded_at | TIMESTAMPTZ | Recording timestamp |

#### `network_stats`
Aggregated network-wide statistics over time.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| total_nodes | INTEGER | Total pNodes |
| online_nodes | INTEGER | Online pNodes |
| total_storage | BIGINT | Total network storage (GB) |
| used_storage | BIGINT | Used network storage (GB) |
| total_credits | BIGINT | Total network credits |
| avg_uptime | NUMERIC | Average uptime percentage |
| network_version | TEXT | Common software version |
| recorded_at | TIMESTAMPTZ | Recording timestamp |

**Triggers**:
- `record_pnode_history_trigger` - Automatically records history on pnode updates
- `update_pnodes_updated_at` - Auto-updates `updated_at` timestamp

**Access Control**:
- **Frontend**: Read-only access via `anon` key
- **Backend Sync Service**: Full access via `service_role` key

---

### 3. Backend Sync Service (Node.js/Express)

**Location**: `/backend`

**Purpose**: Fetch pNode data from pRPC and update Supabase

**Execution**:
- **Scheduled**: Every 5 seconds (configured in `.env`)
- **Manual**: `POST http://localhost:3001/api/sync` or via status endpoint

**Process Flow**:
```
1. Fetch from pRPC endpoints (with failover)
   ├─ POST /rpc → get-version
   ├─ POST /rpc → get-stats
   ├─ POST /rpc → get-pods
   └─ POST /rpc → get-pods-with-stats

2. Transform data
   ├─ Extract node ID and pubkey
   ├─ Calculate node status from last_seen_timestamp (<55s=online, 55s-30min=syncing, >30min=offline)
   ├─ Extract comprehensive stats (CPU, RAM, network, storage, uptime)
   └─ Determine regions from node data

3. Update Supabase
   ├─ Upsert pnodes table (by pubkey)
   └─ Insert network_stats record

4. Return status
   └─ { success, nodes_synced, timestamp, endpoint }
```

**Environment Variables** (`backend/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
PRPC_ENDPOINTS=http://173.212.203.145:6000/rpc,http://173.212.220.65:6000/rpc,...
SYNC_INTERVAL_SECONDS=5
API_TIMEOUT_MS=10000
MAX_RETRIES=3
PORT=3001
```

**Failover Logic**:
```typescript
// Tries each endpoint in sequence until one succeeds
for (const endpoint of this.endpoints) {
  try {
    return await this.fetchFromEndpoint(endpoint, method, params);
  } catch (error) {
    logger.warn(`Failed to fetch from ${endpoint}, trying next...`);
    continue;
  }
}
throw new Error('All pRPC endpoints failed');
```

---

## 🔄 Data Flow

### Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    pNode Network                         │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ pNode 1  │  │ pNode 2  │  │ pNode 3  │   ...       │
│  │ :6000    │  │ :6000    │  │ :6000    │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │             │              │                    │
└───────┼─────────────┼──────────────┼────────────────────┘
        │             │              │
        │  JSON-RPC 2.0 over HTTP   │
        │             │              │
        ▼             ▼              ▼
┌─────────────────────────────────────────────────────────┐
│          Backend Sync Service (Node.js/Express)          │
│                                                          │
│  Every 5 seconds:                                       │
│  1. Call get-version, get-stats, get-pods, get-pods-with-stats │
│  2. Transform to database format                        │
│  3. Upsert to Supabase                                  │
│  4. Record network statistics                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Supabase Service Key
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase Database                      │
│                                                          │
│  Tables:                                                │
│  - pnodes (current state)                              │
│  - pnode_history (time-series)                         │
│  - network_stats (aggregated)                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Supabase Anon Key (Read-only)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  Frontend (React)                        │
│                                                          │
│  React Query auto-refresh (30s):                       │
│  - Fetch pnodes from Supabase                          │
│  - Fetch network_stats from Supabase                   │
│  - Display in dashboard                                │
│                                                          │
│  User sees: Real-time pNode data                       │
└─────────────────────────────────────────────────────────┘
```

### Timing (with WebSocket Realtime)

```
T+0s    Backend sync service starts
T+1s    Fetches from pRPC (get-version, get-stats, get-pods, get-pods-with-stats) + credits API
T+3s    Transforms and upserts to Supabase
T+3.1s  Supabase broadcasts changes via WebSocket ⚡
T+3.2s  Frontend receives update instantly and re-renders
T+5s    Backend sync runs again (5-second interval)
```

**Note**: Frontend now uses Supabase Realtime (WebSocket) for instant updates instead of polling. Users see changes within ~200ms of backend sync completion.

---

## 🔐 Security

### Access Control

**Frontend (Browser)**:
- Uses `VITE_SUPABASE_ANON_KEY`
- **Read-only** access to Supabase
- Cannot modify database
- Safe to expose in client-side code

**Vercel Function (Server)**:
- Uses `SUPABASE_SERVICE_KEY`
- **Full access** to Supabase
- Can insert, update, delete records
- Never exposed to client

**Rate Limiting**:
- Vercel automatically rate-limits cron jobs
- Public endpoint allows manual triggering for debugging
- Supabase RLS prevents unauthorized data modification

### Supabase RLS (Row Level Security)

```sql
-- Public read access for frontend
CREATE POLICY "Public read access for pnodes"
  ON pnodes FOR SELECT USING (true);

-- Service role can do everything (Vercel Function)
-- Automatic via service_role key
```

---

## 📊 Scalability

### Horizontal Scaling

**Frontend**:
- Static files served via Vercel CDN
- Scales automatically with traffic
- No server-side rendering overhead

**Vercel Function**:
- Serverless, scales automatically
- Each invocation runs independently
- Parallel execution for multiple regions

**Supabase**:
- Managed PostgreSQL with auto-scaling
- Connection pooling built-in
- Read replicas for heavy read loads

### Vertical Optimization

**Frontend**:
- React Query caching reduces API calls
- 30-second stale time prevents excessive requests
- Pagination for large pNode lists

**Vercel Function**:
- Parallel API calls (`Promise.all`)
- Batch upserts to Supabase
- Efficient data transformation

**Supabase**:
- Indexes on `pubkey`, `status`, `updated_at`
- Materialized views for complex queries
- Automatic vacuuming and optimization

---

## 🚀 Deployment

### Prerequisites

1. **Supabase Project**:
   - Create at [supabase.com](https://supabase.com)
   - Run `supabase/schema.sql` in SQL Editor
   - Get `SUPABASE_URL` and `SUPABASE_ANON_KEY`

2. **Vercel Project**:
   - Connect GitHub repo
   - Add environment variables
   - Enable cron jobs

3. **pRPC Endpoints**:
   - At least one working pRPC endpoint
   - Accessible from Vercel (public IP or VPN)

### Deployment Steps

#### 1. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### 2. Configure Environment Variables

In Vercel Project Settings → Environment Variables:

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJxxx...
PRPC_ENDPOINTS=http://173.212.203.145:6000/rpc,http://backup:6000/rpc
CRON_SECRET=<generate-random-string>
```

For frontend (.env for local, Vercel env for production):

```
VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

#### 3. Test Vercel Function

```bash
# Trigger manually
curl -X POST https://your-app.vercel.app/api/sync-pnodes

# Check response
{
  "success": true,
  "nodes_synced": 42,
  "timestamp": "2025-12-15T19:30:00.000Z"
}
```

#### 4. Verify Sync

Wait 5 seconds and check backend logs:
```
[RPC] Initialized with 2 endpoint(s): [...]
Fetching from endpoint: http://173.212.203.145:6000/rpc
Fetched 42 nodes from endpoint
Upserting 42 nodes to Supabase...
Successfully upserted nodes to Supabase
Successfully recorded network statistics
```

#### 5. Check Frontend

Open your deployed URL:
- Should see pNodes loading from Supabase
- Header shows "Live" badge
- Data updates every 30 seconds

---

## 🐛 Troubleshooting

### Frontend shows "No nodes"

**Check**:
1. `VITE_USE_MOCK_DATA=false` in `.env`
2. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Supabase schema is created
4. Vercel Function has run at least once

**Solution**:
```bash
# Manually trigger sync
curl -X POST https://your-app.vercel.app/api/sync-pnodes
```

### Vercel Function fails

**Check Vercel logs**:
- Go to Vercel Dashboard → Deployments → Functions
- Look for error messages

**Common issues**:
- `Missing Supabase configuration` → Add env vars
- `All pRPC endpoints failed` → Check endpoint URLs
- `Unauthorized` → Check `CRON_SECRET`

### Supabase RLS blocking writes

**Vercel Function needs service_role key**, not anon key:
```env
# Wrong (anon key)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...anon...

# Correct (service_role key)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...service_role...
```

---

## 📈 Monitoring

### Vercel Function Logs

```bash
vercel logs --follow
```

### Supabase Dashboard

- Go to Table Editor → `pnodes`
- Check last `updated_at` timestamp
- Should update every 5 seconds

### Frontend Health

Check browser console:
```
✅ Supabase connection successful
✅ Fetched 42 pNodes
✅ Network stats updated
```

---

## 🔧 Development

### Local Development

Frontend:
```bash
npm run dev
# Runs at http://localhost:8080
# Reads from Supabase (or mock data if VITE_USE_MOCK_DATA=true)
```

Vercel Function (local):
```bash
vercel dev
# Runs at http://localhost:3000
# Test: curl -X POST http://localhost:3000/api/sync-pnodes
```

### Testing

```bash
# Build frontend
npm run build

# Test Vercel Function locally
vercel dev

# Trigger sync
curl -X POST http://localhost:3000/api/sync-pnodes
```

---

## 📚 Related Documentation

- **[README.md](README.md)** - Project overview
- **[PRPC_SETUP.md](PRPC_SETUP.md)** - pRPC API documentation
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Deployment guide (to be created)
- **[supabase/schema.sql](supabase/schema.sql)** - Database schema

---

**Last Updated**: 2025-12-15
