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

import { API_CONFIG } from '@/config/api';
import type { PNode, NetworkStats, ClusterInfo } from '@/types/pnode';
import { generateMockPNodes, calculateNetworkStats, generateClusterInfo } from '@/lib/mock-data';
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

export class RpcClient {
  constructor() {
    console.log('[Frontend] Data service initialized - reading from Supabase only');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // NOTE: Frontend does NOT make direct pRPC calls
  // All pRPC communication is handled by the backend sync service
  // Frontend only reads from Supabase database

  /**
   * Get all pNodes from network (Supabase only - no direct pRPC calls)
   */
  async getClusterNodes(): Promise<PNode[]> {
    if (API_CONFIG.useMockData) {
      console.log('[RPC] Using MOCK data (VITE_USE_MOCK_DATA=true)');
      await this.delay(500);
      const mockNodes = generateMockPNodes(42);
      console.log('[RPC] Generated', mockNodes.length, 'mock nodes. First node credits:', mockNodes[0]?.credits);
      return mockNodes;
    }

    // Frontend only reads from Supabase
    // pRPC calls are handled by Vercel Functions which populate Supabase
    if (!isSupabaseConfigured()) {
      throw new RpcError(
        'Supabase not configured. Frontend requires Supabase to be set up. pRPC data is fetched by Vercel Functions.',
        503
      );
    }

    try {
      console.log('[RPC] Fetching from Supabase (VITE_USE_MOCK_DATA=false)');
      const nodes = await getAllPNodes();
      if (!nodes || nodes.length === 0) {
        console.warn('No nodes found in Supabase. Ensure Vercel Functions are running to populate data.');
      }
      console.log('[RPC] Fetched', nodes.length, 'nodes from Supabase. First node credits:', nodes[0]?.credits);
      return nodes;
    } catch (error) {
      console.error('Failed to fetch from Supabase:', error);
      throw new RpcError(
        'Failed to fetch nodes from Supabase. Check your Supabase configuration and ensure Vercel Functions are populating data.',
        503
      );
    }
  }

  /**
   * Get information about a specific pNode (Supabase only)
   */
  async getNodeInfo(pubkey: string): Promise<PNode | null> {
    if (API_CONFIG.useMockData) {
      await this.delay(300);
      const nodes = generateMockPNodes(42);
      return nodes.find(node => node.pubkey === pubkey) || null;
    }

    // Frontend only reads from Supabase
    const nodes = await this.getClusterNodes();
    return nodes.find(node => node.pubkey === pubkey) || null;
  }

  /**
   * Get network statistics (Supabase only)
   */
  async getNetworkStats(): Promise<NetworkStats> {
    if (API_CONFIG.useMockData) {
      await this.delay(200);
      const nodes = generateMockPNodes(42);
      return calculateNetworkStats(nodes);
    }

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
    if (API_CONFIG.useMockData) {
      await this.delay(200);
      return generateClusterInfo();
    }

    // Try Supabase first - generate cluster info from nodes
    if (isSupabaseConfigured()) {
      try {
        const nodes = await getAllPNodes();
        if (nodes && nodes.length > 0) {
          return generateClusterInfo();
        }
      } catch (error) {
        console.warn('Failed to fetch from Supabase, falling back to direct pRPC:', error);
      }
    }

    // Generate cluster info (pRPC doesn't provide this directly)
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
      if (API_CONFIG.useMockData) {
        return true;
      }

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
