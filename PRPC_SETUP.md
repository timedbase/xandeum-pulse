# pRPC Integration Guide

This guide explains how to connect Xandeum Pulse to your pNode network using the pRPC API.

## Quick Start

1. **Copy the environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your pNode IP address**:
   ```env
   VITE_PRPC_ENDPOINT=http://192.168.1.100:6000/rpc
   VITE_USE_MOCK_DATA=false
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Verify connection**: Check for the "Live" badge in the header

---

## pRPC API Overview

Xandeum Pulse uses the **JSON-RPC 2.0** protocol to communicate with pNodes.

### API Endpoint

```
http://<pnode-ip>:6000/rpc
```

### Available Methods

#### 1. `get-version`

Returns the pNode software version.

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "get-version",
  "params": []
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "version": "0.1.0"
  }
}
```

#### 2. `get-stats`

Returns comprehensive node statistics including CPU, RAM, storage, and uptime.

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "get-stats",
  "params": []
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "metadata": {
      "total_bytes": 1099511627776,
      "total_pages": 268435456,
      "last_updated": 1734278400
    },
    "stats": {
      "cpu_percent": 45.2,
      "ram_used": 8589934592,
      "ram_total": 17179869184,
      "uptime": 864000,
      "packets_received": 1234567,
      "packets_sent": 7654321,
      "active_streams": 42
    },
    "file_size": 536870912000
  }
}
```

#### 3. `get-pods`

Returns a list of peer pNodes discovered via the gossip network.

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "get-pods",
  "params": []
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "pods": [
      {
        "address": "192.168.1.101:9001",
        "version": "0.1.0",
        "last_seen": "2 minutes ago",
        "last_seen_timestamp": 1734278280
      },
      {
        "address": "192.168.1.102:9001",
        "version": "0.1.0",
        "last_seen": "1 minute ago",
        "last_seen_timestamp": 1734278340
      }
    ],
    "total_count": 2
  }
}
```

---

## Data Flow

Xandeum Pulse fetches data in this order:

1. **Supabase** (if configured) - Historical data and analytics
2. **pRPC API** (if Supabase unavailable) - Real-time data from pNode
3. **Mock Data** (if `VITE_USE_MOCK_DATA=true`) - Development testing

### How Data is Transformed

The pRPC API returns peer information, which Pulse transforms into the application's data model:

```typescript
// From pRPC get-pods response
{
  "address": "192.168.1.100:9001",
  "version": "0.1.0",
  "last_seen_timestamp": 1734278400
}

// Transformed to PNode model
{
  pubkey: "4a7e3c2b...",           // Generated from address hash
  gossip: "192.168.1.100:9001",   // From address
  prpc: "192.168.1.100:6000",     // pRPC endpoint
  version: "0.1.0",                // From response
  status: "online",                // Calculated from last_seen_timestamp
  uptime: 98.5,                    // Percentage
  storageCapacity: 1000,           // GB (from get-stats)
  storageUsed: 489,                // GB (from get-stats)
  credits: 45000000,               // Estimated
  region: "Local",                 // Derived from IP
  lastSeen: "2 minutes ago"        // From response
}
```

---

## Network Ports

- **Port 6000**: pRPC API server (HTTP JSON-RPC 2.0)
- **Port 80**: pNode statistics dashboard (localhost only)
- **Port 9001**: Gossip protocol for peer discovery
- **Port 5000**: Atlas server connection

---

## Configuration Options

### Environment Variables

```env
# Required - pRPC endpoint (must include /rpc path)
VITE_PRPC_ENDPOINT=http://192.168.1.100:6000/rpc

# Required - Disable mock data for production
VITE_USE_MOCK_DATA=false

# Optional - WebSocket endpoint
VITE_PRPC_WS_ENDPOINT=ws://192.168.1.100:6000

# Optional - Network identifier
VITE_NETWORK=devnet

# Optional - API timeout (milliseconds)
VITE_API_TIMEOUT=10000

# Optional - Polling interval (milliseconds)
VITE_POLLING_INTERVAL=30000
```

### Fallback Endpoints

Configure multiple pRPC endpoints for load balancing in `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  primaryEndpoint: 'http://192.168.1.100:6000/rpc',

  fallbackEndpoints: [
    'http://192.168.1.101:6000/rpc',
    'http://192.168.1.102:6000/rpc',
  ],

  // ... other config
}
```

---

## Troubleshooting

### Connection Failed

**Symptom**: "Connection Failed" error in dashboard

**Solutions**:
1. Verify pNode is running and accessible
2. Check the IP address and port are correct
3. Ensure `/rpc` path is included in endpoint
4. Verify firewall allows connections on port 6000
5. Test endpoint manually:
   ```bash
   curl -X POST http://192.168.1.100:6000/rpc \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"get-version","params":[]}'
   ```

### No Nodes Showing

**Symptom**: Dashboard shows "No pNodes found"

**Solutions**:
1. Verify `VITE_USE_MOCK_DATA=false` in `.env`
2. Check that `get-pods` returns peer nodes
3. Ensure gossip network is active (port 9001)
4. Verify pNode is connected to other peers

### CORS Issues

**Symptom**: Browser console shows CORS errors

**Solutions**:
1. Configure pNode to allow CORS from your domain
2. Use a proxy during development
3. Run Pulse on the same machine as pNode (localhost)

### Slow Loading

**Symptom**: Data takes long time to load

**Solutions**:
1. Reduce `VITE_POLLING_INTERVAL` for faster updates
2. Increase `VITE_API_TIMEOUT` if requests timeout
3. Check network latency to pNode
4. Consider setting up Supabase for faster data access

---

## Production Deployment

### Recommended Setup

```env
# Production pRPC endpoint
VITE_PRPC_ENDPOINT=http://prpc.xandeum.network:6000/rpc

# Disable mock data
VITE_USE_MOCK_DATA=false

# Supabase for historical data
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENABLE_HISTORICAL_DATA=true

# Production network
VITE_NETWORK=mainnet
```

### Security Considerations

1. **API Endpoint Security**:
   - Use HTTPS in production (`https://...`)
   - Implement rate limiting on pRPC endpoint
   - Use authenticated endpoints if available

2. **Environment Variables**:
   - Never commit `.env` to version control
   - Use build-time environment variables
   - Rotate Supabase keys regularly

3. **Network Access**:
   - Restrict pRPC port 6000 to trusted IPs
   - Use VPN for internal networks
   - Monitor API access logs

---

## Testing the Integration

### 1. Manual cURL Test

```bash
# Test get-version
curl -X POST http://192.168.1.100:6000/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"get-version","params":[]}'

# Test get-stats
curl -X POST http://192.168.1.100:6000/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"get-stats","params":[]}'

# Test get-pods
curl -X POST http://192.168.1.100:6000/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"get-pods","params":[]}'
```

### 2. Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "rpc"
4. Refresh the dashboard
5. Inspect JSON-RPC requests and responses

### 3. Health Check

The app includes a built-in health check that runs on load. Check the header badge:
- 🟢 **Live** - Connected successfully
- 🔴 **Offline** - Connection failed
- 🟡 **Mock** - Using mock data

---

## Next Steps

1. ✅ Connect to pRPC endpoint
2. ✅ Verify data is loading
3. 📊 Set up Supabase for historical data (optional)
4. 🚀 Deploy to production
5. 📱 Monitor network health

---

## Support

- **Documentation**: Check [README.md](README.md) for more info
- **Discord**: Join [discord.gg/uqRSmmM5m](https://discord.gg/uqRSmmM5m)
- **Issues**: Report bugs on GitHub

---

**Last Updated**: 2025-12-15
