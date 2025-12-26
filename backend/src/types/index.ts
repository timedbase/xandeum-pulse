// pNode Types - Comprehensive data model
export interface PNode {
  nodeId?: string; // ID from API (if different from pubkey)
  pubkey: string;
  gossip: string;
  prpc: string;
  version: string;

  // Status
  status: 'online' | 'offline' | 'syncing';
  isPublic: boolean;
  region?: string;
  lastSeen: string;

  // Storage (in bytes)
  storageCommitted: number;
  storageUsed: number;
  storageUsagePercent: number;

  // Uptime (in seconds)
  uptimeSeconds: number;

  // Performance stats (optional - from get-stats if available)
  cpuPercent?: number;
  ramUsed?: number;
  ramTotal?: number;
  packetsReceived?: number;
  packetsSent?: number;
  activeStreams?: number;

  // Metadata (optional - from get-stats)
  totalBytes?: number;
  totalPages?: number;
  fileSize?: number;
  metadataLastUpdated?: string;

  // Credits (from credits API)
  credits?: number;
}

export interface NetworkStats {
  totalNodes: number;
  onlineNodes: number;

  // Storage aggregates (in bytes)
  totalStorageCommitted: number;
  totalStorageUsed: number;
  avgStorageUsagePercent: number;

  // Performance aggregates
  avgUptimeSeconds: number;
  avgCpuPercent?: number;
  avgRamUsagePercent?: number;
  totalActiveStreams?: number;

  // Credits aggregate
  totalCredits?: number;

  networkVersion: string;
}

// pRPC API Response Types
export interface PrpcVersionResponse {
  version: string;
}

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

export interface PrpcPod {
  id?: string; // Node ID if provided
  address: string;
  version: string;
  last_seen?: string;
  last_seen_timestamp: number;
  pubkey: string;
  storage_used: number;
  storage_committed: number;
  uptime: number; // in seconds
  storage_usage_percent: number;
  rpc_port: number;
  is_public: boolean;

  // Optional stats fields (if enriched with get-stats data)
  cpu_percent?: number;
  ram_used?: number;
  ram_total?: number;
  packets_received?: number;
  packets_sent?: number;
  active_streams?: number;
  total_bytes?: number;
  total_pages?: number;
  file_size?: number;
  metadata_last_updated?: number;
}

export interface PrpcPodsResponse {
  pods: PrpcPod[];
  total_count: number;
}

// Credits API Response Types
export interface PodCredit {
  pod_id: string;
  credits: number;
}

export interface CreditsApiResponse {
  pods_credits: PodCredit[];
  status: string;
}

// Database Record Types
export interface DbPNodeRecord {
  node_id: string | null;
  pubkey: string;
  gossip: string;
  prpc: string;
  version: string;
  status: string;
  is_public: boolean;
  region: string | null;
  last_seen: string;

  // Storage fields (in bytes)
  storage_committed: number;
  storage_used: number;
  storage_usage_percent: number | null;

  // Uptime
  uptime_seconds: number;

  // Performance stats (optional)
  cpu_percent: number | null;
  ram_used: number | null;
  ram_total: number | null;
  packets_received: number | null;
  packets_sent: number | null;
  active_streams: number | null;

  // Metadata (optional)
  total_bytes: number | null;
  total_pages: number | null;
  file_size: number | null;
  metadata_last_updated: string | null;

  // Credits
  credits: number | null;
}

export interface DbNetworkStatsRecord {
  total_nodes: number;
  online_nodes: number;
  total_storage_committed: number;
  total_storage_used: number;
  avg_storage_usage_percent: number;
  avg_uptime_seconds: number;
  avg_cpu_percent: number | null;
  avg_ram_usage_percent: number | null;
  total_active_streams: number | null;
  total_credits: number | null;
  network_version: string;
}

// Sync Status
export interface SyncStatus {
  lastSync: Date | null;
  nextSync: Date | null;
  nodesSynced: number;
  errors: string[];
  isRunning: boolean;
}
