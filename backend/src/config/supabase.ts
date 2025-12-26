import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

export const TABLES = {
  PNODES: 'pnodes',
  PNODE_HISTORY: 'pnode_history',
  NETWORK_STATS: 'network_stats',
  PNODE_METRICS: 'pnode_metrics',
} as const;

let supabaseClient: SupabaseClient | null = null;

export function initSupabase(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!config.supabase.url || !config.supabase.serviceKey) {
    throw new Error('Supabase URL and Service Key are required');
  }

  logger.info('Initializing Supabase client', {
    url: config.supabase.url,
  });

  supabaseClient = createClient(
    config.supabase.url,
    config.supabase.serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return supabaseClient;
}

export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}
