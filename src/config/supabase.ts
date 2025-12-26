/**
 * Supabase Configuration
 *
 * Handles connection to Supabase for:
 * - Historical data storage
 * - Real-time subscriptions
 * - Analytics queries
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co');
};

// Create Supabase client only if credentials are configured
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // We don't need auth for analytics
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// Database table names
export const TABLES = {
  PNODES: 'pnodes',
  PNODE_HISTORY: 'pnode_history',
  NETWORK_STATS: 'network_stats',
  PNODE_METRICS: 'pnode_metrics',
} as const;
