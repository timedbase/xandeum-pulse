# Multiple pRPC Endpoints Guide

This guide explains how to configure and use multiple pRPC endpoints for load balancing and automatic failover in Xandeum Pulse.

---

## 🎯 Overview

Xandeum Pulse supports multiple pRPC endpoints to provide:
- **High Availability**: Automatic failover if primary endpoint goes down
- **Load Distribution**: Spread requests across multiple pNodes
- **Reduced Latency**: Connect to the nearest/fastest endpoint
- **Resilience**: Network continues working even if some nodes fail

---

## ⚙️ Configuration

### Option 1: Environment Variables (Recommended)

Edit your `.env` file:

```env
# Primary endpoint
VITE_PRPC_ENDPOINT=http://173.212.203.145:6000/rpc

# Fallback endpoints (comma-separated)
VITE_PRPC_FALLBACK_ENDPOINTS=http://192.168.1.101:6000/rpc,http://192.168.1.102:6000/rpc,http://api.xandeum.io:6000/rpc

# Disable mock data to use real endpoints
VITE_USE_MOCK_DATA=false
```

**Important**:
- All endpoints must include the `/rpc` path
- Separate multiple endpoints with commas (no spaces)
- The system will try endpoints in order: primary → fallback 1 → fallback 2 → etc.

### Option 2: Code Configuration

Edit `src/config/api.ts` directly:

```typescript
export const API_CONFIG = {
  primaryEndpoint: 'http://173.212.203.145:6000/rpc',

  fallbackEndpoints: [
    'http://192.168.1.101:6000/rpc',
    'http://192.168.1.102:6000/rpc',
    'http://api.xandeum.io:6000/rpc',
  ],

  // ... other config
}
```

---

## 🔄 How Failover Works

### Automatic Endpoint Switching

When a request fails, the system automatically:

1. **Tries Primary Endpoint**: Makes request to `VITE_PRPC_ENDPOINT`
2. **Detects Failure**: If timeout, connection error, or HTTP error occurs
3. **Switches to Fallback**: Immediately tries the next endpoint
4. **Cycles Through All**: Tests each endpoint until one succeeds
5. **Retries on Success**: Once a working endpoint is found, retries are done on that endpoint

### Failover Sequence Example

```
Request → Primary (http://173.212.203.145:6000/rpc)
   ↓ FAILED (timeout)
Switch to Fallback 1 (http://192.168.1.101:6000/rpc)
   ↓ FAILED (connection refused)
Switch to Fallback 2 (http://192.168.1.102:6000/rpc)
   ↓ SUCCESS ✅
Continue using Fallback 2 for subsequent requests
```

### Console Logging

Monitor endpoint switching in browser DevTools console:

```
[RPC] Initialized with 3 endpoint(s): [...]
[RPC] Endpoint http://173.212.203.145:6000/rpc failed, trying next endpoint...
[RPC] Switched to endpoint: http://192.168.1.101:6000/rpc
```

---

## 📊 Load Distribution Strategies

### Strategy 1: Geographic Distribution

Optimize for latency by placing endpoints in different regions:

```env
VITE_PRPC_ENDPOINT=http://us-east.xandeum.io:6000/rpc
VITE_PRPC_FALLBACK_ENDPOINTS=http://eu-west.xandeum.io:6000/rpc,http://asia-pacific.xandeum.io:6000/rpc
```

### Strategy 2: Network Segmentation

Use different network zones for resilience:

```env
VITE_PRPC_ENDPOINT=http://10.0.1.100:6000/rpc        # Internal network
VITE_PRPC_FALLBACK_ENDPOINTS=http://192.168.1.100:6000/rpc,http://public.xandeum.io:6000/rpc  # DMZ and public
```

### Strategy 3: Node Diversity

Connect to different pNode operators:

```env
VITE_PRPC_ENDPOINT=http://node1.operator-a.com:6000/rpc
VITE_PRPC_FALLBACK_ENDPOINTS=http://node2.operator-b.com:6000/rpc,http://node3.operator-c.com:6000/rpc
```

---

## 🔧 Advanced Configuration

### Retry Settings

Configure retry behavior in `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  // ... endpoints

  timeout: 10000,        // 10 seconds per request
  maxRetries: 3,         // Retry 3 times per endpoint
  retryDelay: 1000,      // 1 second between retries
}
```

### Polling Interval

Adjust how often the app fetches data:

```env
VITE_POLLING_INTERVAL=30000  # 30 seconds (default)
VITE_POLLING_INTERVAL=10000  # 10 seconds (more frequent updates)
VITE_POLLING_INTERVAL=60000  # 60 seconds (reduced server load)
```

---

## 🧪 Testing Multiple Endpoints

### 1. Test Each Endpoint Individually

```bash
# Test primary
curl -X POST http://173.212.203.145:6000/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"get-version","params":[]}'

# Test fallback 1
curl -X POST http://192.168.1.101:6000/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"get-version","params":[]}'

# Test fallback 2
curl -X POST http://192.168.1.102:6000/rpc \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"get-version","params":[]}'
```

### 2. Simulate Failover

1. Configure 3 endpoints in `.env`
2. Start the app: `npm run dev`
3. Open browser DevTools → Console
4. Observe: `[RPC] Initialized with 3 endpoint(s)`
5. Stop one pNode to trigger failover
6. Watch logs: `[RPC] Switched to endpoint: ...`

### 3. Monitor Endpoint Health

Add this to your browser console while the app is running:

```javascript
// Get current endpoint
console.log(rpcClient.getCurrentEndpoint());

// Get all configured endpoints
console.log(rpcClient.getAllEndpoints());
```

