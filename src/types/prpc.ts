/**
 * pRPC API Type Definitions
 * Based on Xandeum pNode pRPC JSON-RPC 2.0 API
 */

/**
 * get-version response
 */
export interface PrpcVersionResponse {
  version: string;
}

/**
 * get-stats response
 */
export interface PrpcStatsResponse {
  metadata: {
    total_bytes: number;
    total_pages: number;
    last_updated: number;
  };
  stats: {
    cpu_percent: number;
    ram_used: number;
    ram_total: number;
    uptime: number;
    packets_received: number;
    packets_sent: number;
    active_streams: number;
  };
  file_size: number;
}

/**
 * get-pods response - returns peer pnodes
 */
export interface PrpcPodsResponse {
  pods: Array<{
    address: string;              // IP address and port (e.g., "192.168.1.100:9001")
    version: string;              // Software version
    last_seen: string;            // Human-readable timestamp
    last_seen_timestamp: number;  // Unix timestamp
  }>;
  total_count: number;
}
