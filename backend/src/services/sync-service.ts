import { PrpcClient } from './prpc-client.js';
import { getSupabase, TABLES } from '../config/supabase.js';
import { logger } from '../utils/logger.js';
import type { PNode, NetworkStats, DbPNodeRecord, DbNetworkStatsRecord, SyncStatus } from '../types/index.js';

export class SyncService {
  private prpcClient: PrpcClient;
  private status: SyncStatus = {
    lastSync: null,
    nextSync: null,
    nodesSynced: 0,
    errors: [],
    isRunning: false,
  };

  constructor(prpcClient?: PrpcClient) {
    this.prpcClient = prpcClient || new PrpcClient();
  }

  getStatus(): SyncStatus {
    return { ...this.status };
  }

  async syncNodes(): Promise<void> {
    if (this.status.isRunning) {
      logger.warn('Sync already in progress, skipping...');
      return;
    }

    this.status.isRunning = true;
    this.status.errors = [];
    const startTime = Date.now();

    try {
      logger.info('Starting pNode sync...');

      // Fetch nodes from pRPC
      const nodes = await this.prpcClient.getAllNodes();

      if (!nodes || nodes.length === 0) {
        logger.warn('No nodes fetched from pRPC');
        this.status.errors.push('No nodes fetched from pRPC');
        return;
      }

      logger.info(`Fetched ${nodes.length} nodes from pRPC`);

      // Upsert nodes to Supabase
      const upsertedCount = await this.upsertNodes(nodes);

      // Calculate and record network stats
      const stats = this.calculateNetworkStats(nodes);
      await this.recordNetworkStats(stats);

      this.status.lastSync = new Date();
      this.status.nodesSynced = upsertedCount;

      const duration = Date.now() - startTime;
      logger.info(`Sync completed successfully in ${duration}ms`, {
        nodesSynced: upsertedCount,
        totalNodes: nodes.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Sync failed', { error: errorMessage });
      this.status.errors.push(errorMessage);
      throw error;
    } finally {
      this.status.isRunning = false;
    }
  }

  private async upsertNodes(nodes: PNode[]): Promise<number> {
    const supabase = getSupabase();

    try {
      const records: DbPNodeRecord[] = nodes.map(node => ({
        node_id: node.nodeId || null,
        pubkey: node.pubkey,
        gossip: node.gossip,
        prpc: node.prpc,
        version: node.version,
        status: node.status,
        is_public: node.isPublic,
        region: node.region || null,
        last_seen: node.lastSeen,

        // Storage (in bytes)
        storage_committed: node.storageCommitted,
        storage_used: node.storageUsed,
        storage_usage_percent: node.storageUsagePercent || null,

        // Uptime (in seconds)
        uptime_seconds: node.uptimeSeconds,

        // Performance stats (optional)
        cpu_percent: node.cpuPercent || null,
        ram_used: node.ramUsed || null,
        ram_total: node.ramTotal || null,
        packets_received: node.packetsReceived || null,
        packets_sent: node.packetsSent || null,
        active_streams: node.activeStreams || null,

        // Metadata (optional)
        total_bytes: node.totalBytes || null,
        total_pages: node.totalPages || null,
        file_size: node.fileSize || null,
        metadata_last_updated: node.metadataLastUpdated || null,

        // Credits
        credits: node.credits || null,
      }));

      const { data, error } = await supabase
        .from(TABLES.PNODES)
        .upsert(records, { onConflict: 'pubkey' })
        .select();

      if (error) {
        logger.error('Failed to upsert nodes to Supabase', { error });
        throw new Error(`Supabase upsert failed: ${error.message}`);
      }

      logger.info(`Upserted ${data?.length || 0} nodes to Supabase`);
      return data?.length || 0;
    } catch (error) {
      logger.error('Error upserting nodes', { error });
      throw error;
    }
  }

  private calculateNetworkStats(nodes: PNode[]): NetworkStats {
    const totalNodes = nodes.length;
    const onlineNodes = nodes.filter(n => n.status === 'online').length;

    // Storage aggregates (in bytes)
    const totalStorageCommitted = nodes.reduce((sum, n) => sum + n.storageCommitted, 0);
    const totalStorageUsed = nodes.reduce((sum, n) => sum + n.storageUsed, 0);

    // Calculate average storage usage percentage
    const nodesWithUsage = nodes.filter(n => n.storageUsagePercent > 0);
    const avgStorageUsagePercent = nodesWithUsage.length > 0
      ? nodes.reduce((sum, n) => sum + n.storageUsagePercent, 0) / nodesWithUsage.length
      : 0;

    // Uptime aggregates (in seconds)
    const avgUptimeSeconds = nodes.reduce((sum, n) => sum + n.uptimeSeconds, 0) / totalNodes;

    // Performance aggregates (optional)
    const nodesWithCpu = nodes.filter(n => n.cpuPercent !== undefined && n.cpuPercent !== null);
    const avgCpuPercent = nodesWithCpu.length > 0
      ? nodesWithCpu.reduce((sum, n) => sum + (n.cpuPercent || 0), 0) / nodesWithCpu.length
      : undefined;

    const nodesWithRam = nodes.filter(n => n.ramUsed && n.ramTotal);
    const avgRamUsagePercent = nodesWithRam.length > 0
      ? nodesWithRam.reduce((sum, n) => sum + ((n.ramUsed || 0) / (n.ramTotal || 1)) * 100, 0) / nodesWithRam.length
      : undefined;

    const totalActiveStreams = nodes.reduce((sum, n) => sum + (n.activeStreams || 0), 0);

    const networkVersion = nodes[0]?.version || 'unknown';

    return {
      totalNodes,
      onlineNodes,
      totalStorageCommitted,
      totalStorageUsed,
      avgStorageUsagePercent: Number(avgStorageUsagePercent.toFixed(2)),
      avgUptimeSeconds: Number(avgUptimeSeconds.toFixed(0)),
      avgCpuPercent: avgCpuPercent !== undefined ? Number(avgCpuPercent.toFixed(2)) : undefined,
      avgRamUsagePercent: avgRamUsagePercent !== undefined ? Number(avgRamUsagePercent.toFixed(2)) : undefined,
      totalActiveStreams: totalActiveStreams > 0 ? totalActiveStreams : undefined,
      networkVersion,
    };
  }

  private async recordNetworkStats(stats: NetworkStats): Promise<void> {
    const supabase = getSupabase();

    try {
      const record: DbNetworkStatsRecord = {
        total_nodes: stats.totalNodes,
        online_nodes: stats.onlineNodes,
        total_storage_committed: stats.totalStorageCommitted,
        total_storage_used: stats.totalStorageUsed,
        avg_storage_usage_percent: stats.avgStorageUsagePercent,
        avg_uptime_seconds: stats.avgUptimeSeconds,
        avg_cpu_percent: stats.avgCpuPercent || null,
        avg_ram_usage_percent: stats.avgRamUsagePercent || null,
        total_active_streams: stats.totalActiveStreams || null,
        network_version: stats.networkVersion,
      };

      const { error } = await supabase
        .from(TABLES.NETWORK_STATS)
        .insert(record);

      if (error) {
        logger.error('Failed to record network stats', { error });
        throw new Error(`Failed to record stats: ${error.message}`);
      }

      logger.info('Recorded network stats to Supabase', { stats });
    } catch (error) {
      logger.error('Error recording network stats', { error });
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Check pRPC connectivity
      const prpcHealthy = await this.prpcClient.healthCheck();
      if (!prpcHealthy) {
        logger.error('pRPC health check failed');
        return false;
      }

      // Check Supabase connectivity
      const supabase = getSupabase();
      const { error } = await supabase.from(TABLES.PNODES).select('count').limit(1);
      if (error) {
        logger.error('Supabase health check failed', { error });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Health check failed', { error });
      return false;
    }
  }
}