---

## 📈 Performance Considerations

### Network Latency

With multiple endpoints, initial failures add latency:
- **1 endpoint**: Direct connection (fastest when working)
- **3 endpoints**: Up to 2 failovers (slower on initial failure, faster recovery)

**Recommendation**: Use 2-3 endpoints for balance between resilience and performance.

### Request Distribution

Currently, the system uses **sequential failover**, not round-robin:
- Requests always start with primary endpoint
- Only switches on failure
- Stays on working endpoint until it fails

**Future Enhancement**: Implement round-robin or weighted load balancing.

---

## 🔐 Security Best Practices

### 1. HTTPS in Production

Always use HTTPS for public endpoints:

```env
VITE_PRPC_ENDPOINT=https://prpc.xandeum.io/rpc
VITE_PRPC_FALLBACK_ENDPOINTS=https://backup.xandeum.io/rpc
```

### 2. Trusted Endpoints Only

Only configure endpoints you control or trust:
- ✅ Your own pNodes
- ✅ Known operators with good reputation
- ❌ Random public endpoints

### 3. IP Whitelisting

Configure pNodes to accept connections only from your dashboard IP:

```bash
# On pNode server
iptables -A INPUT -p tcp --dport 6000 -s YOUR_DASHBOARD_IP -j ACCEPT
iptables -A INPUT -p tcp --dport 6000 -j DROP
```

### 4. Monitor Endpoint Changes

Log endpoint switches to detect:
- Frequent failovers (unstable network)
- Unexpected endpoint usage (security issue)
- Performance degradation

---

## 🚨 Troubleshooting

### Issue: All Endpoints Failing

**Symptoms**: Dashboard shows "Connection Failed" even with multiple endpoints

**Solutions**:
1. Verify all endpoints are reachable:
   ```bash
   curl -v http://YOUR_ENDPOINT:6000/rpc
   ```
2. Check firewall rules on pNode servers
3. Verify `/rpc` path is included in all endpoints
4. Check browser console for specific errors
5. Try increasing timeout in `src/config/api.ts`

### Issue: Slow Failover

**Symptoms**: Long delay before switching to working endpoint

**Solutions**:
1. Reduce timeout: `timeout: 5000` (5 seconds)
2. Reduce retries: `maxRetries: 1`
3. Remove slow/dead endpoints from list

### Issue: Endpoints Not Loading from .env

**Symptoms**: Only primary endpoint works, fallbacks ignored

**Solutions**:
1. Restart development server after editing `.env`
2. Verify comma separation (no spaces): `endpoint1,endpoint2`
3. Check for syntax errors in `.env`
4. Clear browser cache and reload

### Issue: Stuck on Failed Endpoint

**Symptoms**: Keeps trying failed endpoint instead of switching

**Solutions**:
1. This shouldn't happen with current implementation
2. Check browser console for error messages
3. Verify `allEndpoints` array in console: `rpcClient.getAllEndpoints()`
4. Report as bug if issue persists

---

## 📝 Example Configurations

### Development Setup (Local Network)

```env
VITE_PRPC_ENDPOINT=http://192.168.1.100:6000/rpc
VITE_PRPC_FALLBACK_ENDPOINTS=http://192.168.1.101:6000/rpc
VITE_USE_MOCK_DATA=false
```

### Staging Setup (Mixed Network)

```env
VITE_PRPC_ENDPOINT=http://staging.xandeum.io:6000/rpc
VITE_PRPC_FALLBACK_ENDPOINTS=http://10.0.1.50:6000/rpc,http://backup-staging.xandeum.io:6000/rpc
VITE_USE_MOCK_DATA=false
```

### Production Setup (Public Endpoints)

```env
VITE_PRPC_ENDPOINT=https://prpc.xandeum.io/rpc
VITE_PRPC_FALLBACK_ENDPOINTS=https://prpc-backup.xandeum.io/rpc,https://prpc-asia.xandeum.io/rpc
VITE_USE_MOCK_DATA=false
VITE_NETWORK=mainnet
```

### High Availability Setup (5 Endpoints)

```env
VITE_PRPC_ENDPOINT=https://prpc-primary.xandeum.io/rpc
VITE_PRPC_FALLBACK_ENDPOINTS=https://prpc-us-east.xandeum.io/rpc,https://prpc-us-west.xandeum.io/rpc,https://prpc-eu.xandeum.io/rpc,https://prpc-asia.xandeum.io/rpc
VITE_USE_MOCK_DATA=false
```

---

## 🎓 Best Practices Summary

1. **Use 2-4 endpoints** for optimal balance
2. **Test each endpoint** before adding to config
3. **Monitor failover logs** in production
4. **Use HTTPS** for public endpoints
5. **Geographic distribution** for global users
6. **Keep endpoints updated** (remove dead nodes)
7. **Document your setup** for team members
8. **Have a backup plan** if all endpoints fail

---

## 📚 Related Documentation

- **[PRPC_SETUP.md](PRPC_SETUP.md)** - Basic pRPC setup guide
- **[README.md](README.md)** - General documentation
- **[CHANGES.md](CHANGES.md)** - Recent changes and updates

---

## 🆘 Support

If you encounter issues with multiple endpoints:

1. Check browser DevTools console for error logs
2. Test each endpoint individually with cURL
3. Review this guide's troubleshooting section
4. Join Discord: [discord.gg/uqRSmmM5m](https://discord.gg/uqRSmmM5m)
5. Open GitHub issue with:
   - Your `.env` configuration (redact IPs if sensitive)
   - Browser console logs
   - Network tab screenshots

---

**Last Updated**: 2025-12-15
