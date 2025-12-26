import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },

  // pRPC Endpoints
  prpc: {
    endpoints: (process.env.PRPC_ENDPOINTS || '').split(',').filter(Boolean),
    timeout: parseInt(process.env.API_TIMEOUT_MS || '10000', 10),
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  },

  // Credits API
  credits: {
    apiUrl: process.env.CREDITS_API_URL || 'https://podcredits.xandeum.network/api/pods-credits',
  },

  // Sync
  sync: {
    intervalSeconds: parseInt(process.env.SYNC_INTERVAL_SECONDS || '60', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
} as const;

// Validate required configuration
export function validateConfig(): void {
  const errors: string[] = [];

  if (!config.supabase.url) {
    errors.push('SUPABASE_URL is required');
  }

  if (!config.supabase.serviceKey) {
    errors.push('SUPABASE_SERVICE_KEY is required');
  }

  if (config.prpc.endpoints.length === 0) {
    errors.push('PRPC_ENDPOINTS is required (comma-separated list)');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}
