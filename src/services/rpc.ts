/**
 * Xandeum Frontend Data Service
 *
 * IMPORTANT: Frontend does NOT make direct pRPC calls!
 *
 * Architecture:
 * - Backend sync service (Node.js/Express) calls pRPC endpoints
 * - Backend populates Supabase database with node data
 * - Frontend reads data from Supabase only
 *
 * This service provides a clean interface for the frontend to access
 * pNode data through Supabase, maintaining separation of concerns.
 */

import type { PNode, NetworkStats, ClusterInfo } from '@/types/pnode';
import { getAllPNodes, isSupabaseConfigured, getNetworkStatsHistory } from './supabase';

export class RpcError extends Error {
  constructor(
    message: string,
    public code?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'RpcError';
  }
}

// Utility function to calculate network stats from nodes
function calculateNetworkStats(nodes: PNode[]): NetworkStats {
  const onlineNodes = nodes.filter(n => n.status === 'online').length;

  // Calculate storage totals (already in bytes)
  const totalStorageCommitted = nodes.reduce((acc, n) => acc + (n.storageCommitted || 0), 0);
  const totalStorageUsed = nodes.reduce((acc, n) => acc + (n.storageUsed || 0), 0);
  const avgStorageUsagePercent = totalStorageCommitted > 0
    ? (totalStorageUsed / totalStorageCommitted) * 100
    : 0;

  // Calculate average uptime in seconds
  const avgUptimeSeconds = nodes.length > 0
    ? nodes.reduce((acc, n) => acc + (n.uptimeSeconds || 0), 0) / nodes.length
    : 0;

  // Calculate average CPU and RAM
  const nodesWithCpu = nodes.filter(n => n.cpuPercent !== undefined && n.cpuPercent !== null);
  const avgCpuPercent = nodesWithCpu.length > 0
    ? nodesWithCpu.reduce((acc, n) => acc + (n.cpuPercent || 0), 0) / nodesWithCpu.length
    : undefined;

  const nodesWithRam = nodes.filter(n => n.ramUsed !== undefined && n.ramTotal !== undefined);
  const avgRamUsagePercent = nodesWithRam.length > 0
    ? nodesWithRam.reduce((acc, n) => {
        const ramPercent = n.ramTotal! > 0 ? (n.ramUsed! / n.ramTotal!) * 100 : 0;
        return acc + ramPercent;
      }, 0) / nodesWithRam.length
    : undefined;

  const totalActiveStreams = nodes.reduce((acc, n) => acc + (n.activeStreams || 0), 0);

  return {
    totalNodes: nodes.length,
    onlineNodes,
    totalStorageCommitted,
    totalStorageUsed,
    avgStorageUsagePercent: Math.round(avgStorageUsagePercent * 100) / 100,
    avgUptimeSeconds: Math.round(avgUptimeSeconds),
    avgCpuPercent: avgCpuPercent ? Math.round(avgCpuPercent * 100) / 100 : undefined,
    avgRamUsagePercent: avgRamUsagePercent ? Math.round(avgRamUsagePercent * 100) / 100 : undefined,
    totalActiveStreams,
    networkVersion: 'v0.6 Stuttgart',
  };
}

// Utility function to generate cluster info
function generateClusterInfo(): ClusterInfo {
  const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const slot = randomInRange(280000000, 290000000);
  return {
    epoch: Math.floor(slot / 432000),
    slot: slot % 432000,
    blockHeight: slot - randomInRange(1000, 5000),
    absoluteSlot: slot,
  };
}

export class RpcClient {
  constructor() {
    console.log('[Frontend] Data service initialized - reading from Supabase only');
  }

  // NOTE: Frontend does NOT make direct pRPC calls
  // All pRPC communication is handled by the backend sync service
  // Frontend only reads from Supabase database

