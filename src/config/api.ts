/**
 * API Configuration for Xandeum pNode RPC
 *
 * Configure your pRPC endpoints here. The system supports multiple endpoints
 * for load balancing and fallback.
 *
 * Endpoints can be:
 * - IP addresses: http://192.168.1.100:6000
 * - Domain names: http://prpc.xandeum.com
 * - Localhost: http://localhost:6000
 */

// Parse fallback endpoints from environment variable (comma-separated)
const parseFallbackEndpoints = (): string[] => {
  const endpoints = import.meta.env.VITE_PRPC_FALLBACK_ENDPOINTS;
  if (!endpoints || typeof endpoints !== 'string') {
    return [];
  }
  return endpoints
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0);
};

export const API_CONFIG = {
  // Primary pRPC endpoint (supports IP addresses)
  // All endpoints must include the /rpc path
  primaryEndpoint: import.meta.env.VITE_PRPC_ENDPOINT || 'http://localhost:6000/rpc',

  // Fallback endpoints for redundancy (loaded from VITE_PRPC_FALLBACK_ENDPOINTS)
  // Supports comma-separated list: "http://ip1:6000/rpc,http://ip2:6000/rpc"
  fallbackEndpoints: parseFallbackEndpoints(),

  // WebSocket endpoint for real-time updates (supports IP addresses)
  wsEndpoint: import.meta.env.VITE_PRPC_WS_ENDPOINT || 'ws://localhost:6000',

  // Polling interval for auto-refresh (milliseconds)
  pollingInterval: 30000, // 30 seconds

  // Request timeout (milliseconds)
  timeout: 10000, // 10 seconds

  // Retry configuration
  maxRetries: 3,
  retryDelay: 1000, // 1 second

  // Enable mock data mode (disable when real API is available)
  useMockData: import.meta.env.VITE_USE_MOCK_DATA !== 'false',

  // Network configuration
  network: import.meta.env.VITE_NETWORK || 'devnet',

  // API version
  apiVersion: 'v1',
} as const;

/**
 * pRPC API Methods (JSON-RPC 2.0)
 * All requests are sent to: http://<pnode-ip>:6000/rpc
 */
export const RPC_METHODS = {
  // Core pRPC API methods
  GET_VERSION: 'get-version',    // Returns pnode software version
  GET_STATS: 'get-stats',        // Returns comprehensive node statistics
  GET_PODS: 'get-pods',          // Returns list of peer pnodes in network
} as const;

export type RpcMethod = typeof RPC_METHODS[keyof typeof RPC_METHODS];
