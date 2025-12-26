import { Server } from './server.js';
import { validateConfig } from './config/env.js';
import { initSupabase } from './config/supabase.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    logger.info('Starting Xandeum Pulse Backend...');

    // Validate configuration
    logger.info('Validating configuration...');
    validateConfig();

    // Initialize Supabase
    logger.info('Initializing Supabase...');
    initSupabase();

    // Create and start server
    const server = new Server();
    server.start();

    // Graceful shutdown
    const shutdown = () => {
      logger.info('Shutting down gracefully...');
      server.stop();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

main();
