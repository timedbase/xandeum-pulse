# Xandeum Pulse Deployment Guide

Simple deployment guide for Xandeum Pulse with direct pRPC integration and Supabase storage.

---

## 🎯 Architecture

```
Browser (Frontend)
    ↓
Fetches from pRPC every 60s (configurable)
    ↓
Writes to Supabase Database
    ↓
Reads from Supabase for display
```

**Key Features**:
- ✅ No serverless functions needed
- ✅ Direct pRPC calls from browser
- ✅ Automatic timestamp-based data updates
- ✅ Works on any static hosting (Vercel, Netlify, Cloudflare Pages)
- ✅ Free tier friendly

---

## 📋 Prerequisites

- ✅ **Supabase account** and project created
- ✅ **At least one pRPC endpoint** accessible from browser
- ✅ **Node.js 18+** installed locally

---

## 🚀 Step 1: Setup Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in project details
4. Wait for initialization (~2 minutes)

### 1.2 Run Database Schema

1. Go to SQL Editor in Supabase dashboard
2. Click "New query"
3. Copy contents from `supabase/schema.sql`
4. Click "Run" to execute
5. Verify tables created: `pnodes`, `pnode_history`, `network_stats`, `pnode_metrics`

### 1.3 Configure RLS for Browser Writes

The schema includes RLS policies for:
- ✅ Public **read** access (frontend can read with anon key)
- ❌ Public **write** access disabled by default

To allow browser writes, update RLS policies:

```sql
-- Allow public writes to pnodes (browser sync)
CREATE POLICY "Public write access for pnodes" ON pnodes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access for pnodes" ON pnodes
  FOR UPDATE
  USING (true);

-- Allow public writes to network_stats
CREATE POLICY "Public write access for network_stats" ON network_stats
  FOR INSERT
  WITH CHECK (true);
```

### 1.4 Get Supabase Credentials

Go to Project Settings → API:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUz... (public key)
```

---

## 📦 Step 2: Configure Frontend

### 2.1 Create `.env` File

```env
# Mock Data (for development)
VITE_USE_MOCK_DATA=false

# Network
VITE_NETWORK=devnet

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_ENABLE_HISTORICAL_DATA=true

# Sync Configuration (how often to fetch from pRPC)
# Default: 60000 (60 seconds / 1 minute)
VITE_SYNC_INTERVAL=60000

# Polling Configuration (how often UI refreshes from Supabase)
# Default: 30000 (30 seconds)
VITE_POLLING_INTERVAL=30000

# API Configuration
VITE_API_TIMEOUT=10000
```

### 2.2 Configure pRPC Endpoints

Edit `src/config/api.ts` to set your pRPC endpoints:

```typescript
export const API_CONFIG = {
  primaryEndpoint: 'http://173.212.203.145:6000/rpc',
  fallbackEndpoints: [
    'http://backup1.example.com:6000/rpc',
    'http://backup2.example.com:6000/rpc',
  ],
  // ... other config
};
```

Or use environment variables (if supported):

```env
VITE_PRIMARY_ENDPOINT=http://173.212.203.145:6000/rpc
VITE_FALLBACK_ENDPOINTS=http://backup1:6000/rpc,http://backup2:6000/rpc
```

---

## 🌐 Step 3: Deploy

### Option A: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel Dashboard → Project → Settings → Environment Variables:

```
VITE_USE_MOCK_DATA=false
VITE_NETWORK=devnet
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_ENABLE_HISTORICAL_DATA=true
VITE_SYNC_INTERVAL=60000
VITE_POLLING_INTERVAL=30000
```

### Option B: Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

Set environment variables in Netlify Dashboard → Site settings → Environment variables.

### Option C: Deploy to Cloudflare Pages

```bash
# Install Wrangler
npm i -g wrangler

# Deploy
npx wrangler pages deploy dist
```

Set environment variables in Cloudflare Dashboard → Pages → Settings → Environment variables.

---

## ⚙️ How It Works

### Automatic Sync

The app automatically syncs data using the `AutoSync` service:

1. **On app load**: Immediately fetches from pRPC and writes to Supabase
2. **Every 60 seconds** (configurable): Repeats the sync
3. **Failover**: Tries endpoints in order until one succeeds
4. **Timestamp-based**: All data updates include `last_seen` and `updated_at` timestamps

### Data Flow

```typescript
// In your app initialization (e.g., App.tsx)
import { AutoSync } from '@/services/sync';

const autoSync = new AutoSync(60000); // 60 seconds
autoSync.start();

