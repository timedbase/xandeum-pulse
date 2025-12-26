import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { Scheduler } from './services/scheduler.js';
import { SyncService } from './services/sync-service.js';

export class Server {
  private app: express.Application;
  private scheduler: Scheduler;
  private syncService: SyncService;

  constructor() {
    this.app = express();
    this.syncService = new SyncService();
    this.scheduler = new Scheduler(this.syncService);

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // CORS
    this.app.use(cors({
      origin: '*', // Configure this based on your frontend URL
      credentials: true,
    }));

    // JSON parser
    this.app.use(express.json());

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        query: req.query,
        ip: req.ip,
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        const healthy = await this.syncService.healthCheck();
        const status = this.scheduler.getStatus();

        res.status(healthy ? 200 : 503).json({
          status: healthy ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          sync: status,
        });
      } catch (error) {
        logger.error('Health check failed', { error });
        res.status(503).json({
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    // Sync status
    this.app.get('/sync/status', (req: Request, res: Response) => {
      const status = this.scheduler.getStatus();
      res.json(status);
    });

    // Trigger manual sync
    this.app.post('/sync/trigger', async (req: Request, res: Response) => {
      try {
        // Don't await - trigger and return immediately
        this.scheduler.triggerSync().catch(error => {
          logger.error('Manual sync failed', { error });
        });

        res.json({
          message: 'Sync triggered',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to trigger sync', { error });
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Failed to trigger sync',
        });
      }
    });

    // Root endpoint
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'Xandeum Pulse Backend',
        version: '1.0.0',
        description: 'pRPC to Supabase sync service',
        endpoints: {
          health: 'GET /health',
          syncStatus: 'GET /sync/status',
          triggerSync: 'POST /sync/trigger',
        },
      });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not found',
        path: req.path,
      });
    });

    // Error handler
    this.app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
      logger.error('Unhandled error', { error: err });
      res.status(500).json({
        error: 'Internal server error',
        message: config.nodeEnv === 'development' ? err.message : undefined,
      });
    });
  }

  start(): void {
    // Start scheduler
    this.scheduler.start();

    // Start HTTP server
    this.app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`, {
        env: config.nodeEnv,
        syncInterval: `${config.sync.intervalSeconds}s`,
      });
    });
  }

  stop(): void {
    this.scheduler.stop();
    logger.info('Server stopped');
  }
}