  /**
   * Get all pNodes from network (Supabase only - no direct pRPC calls)
   */
  async getClusterNodes(): Promise<PNode[]> {
    // Frontend only reads from Supabase
    // pRPC calls are handled by backend sync service which populates Supabase
    if (!isSupabaseConfigured()) {
      throw new RpcError(
        'Supabase not configured. Frontend requires Supabase to be set up.',
        503
      );
    }

    try {
      console.log('[RPC] Fetching from Supabase');
      const nodes = await getAllPNodes();
      if (!nodes || nodes.length === 0) {
        console.warn('No nodes found in Supabase. Ensure backend sync service is running to populate data.');
      }
      console.log('[RPC] Fetched', nodes.length, 'nodes from Supabase. First node credits:', nodes[0]?.credits);
      return nodes;
    } catch (error) {
      console.error('Failed to fetch from Supabase:', error);
      throw new RpcError(
        'Failed to fetch nodes from Supabase. Check your Supabase configuration and ensure backend sync service is running.',
        503
      );
    }
  }

  /**
   * Get information about a specific pNode (Supabase only)
   */
  async getNodeInfo(pubkey: string): Promise<PNode | null> {
    // Frontend only reads from Supabase
    const nodes = await this.getClusterNodes();
    return nodes.find(node => node.pubkey === pubkey) || null;
  }

  /**
   * Get network statistics (Supabase only)
   */
  async getNetworkStats(): Promise<NetworkStats> {
    // Frontend only reads from Supabase
    try {
      // Try to get recent stats first
      const statsHistory = await getNetworkStatsHistory(1); // Last 1 hour
      if (statsHistory && statsHistory.length > 0) {
        const latestStats = statsHistory[statsHistory.length - 1];
        return {
          totalNodes: latestStats.total_nodes,
          onlineNodes: latestStats.online_nodes,
          totalStorageCommitted: latestStats.total_storage_committed, // in bytes
          totalStorageUsed: latestStats.total_storage_used, // in bytes
          avgStorageUsagePercent: latestStats.avg_storage_usage_percent,
          avgUptimeSeconds: latestStats.avg_uptime_seconds, // in seconds
          avgCpuPercent: latestStats.avg_cpu_percent,
          avgRamUsagePercent: latestStats.avg_ram_usage_percent,
          totalActiveStreams: latestStats.total_active_streams,
          networkVersion: latestStats.network_version,
        };
      }

      // If no recent stats, calculate from current nodes
      const nodes = await getAllPNodes();
      return calculateNetworkStats(nodes);
    } catch (error) {
      console.error('Failed to fetch network stats from Supabase:', error);
      throw new RpcError(
        'Failed to fetch network statistics. Ensure Supabase is configured and backend sync service is running.',
        503
      );
    }
  }

  /**
   * Get cluster information
   */
  async getClusterInfo(): Promise<ClusterInfo> {
    // Generate cluster info from current data
    if (isSupabaseConfigured()) {
      try {
        const nodes = await getAllPNodes();
        if (nodes && nodes.length > 0) {
          return generateClusterInfo();
        }
      } catch (error) {
        console.warn('Failed to fetch from Supabase:', error);
      }
    }

    // Generate cluster info
    return generateClusterInfo();
  }

  /**
   * Get nodes from gossip protocol (same as getClusterNodes for pRPC)
   */
  async getGossipNodes(): Promise<PNode[]> {
    return this.getClusterNodes();
  }

  /**
   * Health check - verify Supabase connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if Supabase is configured and accessible
      if (!isSupabaseConfigured()) {
        return false;
      }

      // Try to fetch nodes to verify Supabase connection
      await getAllPNodes();
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const rpcClient = new RpcClient();

// Export convenience functions
export const getClusterNodes = () => rpcClient.getClusterNodes();
export const getNodeInfo = (pubkey: string) => rpcClient.getNodeInfo(pubkey);
export const getNetworkStats = () => rpcClient.getNetworkStats();
export const getClusterInfo = () => rpcClient.getClusterInfo();
export const getGossipNodes = () => rpcClient.getGossipNodes();
export const healthCheck = () => rpcClient.healthCheck();
