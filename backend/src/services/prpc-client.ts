import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import type {
  PrpcVersionResponse,
  PrpcStatsResponse,
  PrpcPodsResponse,
  PNode,
  CreditsApiResponse,
} from '../types/index.js';

export class PrpcError extends Error {
  constructor(
    message: string,
    public code?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'PrpcError';
  }
}

export class PrpcClient {
  private endpoints: string[];
  private currentEndpointIndex: number = 0;
  private axiosInstance: AxiosInstance;

  constructor(endpoints?: string[]) {
    this.endpoints = endpoints || config.prpc.endpoints;

    if (this.endpoints.length === 0) {
      throw new Error('At least one pRPC endpoint is required');
    }

    this.axiosInstance = axios.create({
      timeout: config.prpc.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info(`Initialized pRPC client with ${this.endpoints.length} endpoint(s)`, {
      endpoints: this.endpoints,
    });
  }

  private getCurrentEndpoint(): string {
    return this.endpoints[this.currentEndpointIndex];
  }

  private switchToNextEndpoint(): boolean {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.endpoints.length;
    logger.info(`Switched to endpoint: ${this.getCurrentEndpoint()}`);
    return true;
  }

  private async call<T>(
    method: string,
    params: unknown[] = [],
    retryCount = 0,
    endpointAttempt = 0
  ): Promise<T> {
    const endpoint = this.getCurrentEndpoint();

    try {
      const response = await this.axiosInstance.post(endpoint, {
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      });

      const data = response.data;

      if (data.error) {
        throw new PrpcError(
          data.error.message || 'RPC Error',
          data.error.code,
          data.error.data
        );
      }

      return data.result as T;
    } catch (error) {
      // Try next endpoint if available
      if (this.endpoints.length > 1 && endpointAttempt < this.endpoints.length - 1) {
        logger.warn(`Endpoint ${endpoint} failed, trying next endpoint`, { error });
        this.switchToNextEndpoint();
        return this.call<T>(method, params, 0, endpointAttempt + 1);
      }

      // Retry on network errors
      if (retryCount < config.prpc.maxRetries && this.shouldRetry(error)) {
        const delay = 1000 * (retryCount + 1);
        logger.warn(`Retrying request after ${delay}ms (attempt ${retryCount + 1}/${config.prpc.maxRetries})`);
        await this.delay(delay);
        return this.call<T>(method, params, retryCount + 1, endpointAttempt);
      }

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new PrpcError('Request timeout', 408);
        }
        throw new PrpcError(error.message, error.response?.status);
      }

      if (error instanceof PrpcError) {
        throw error;
      }

      throw new PrpcError('Unknown error occurred');
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (error instanceof PrpcError) {
      if (error.code && error.code >= 400 && error.code < 500) {
        return false;
      }
    }
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getVersion(): Promise<string> {
    const response = await this.call<PrpcVersionResponse>('get-version');
    return response.version;
  }

  async getStats(): Promise<PrpcStatsResponse> {
    return this.call<PrpcStatsResponse>('get-stats');
  }

  async getPods(): Promise<PrpcPodsResponse> {
    return this.call<PrpcPodsResponse>('get-pods');
  }

  async getPodsWithStats(): Promise<PrpcPodsResponse> {
    return this.call<PrpcPodsResponse>('get-pods-with-stats');
  }

  async getCredits(): Promise<Map<string, number>> {
    try {
      logger.info('Fetching credits from credits API...');
      const response = await this.axiosInstance.get<CreditsApiResponse>(config.credits.apiUrl);

      if (response.data.status !== 'success') {
        logger.warn('Credits API returned non-success status', { status: response.data.status });
      }

      // Convert array to Map for fast lookups
      const creditsMap = new Map<string, number>();
      for (const podCredit of response.data.pods_credits) {
        creditsMap.set(podCredit.pod_id, podCredit.credits);
      }

      logger.info(`Fetched credits for ${creditsMap.size} pods`);
      return creditsMap;
    } catch (error) {
      logger.error('Failed to fetch credits', { error });
      // Return empty map on error - credits are optional
      return new Map();
    }
  }

  async getAllNodes(): Promise<PNode[]> {
    try {
      logger.info('Fetching nodes from pRPC using all 4 API methods + credits...');

      // Call all four API methods + credits API in parallel
      const [version, globalStats, podsResponse, podsWithStatsResponse, creditsMap] = await Promise.all([
        this.getVersion(),
        this.getStats(),
        this.getPods(),
        this.getPodsWithStats(),
        this.getCredits(),
      ]);

      logger.info(`Fetched data from all pRPC methods + credits`, {
        version,
        globalStatsAvailable: !!globalStats,
        podsCount: podsResponse.pods.length,
        podsWithStatsCount: podsWithStatsResponse.pods.length,
        creditsCount: creditsMap.size,
        endpoint: this.getCurrentEndpoint(),
      });

      // Log samples from all methods
      if (globalStats) {
        logger.debug('Global stats from get-stats:', globalStats);
      }
      if (podsResponse.pods.length > 0) {
        logger.debug('Sample pod from get-pods:', podsResponse.pods[0]);
      }
      if (podsWithStatsResponse.pods.length > 0) {
        logger.debug('Sample pod from get-pods-with-stats:', podsWithStatsResponse.pods[0]);
      }

      // Use get-pods-with-stats as primary source (has most complete data)
      const nodes = podsWithStatsResponse.pods.map(pod =>
        this.transformPodToNode(pod, version, globalStats, creditsMap)
      );

      // Deduplicate by pubkey (keep first occurrence)
      const uniqueNodes = new Map<string, PNode>();
      for (const node of nodes) {
        if (!uniqueNodes.has(node.pubkey)) {
          uniqueNodes.set(node.pubkey, node);
        } else {
          logger.warn('Duplicate pubkey detected, skipping', {
            pubkey: node.pubkey,
            address: node.gossip
          });
        }
      }

      const deduplicatedNodes = Array.from(uniqueNodes.values());

      if (deduplicatedNodes.length < nodes.length) {
        logger.warn(`Removed ${nodes.length - deduplicatedNodes.length} duplicate nodes`);
      }

      logger.info(`Processed ${deduplicatedNodes.length} unique nodes using all 4 API methods`);

      return deduplicatedNodes;
    } catch (error) {
      logger.error('Failed to fetch nodes from pRPC', { error });
      throw error;
    }
  }

  private transformPodToNode(
    pod: any,
    version: string,
    localStats: PrpcStatsResponse | null,
    creditsMap: Map<string, number>
  ): PNode {
    const [ip] = pod.address.split(':');
    const gossipPort = pod.address.split(':')[1] || '9001';

    // Use actual values from pRPC API
    const pubkey = pod.pubkey || this.generatePubkeyFromAddress(pod.address);

    // Convert timestamp to ISO string for lastSeen
    const lastSeen = pod.last_seen_timestamp
      ? new Date(pod.last_seen_timestamp * 1000).toISOString()
      : (pod.last_seen || new Date().toISOString());

    // Build comprehensive node data
    const node: PNode = {
      nodeId: pod.id,
      pubkey,
      gossip: `${ip}:${gossipPort}`,
      prpc: `${ip}:6000`,
      version: pod.version || version,
      status: this.getNodeStatus(pod.last_seen_timestamp || 0),
      isPublic: pod.is_public || false,
      region: this.getRegionFromIP(ip),
      lastSeen,

      // Storage (in bytes from API - keep as bytes)
      storageCommitted: pod.storage_committed || 0,
      storageUsed: pod.storage_used || 0,
      storageUsagePercent: pod.storage_usage_percent || 0,

      // Uptime (in seconds from API)
      uptimeSeconds: pod.uptime || 0,

      // Optional performance stats (if available from pod data)
      cpuPercent: pod.cpu_percent,
      ramUsed: pod.ram_used,
      ramTotal: pod.ram_total,
      packetsReceived: pod.packets_received,
      packetsSent: pod.packets_sent,
      activeStreams: pod.active_streams,

      // Optional metadata (if available)
      totalBytes: pod.total_bytes,
      totalPages: pod.total_pages,
      fileSize: pod.file_size,
      metadataLastUpdated: pod.metadata_last_updated
        ? new Date(pod.metadata_last_updated * 1000).toISOString()
        : undefined,

      // Credits (lookup by pod ID or pubkey)
      credits: creditsMap.get(pod.id || pubkey),
    };

    return node;
  }

  private hashAddress(address: string): number {
    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = ((hash << 5) - hash) + address.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private generatePubkeyFromAddress(address: string): string {
    const hash = this.hashAddress(address);
    const base = hash.toString(16).padStart(8, '0');
    return base.repeat(11).substring(0, 44);
  }

  private getNodeStatus(lastSeenTimestamp: number): 'online' | 'offline' | 'syncing' {
    const now = Date.now() / 1000;
    const diff = now - lastSeenTimestamp;

    // Online: seen within last 55 seconds
    if (diff < 55) return 'online';

    // Syncing: seen between 55 seconds and 30 minutes
    if (diff < 1800) return 'syncing'; // 30 minutes = 1800 seconds

    // Offline: not seen for more than 30 minutes
    return 'offline';
  }

  private getRegionFromIP(ip: string): string {
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return 'Local';
    }

    // Basic IP-based region detection
    const firstOctet = parseInt(ip.split('.')[0]);

    if (firstOctet >= 1 && firstOctet <= 126) return 'North America';
    if (firstOctet >= 128 && firstOctet <= 191) return 'Europe';
    if (firstOctet >= 192 && firstOctet <= 223) return 'Asia Pacific';

    return 'Unknown';
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getVersion();
      return true;
    } catch {
      return false;
    }
  }
}
