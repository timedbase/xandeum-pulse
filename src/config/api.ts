/**
 * API Configuration for Xandeum Pulse Frontend
 *
 * Frontend reads from Supabase only.
 * Backend sync service handles all pRPC communication.
 */

export const API_CONFIG = {
  // Polling interval for auto-refresh from Supabase (milliseconds)
  pollingInterval: 30000, // 30 seconds

  // Request timeout (milliseconds)
  timeout: 10000, // 10 seconds

  // Retry configuration
  maxRetries: 3,
  retryDelay: 1000, // 1 second

  // Network configuration
  network: import.meta.env.VITE_NETWORK || 'devnet',

  // API version
  apiVersion: 'v1',
} as const;
