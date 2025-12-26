/**
 * React hooks for WebSocket real-time updates
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wsClient, type WebSocketMessage } from '@/services/websocket';
import { queryKeys } from '@/hooks/useRpcQuery';
import type { PNode, NetworkStats } from '@/types/pnode';

/**
 * Hook to connect to WebSocket and handle reconnection
 */
export function useWebSocketConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    wsClient.connect()
      .then(() => setIsConnected(true))
      .catch((err) => {
        setError(err);
        setIsConnected(false);
      });

    return () => {
      wsClient.disconnect();
    };
  }, []);

  const reconnect = useCallback(() => {
    setError(null);
    wsClient.connect()
      .then(() => setIsConnected(true))
      .catch((err) => setError(err));
  }, []);

  return { isConnected, error, reconnect };
}

/**
 * Hook to receive real-time pNode updates
 */
export function useRealtimePNodes() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = wsClient.subscribe((message: WebSocketMessage) => {
      switch (message.type) {
        case 'nodes_update':
          // Update the cluster nodes cache
          queryClient.setQueryData(queryKeys.clusterNodes, message.data);
          break;

        case 'node_update': {
          // Update specific node in cache
          const node = message.data as PNode;
          queryClient.setQueryData(queryKeys.nodeInfo(node.pubkey), node);

          // Also update in cluster nodes list
          queryClient.setQueryData<PNode[]>(
            queryKeys.clusterNodes,
            (old) => {
              if (!old) return [node];
              const index = old.findIndex(n => n.pubkey === node.pubkey);
              if (index >= 0) {
                const newNodes = [...old];
                newNodes[index] = node;
                return newNodes;
              }
              return [...old, node];
            }
          );
          break;
        }

        case 'node_status_change': {
          // Update node status
          const { pubkey, status } = message.data as { pubkey: string; status: string };

          queryClient.setQueryData<PNode>(
            queryKeys.nodeInfo(pubkey),
            (old) => old ? { ...old, status: status as PNode['status'] } : undefined
          );

          queryClient.setQueryData<PNode[]>(
            queryKeys.clusterNodes,
            (old) => {
              if (!old) return old;
              return old.map(node =>
                node.pubkey === pubkey
                  ? { ...node, status: status as PNode['status'] }
                  : node
              );
            }
          );
          break;
        }

        case 'network_stats':
          // Update network stats
          queryClient.setQueryData(queryKeys.networkStats, message.data);
          break;

        case 'error':
          console.error('WebSocket error:', message.message);
          break;
      }
    });

    // Subscribe to network stats updates
    wsClient.subscribeToNetworkStats();

    return unsubscribe;
  }, [queryClient]);
}

/**
 * Hook to subscribe to specific node updates
 */
export function useRealtimeNode(pubkey: string | undefined) {
  useEffect(() => {
    if (!pubkey) return;

    wsClient.subscribeToNode(pubkey);

    return () => {
      wsClient.unsubscribeFromNode(pubkey);
    };
  }, [pubkey]);
}

/**
 * Hook for WebSocket status indicator
 */
export function useWebSocketStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  useEffect(() => {
    const checkStatus = () => {
      setStatus(wsClient.isConnected() ? 'connected' : 'disconnected');
    };

    // Check immediately
    checkStatus();

    // Check periodically
    const interval = setInterval(checkStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  return status;
}

/**
 * Hook to handle custom WebSocket messages
 */
export function useWebSocketMessage(
  handler: (message: WebSocketMessage) => void,
  dependencies: unknown[] = []
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const unsubscribe = wsClient.subscribe((message) => {
      handlerRef.current(message);
    });

    return unsubscribe;
  }, dependencies);
}
