/**
 * Supabase Service Layer
 *
 * Handles all database operations for historical data and analytics
 */

import { supabase, TABLES, isSupabaseConfigured } from '@/config/supabase';

// Re-export isSupabaseConfigured for convenience
export { isSupabaseConfigured };
import type { PNode, NetworkStats } from '@/types/pnode';

export interface HistoricalDataPoint {
  recorded_at: string;
  value: number;
}

export interface NodeHistoryRecord {
  id: string;
  pubkey: string;
  status: string;
  uptime: number;
  storage_capacity: number;
  storage_used: number;
  credits: number;
  recorded_at: string;
}

/**
 * Upsert pNode data (insert or update)
 */
export async function upsertPNode(node: PNode) {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from(TABLES.PNODES)
      .upsert({
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
      }, {
        onConflict: 'pubkey'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting pNode:', error);
    return null;
  }
}

/**
 * Bulk upsert multiple pNodes
 */
export async function upsertPNodes(nodes: PNode[]) {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const records = nodes.map(node => ({
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

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error bulk upserting pNodes:', error);
    return null;
  }
}

/**
 * Record network statistics
 */
export async function recordNetworkStats(stats: NetworkStats) {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from(TABLES.NETWORK_STATS)
      .insert({
        total_nodes: stats.totalNodes,
        online_nodes: stats.onlineNodes,
        total_storage_committed: stats.totalStorageCommitted,
        total_storage_used: stats.totalStorageUsed,
        avg_storage_usage_percent: stats.avgStorageUsagePercent,
        avg_uptime_seconds: stats.avgUptimeSeconds,
        avg_cpu_percent: stats.avgCpuPercent || null,
        avg_ram_usage_percent: stats.avgRamUsagePercent || null,
        total_active_streams: stats.totalActiveStreams || null,
        total_credits: stats.totalCredits || null,
        network_version: stats.networkVersion,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error recording network stats:', error);
    return null;
  }
}

/**
 * Get pNode history for a specific node
 */
export async function getPNodeHistory(pubkey: string, hours: number = 24) {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const { data, error } = await supabase
      .from(TABLES.PNODE_HISTORY)
      .select('*')
      .eq('pubkey', pubkey)
      .gte('recorded_at', since.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) throw error;
    return data as NodeHistoryRecord[];
  } catch (error) {
    console.error('Error fetching pNode history:', error);
    return [];
  }
}

/**
 * Get network stats history
 */
export async function getNetworkStatsHistory(hours: number = 24) {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const { data, error } = await supabase
      .from(TABLES.NETWORK_STATS)
      .select('*')
      .gte('recorded_at', since.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching network stats history:', error);
    return [];
  }
}

/**
 * Get uptime history for a node
 */
export async function getUptimeHistory(pubkey: string, days: number = 7): Promise<HistoricalDataPoint[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error} = await supabase
      .from(TABLES.PNODE_HISTORY)
      .select('recorded_at, uptime')
      .eq('pubkey', pubkey)
      .gte('recorded_at', since.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(d => ({
      recorded_at: d.recorded_at,
      value: d.uptime
    }));
  } catch (error) {
    console.error('Error fetching uptime history:', error);
    return [];
  }
}

/**
 * Get storage utilization history for a node
 */
export async function getStorageHistory(pubkey: string, days: number = 7): Promise<HistoricalDataPoint[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from(TABLES.PNODE_HISTORY)
      .select('recorded_at, storage_used, storage_capacity')
      .eq('pubkey', pubkey)
      .gte('recorded_at', since.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(d => ({
      recorded_at: d.recorded_at,
      value: (d.storage_used / d.storage_capacity) * 100
    }));
  } catch (error) {
    console.error('Error fetching storage history:', error);
    return [];
  }
}

/**
 * Subscribe to real-time pNode updates
 */
export function subscribeToPNodeUpdates(callback: (payload: any) => void) {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  const channel = supabase
    .channel('pnode-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLES.PNODES,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to real-time network stats updates
 */
export function subscribeToNetworkStats(callback: (payload: any) => void) {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  const channel = supabase
    .channel('network-stats-updates')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: TABLES.NETWORK_STATS,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Get all pNodes from database
 */
export async function getAllPNodes(): Promise<PNode[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from(TABLES.PNODES)
      .select('*')
      .order('last_seen', { ascending: false });

    if (error) throw error;

    // Convert database format to PNode format
    return (data || []).map((node: any) => ({
      nodeId: node.node_id,
      pubkey: node.pubkey,
      gossip: node.gossip,
      prpc: node.prpc,
      version: node.version,
      status: node.status as 'online' | 'offline' | 'syncing',
      isPublic: node.is_public,
      region: node.region,
      lastSeen: node.last_seen,

      // Storage (in bytes)
      storageCommitted: node.storage_committed,
      storageUsed: node.storage_used,
      storageUsagePercent: node.storage_usage_percent,

      // Uptime (in seconds)
      uptimeSeconds: node.uptime_seconds,

      // Performance stats (optional)
      cpuPercent: node.cpu_percent,
      ramUsed: node.ram_used,
      ramTotal: node.ram_total,
      packetsReceived: node.packets_received,
      packetsSent: node.packets_sent,
      activeStreams: node.active_streams,

      // Metadata (optional)
      totalBytes: node.total_bytes,
      totalPages: node.total_pages,
      fileSize: node.file_size,
      metadataLastUpdated: node.metadata_last_updated,

      // Credits
      credits: node.credits,
    }));
  } catch (error) {
    console.error('Error fetching all pNodes:', error);
    return [];
  }
}

/**
 * Get network health timeline (aggregated hourly data)
 */
export async function getNetworkHealthTimeline(hours: number = 24) {
  if (!isSupabaseConfigured() || !supabase) return [];

  try {
    const since = new Date();
    since.setHours(since.getHours() - hours);

    const { data, error } = await supabase
      .rpc('get_network_health_timeline', {
        hours_back: hours
      });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching network health timeline:', error);
    return [];
  }
}
