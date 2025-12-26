/**
 * Sync Service
 * Fetches pNode data from pRPC and syncs to Supabase
 */

import { API_CONFIG } from '@/config/api';
import { supabase } from '@/config/supabase';
import type { PNode } from '@/types/pnode';

const PRPC_ENDPOINT = API_CONFIG.primaryEndpoint;

export interface SyncResponse {
  success: boolean;
  message?: string;
  nodes_synced?: number;
  timestamp?: string;
  error?: string;
}

/**
 * Make JSON-RPC 2.0 request
 */
async function rpcRequest(endpoint: string, method: string, params: any[] = []): Promise<any> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 1000000),
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`RPC Error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return data.result;
}

/**
 * Fetch pNodes from a single endpoint
 */
async function fetchFromEndpoint(endpoint: string): Promise<PNode[]> {
  console.log(`[Sync] Fetching from ${endpoint}`);

  const versionResult = await rpcRequest(endpoint, 'get-version');
  const version = versionResult['solana-core'] || 'unknown';

  const pods = await rpcRequest(endpoint, 'get-pods');

  const nodes: PNode[] = pods.map((pod: any) => ({
    pubkey: pod.pubkey,
    gossip: pod.gossip || '',
    prpc: pod.prpc || '',
    version: version,
    shredVersion: pod.shred_version || null,
    featureSet: pod.feature_set ? parseInt(pod.feature_set, 10) : null,
    status: (pod.status || 'online') as 'online' | 'offline' | 'syncing',
    uptime: parseFloat(pod.uptime || '0'),
    storageCapacity: parseInt(pod.storage?.capacity || '0', 10),
    storageUsed: parseInt(pod.storage?.used || '0', 10),
    credits: parseInt(pod.credits || '0', 10),
    region: pod.region || null,
    lastSeen: new Date().toISOString(),
  }));

  return nodes;
}

/**
 * Sync pNode data from pRPC to Supabase
 */
export async function triggerSync(): Promise<SyncResponse> {
  if (!supabase) {
    console.warn('[Sync] Supabase not configured, skipping sync');
    return {
      success: false,
      error: 'Supabase not configured',
    };
  }

  try {
    console.log(`[Sync] Starting sync from ${PRPC_ENDPOINT}`);

    // Fetch from pRPC endpoint
    const nodes = await fetchFromEndpoint(PRPC_ENDPOINT);

    if (nodes.length === 0) {
      throw new Error('No nodes returned from pRPC endpoint');
    }

    console.log(`[Sync] Fetched ${nodes.length} nodes from ${PRPC_ENDPOINT}`);

    // Transform to database format
    const dbNodes = nodes.map(node => ({
      pubkey: node.pubkey,
      gossip: node.gossip,
      prpc: node.prpc,
      version: node.version,
      shard_version: node.shredVersion,
      feature_set: node.featureSet,
      status: node.status,
      uptime: node.uptime,
      storage_capacity: node.storageCapacity,
      storage_used: node.storageUsed,
      credits: node.credits,
      region: node.region,
      last_seen: node.lastSeen,
    }));

    // Upsert to Supabase
    const { error: upsertError } = await supabase
      .from('pnodes')
      .upsert(dbNodes, { onConflict: 'pubkey' });

    if (upsertError) {
      throw new Error(`Supabase upsert failed: ${upsertError.message}`);
    }

    // Record network stats
    const onlineNodes = nodes.filter(n => n.status === 'online').length;
    const totalStorage = nodes.reduce((sum, n) => sum + Number(n.storageCapacity), 0);
    const usedStorage = nodes.reduce((sum, n) => sum + Number(n.storageUsed), 0);
    const totalCredits = nodes.reduce((sum, n) => sum + Number(n.credits), 0);
    const avgUptime = nodes.reduce((sum, n) => sum + n.uptime, 0) / nodes.length;

    const { error: statsError } = await supabase
      .from('network_stats')
      .insert({
        total_nodes: nodes.length,
        online_nodes: onlineNodes,
        total_storage: totalStorage,
        used_storage: usedStorage,
        total_credits: totalCredits,
        avg_uptime: avgUptime,
        network_version: nodes[0]?.version || null,
      });

    if (statsError) {
      console.error('[Sync] Failed to record network stats:', statsError);
    }

    console.log(`[Sync] Successfully synced ${nodes.length} nodes`);

    return {
      success: true,
      message: `Successfully synced from ${PRPC_ENDPOINT}`,
      nodes_synced: nodes.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Sync] Sync failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Auto-sync with interval (call from app initialization)
 */
export class AutoSync {
  private intervalId: NodeJS.Timeout | null = null;
  private interval: number;

  constructor(intervalMs: number = 60000) { // Default 60 seconds
    this.interval = intervalMs;
  }

  start() {
    if (this.intervalId) {
      console.warn('[AutoSync] Already running');
      return;
    }

    console.log(`[AutoSync] Starting auto-sync every ${this.interval / 1000}s`);

    // Trigger immediately
    triggerSync();

    // Then trigger at intervals
    this.intervalId = setInterval(() => {
      triggerSync();
    }, this.interval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[AutoSync] Stopped');
    }
  }

  updateInterval(intervalMs: number) {
    this.interval = intervalMs;
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }
}
