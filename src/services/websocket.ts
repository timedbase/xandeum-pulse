/**
 * WebSocket service for real-time pNode updates
 */

import { API_CONFIG } from '@/config/api';
import type { PNode, NetworkStats } from '@/types/pnode';

export type WebSocketMessage =
  | { type: 'node_update'; data: PNode }
  | { type: 'node_status_change'; data: { pubkey: string; status: string } }
  | { type: 'network_stats'; data: NetworkStats }
  | { type: 'nodes_update'; data: PNode[] }
  | { type: 'error'; message: string };

export type WebSocketEventHandler = (message: WebSocketMessage) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private handlers: Set<WebSocketEventHandler> = new Set();
  private isConnecting = false;
  private shouldReconnect = true;

  constructor(private url: string = API_CONFIG.wsEndpoint) {}

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            this.handlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnecting = false;
          this.ws = null;

          if (this.shouldReconnect) {
            this.handleReconnect();
          }
        };

        // Timeout if connection takes too long
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.notifyHandlers({
        type: 'error',
        message: 'Failed to reconnect to WebSocket server',
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to WebSocket messages
   */
  subscribe(handler: WebSocketEventHandler): () => void {
    this.handlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.delete(handler);
    };
  }

  /**
   * Send a message to the server
   */
  send(message: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Notify all handlers
   */
  private notifyHandlers(message: WebSocketMessage) {
    this.handlers.forEach(handler => handler(message));
  }

  /**
   * Subscribe to specific node updates
   */
  subscribeToNode(pubkey: string) {
    this.send({
      type: 'subscribe',
      channel: 'node',
      pubkey,
    });
  }

  /**
   * Unsubscribe from node updates
   */
  unsubscribeFromNode(pubkey: string) {
    this.send({
      type: 'unsubscribe',
      channel: 'node',
      pubkey,
    });
  }

  /**
   * Subscribe to network stats updates
   */
  subscribeToNetworkStats() {
    this.send({
      type: 'subscribe',
      channel: 'network_stats',
    });
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();

// Auto-connect if enabled
if (import.meta.env.VITE_ENABLE_WEBSOCKET === 'true' && !API_CONFIG.useMockData) {
  wsClient.connect().catch(error => {
    console.error('Failed to connect to WebSocket:', error);
  });
}
