/**
 * React Query hooks for pRPC data fetching
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_CONFIG } from '@/config/api';
import {
  getClusterNodes,
  getNodeInfo,
  getNetworkStats,
  getClusterInfo,
  getGossipNodes,
  healthCheck,
} from '@/services/rpc';
import { fetchXandPrice } from '@/services/token-price';
import { useEffect } from 'react';

// Query keys
export const queryKeys = {
  clusterNodes: ['clusterNodes'] as const,
  gossipNodes: ['gossipNodes'] as const,
  nodeInfo: (pubkey: string) => ['nodeInfo', pubkey] as const,
  networkStats: ['networkStats'] as const,
  clusterInfo: ['clusterInfo'] as const,
  health: ['health'] as const,
  tokenPrice: ['tokenPrice'] as const,
};

/**
 * Hook to fetch all cluster nodes with auto-refresh
 */
export function useClusterNodes(enableAutoRefresh = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.clusterNodes,
    queryFn: getClusterNodes,
    staleTime: API_CONFIG.pollingInterval,
    refetchInterval: enableAutoRefresh ? API_CONFIG.pollingInterval : false,
    refetchOnWindowFocus: true,
  });

  // Auto-refresh on interval
  useEffect(() => {
    if (!enableAutoRefresh) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clusterNodes });
    }, API_CONFIG.pollingInterval);

    return () => clearInterval(interval);
  }, [enableAutoRefresh, queryClient]);

  return query;
}

/**
 * Hook to fetch nodes from gossip
 */
export function useGossipNodes(enableAutoRefresh = true) {
  return useQuery({
    queryKey: queryKeys.gossipNodes,
    queryFn: getGossipNodes,
    staleTime: API_CONFIG.pollingInterval,
    refetchInterval: enableAutoRefresh ? API_CONFIG.pollingInterval : false,
  });
}

/**
 * Hook to fetch specific node information
 */
export function useNodeInfo(pubkey: string | undefined) {
  return useQuery({
    queryKey: pubkey ? queryKeys.nodeInfo(pubkey) : ['nodeInfo'],
    queryFn: () => pubkey ? getNodeInfo(pubkey) : null,
    enabled: !!pubkey,
    staleTime: API_CONFIG.pollingInterval,
    refetchInterval: API_CONFIG.pollingInterval,
  });
}

/**
 * Hook to fetch network statistics
 */
export function useNetworkStats(enableAutoRefresh = true) {
  return useQuery({
    queryKey: queryKeys.networkStats,
    queryFn: getNetworkStats,
    staleTime: API_CONFIG.pollingInterval,
    refetchInterval: enableAutoRefresh ? API_CONFIG.pollingInterval : false,
  });
}

/**
 * Hook to fetch cluster information
 */
export function useClusterInfo(enableAutoRefresh = true) {
  return useQuery({
    queryKey: queryKeys.clusterInfo,
    queryFn: getClusterInfo,
    staleTime: API_CONFIG.pollingInterval,
    refetchInterval: enableAutoRefresh ? API_CONFIG.pollingInterval : false,
  });
}

/**
 * Hook to check RPC health
 */
export function useRpcHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: healthCheck,
    refetchInterval: 60000, // Check every minute
    retry: 1,
  });
}

/**
 * Hook to fetch XAND token price
 */
export function useTokenPrice(enableAutoRefresh = true) {
  return useQuery({
    queryKey: queryKeys.tokenPrice,
    queryFn: fetchXandPrice,
    staleTime: 60000, // 1 minute
    refetchInterval: enableAutoRefresh ? 60000 : false, // Refresh every minute
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook for manual data refresh
 */
export function useRefreshData() {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clusterNodes });
    queryClient.invalidateQueries({ queryKey: queryKeys.gossipNodes });
    queryClient.invalidateQueries({ queryKey: queryKeys.networkStats });
    queryClient.invalidateQueries({ queryKey: queryKeys.clusterInfo });
  };

  const refreshNodes = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clusterNodes });
  };

  const refreshNode = (pubkey: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.nodeInfo(pubkey) });
  };

  return {
    refreshAll,
    refreshNodes,
    refreshNode,
  };
}