// Cleanup on unmount
// autoSync.stop();
```

The sync service:
1. Fetches from pRPC: `get-version` + `get-pods`
2. Transforms data to database format
3. Upserts to Supabase `pnodes` table
4. Records network stats to `network_stats` table
5. All with timestamp tracking

---

## 🔧 Configuration

### Adjust Sync Frequency

Change `VITE_SYNC_INTERVAL`:

```env
# Every 30 seconds
VITE_SYNC_INTERVAL=30000

# Every 1 minute (default)
VITE_SYNC_INTERVAL=60000

# Every 5 minutes
VITE_SYNC_INTERVAL=300000
```

### Adjust UI Refresh Rate

Change `VITE_POLLING_INTERVAL`:

```env
# Every 15 seconds
VITE_POLLING_INTERVAL=15000

# Every 30 seconds (default)
VITE_POLLING_INTERVAL=30000
```

### Add CORS Support to pRPC

If you get CORS errors, configure your pRPC endpoints to allow browser requests:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## 🐛 Troubleshooting

### Issue: Mixed Content Error (HTTP/HTTPS)

**Symptoms**:
```
Mixed Content: The page at 'https://...' was loaded over HTTPS,
but requested an insecure resource 'http://...:6000/rpc'
```

**Cause**: Browsers block HTTP requests from HTTPS pages for security

**Solutions**:
1. **Use HTTPS pRPC endpoint**: Configure pRPC with TLS/SSL
2. **Local development**: Access app via `http://localhost:8080` (not HTTPS)
3. **Development proxy**: Use a local HTTPS proxy to the HTTP endpoint
4. **Production**: Always use HTTPS for both frontend and pRPC

**Note**: GitHub Codespaces and similar environments force HTTPS, which requires HTTPS pRPC endpoints.

### Issue: CORS Errors

**Symptoms**: Browser console shows CORS policy errors

**Solution**:
1. Configure pRPC server to allow CORS (see above)
2. Or use a CORS proxy during development
3. Or deploy pRPC with HTTPS and proper CORS headers

### Issue: "Permission denied" on Supabase writes

**Symptoms**: Console shows RLS policy errors

**Solution**:
Run the RLS policy update SQL from Step 1.3:

```sql
CREATE POLICY "Public write access for pnodes" ON pnodes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access for pnodes" ON pnodes
  FOR UPDATE
  USING (true);
```

### Issue: No data appears in dashboard

**Check**:
1. Browser console for errors
2. Network tab for failed requests
3. Supabase table editor - are rows being created?
4. pRPC endpoint is accessible from browser

**Debug**:
```javascript
// In browser console
import { triggerSync } from '@/services/sync';
await triggerSync();
```

---

## 📊 Monitoring

### Browser Console

Watch for sync logs:
```
[Sync] Starting sync with 3 endpoint(s)
[Sync] Fetching from http://...
[Sync] Fetched 42 nodes from http://...
[Sync] Successfully synced 42 nodes
```

### Supabase Dashboard

1. Go to Table Editor → `pnodes`
2. Check `updated_at` timestamps
3. Should update every 60 seconds

### Network Stats

Query network statistics:

```sql
SELECT * FROM network_stats
ORDER BY recorded_at DESC
LIMIT 10;
```

---

## 🔒 Security

### Environment Variables

- ✅ Never commit `.env` to Git
- ✅ ANON key is safe for browser (read + write with RLS)
- ✅ Use environment variables in hosting platform

### RLS Policies

- ✅ Enabled on all tables
- ✅ Public read access (dashboard data)
- ✅ Public write access (sync data)
- ⚠️ **Important**: For production, consider adding write restrictions based on rate limiting or authentication

### pRPC Endpoints

- ⚠️ Endpoints are exposed to browser (public)
- ✅ Use HTTPS in production
- ✅ Consider IP allowlisting on pRPC server
- ✅ Use VPN for internal endpoints

---

## 💰 Cost Estimation

### Supabase Free Tier
- ✅ 500 MB database
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users

**Usage at 60s sync interval**:
- Database: ~5-10 MB for typical pNode counts
- Bandwidth: Minimal (data writes from browser)
- No Edge Functions needed ✅

### Hosting (Vercel/Netlify/Cloudflare)
- ✅ Free tier: 100 GB bandwidth
- ✅ Static site only (no serverless functions)

**Total Cost**: $0/month (free tier) ✅

---

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] RLS policies updated for browser writes
- [ ] Environment variables configured
- [ ] pRPC endpoints accessible from browser
- [ ] CORS configured on pRPC (if needed)
- [ ] Frontend deployed
- [ ] Auto-sync running every 60 seconds
- [ ] Data appearing in Supabase tables
- [ ] Dashboard displaying live data with timestamps

---

## 📚 Resources

- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Architecture Overview**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **pRPC API Reference**: [PRPC_SETUP.md](PRPC_SETUP.md)

---

**Last Updated**: 2025-12-16
