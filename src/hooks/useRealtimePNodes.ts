/**
 * React hook for real-time pNode updates via Supabase Realtime (WebSocket)
 *
 * This hook provides instant updates when the backend syncs new data to the database,
 * eliminating the need for polling and reducing latency.
 *
 * Includes debouncing to prevent excessive re-renders when updates come too fast.
 */

import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToPNodeUpdates, getAllPNodes, isSupabaseConfigured } from '@/services/supabase';
import { queryKeys } from './useRpcQuery';
import type { PNode } from '@/types/pnode';

export function useRealtimePNodes() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured - realtime updates disabled');
      return;
    }

    console.log('Setting up Supabase Realtime subscription...');

    // Subscribe to realtime updates with debouncing
    const unsubscribe = subscribeToPNodeUpdates((payload) => {
      console.log('Realtime update received:', payload.eventType);
      setIsConnected(true);

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce invalidation to prevent excessive re-renders
      // Wait 1 second after last update before invalidating
      debounceTimerRef.current = setTimeout(() => {
        setLastUpdate(new Date());
        queryClient.invalidateQueries({ queryKey: queryKeys.clusterNodes });
        queryClient.invalidateQueries({ queryKey: queryKeys.networkStats });
      }, 1000);
    });

    // Mark as connected
    setIsConnected(true);

    // Fetch initial data
    getAllPNodes().then((nodes) => {
      if (nodes.length > 0) {
        queryClient.setQueryData(queryKeys.clusterNodes, nodes);
        setLastUpdate(new Date());
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up Supabase Realtime subscription');
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      unsubscribe();
      setIsConnected(false);
    };
  }, [queryClient]);

  return {
    isConnected,
    lastUpdate,
  };
}

/**
 * Hook that combines initial fetch with realtime updates (with debouncing)
 */
export function usePNodesWithRealtime() {
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected, lastUpdate } = useRealtimePNodes();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial fetch
    getAllPNodes().then((data) => {
      setNodes(data);
      setIsLoading(false);
    });

    // Subscribe to realtime updates with debouncing
    const unsubscribe = subscribeToPNodeUpdates(async (payload) => {
      console.log('Realtime pNode update:', payload.eventType);

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce refetch to prevent excessive updates
      // Wait 1 second after last update before refetching
      debounceTimerRef.current = setTimeout(async () => {
        const updatedNodes = await getAllPNodes();
        setNodes(updatedNodes);
      }, 1000);
    });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      unsubscribe();
    };
  }, []);

  return {
    nodes,
    isLoading,
    isConnected,
    lastUpdate,
  };
}
