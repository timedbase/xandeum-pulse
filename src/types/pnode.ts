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

  networkVersion: string;
}

export interface ClusterInfo {
  epoch: number;
  slot: number;
  blockHeight: number;
  absoluteSlot: number;
}
