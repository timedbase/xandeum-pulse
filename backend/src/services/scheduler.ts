import cron from 'node-cron';
import { SyncService } from './sync-service.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export class Scheduler {
  private syncService: SyncService;
  private cronJob: cron.ScheduledTask | null = null;
  private intervalTimer: NodeJS.Timeout | null = null;

  constructor(syncService: SyncService) {
    this.syncService = syncService;
  }

  start(): void {
    const intervalSeconds = config.sync.intervalSeconds;

    logger.info(`Starting scheduler with interval: ${intervalSeconds}s`);

    // For sub-minute intervals, use setInterval instead of cron
    if (intervalSeconds < 60) {
      this.intervalTimer = setInterval(async () => {
        logger.info('Interval triggered - starting sync...');
        try {
          await this.syncService.syncNodes();
        } catch (error) {
          logger.error('Scheduled sync failed', { error });
        }
      }, intervalSeconds * 1000);

      logger.info(`Scheduler started with ${intervalSeconds}s interval using setInterval`);
    } else {
      // For intervals >= 60 seconds, use cron
      const cronExpression = this.getCronExpression(intervalSeconds);

      this.cronJob = cron.schedule(cronExpression, async () => {
        logger.info('Cron job triggered - starting sync...');
        try {
          await this.syncService.syncNodes();
        } catch (error) {
          logger.error('Scheduled sync failed', { error });
        }
      });

      logger.info(`Scheduler started with cron expression: ${cronExpression}`);
    }

    // Run initial sync immediately
    this.runInitialSync();
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      logger.info('Cron scheduler stopped');
    }
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      logger.info('Interval scheduler stopped');
    }
  }

  private async runInitialSync(): Promise<void> {
    logger.info('Running initial sync...');
    try {
      await this.syncService.syncNodes();
    } catch (error) {
      logger.error('Initial sync failed', { error });
    }
  }

  private getCronExpression(seconds: number): string {
    // Handle different intervals
    if (seconds < 60) {
      // For intervals less than 60 seconds, run every N seconds
      // Cron doesn't support seconds, so we'll use a workaround
      // Run every minute, but the actual timing will be managed by the service
      return '* * * * *';
    } else if (seconds === 60) {
      // Every minute
      return '* * * * *';
    } else if (seconds % 60 === 0) {
      // Every N minutes
      const minutes = seconds / 60;
      if (minutes < 60) {
        return `*/${minutes} * * * *`;
      } else {
        // Every N hours
        const hours = minutes / 60;
        return `0 */${hours} * * *`;
      }
    } else {
      // Default to every minute for non-standard intervals
      return '* * * * *';
    }
  }

  async triggerSync(): Promise<void> {
    logger.info('Manual sync triggered');
    await this.syncService.syncNodes();
  }

  getStatus() {
    return {
      isRunning: this.cronJob !== null || this.intervalTimer !== null,
      syncStatus: this.syncService.getStatus(),
      intervalSeconds: config.sync.intervalSeconds,
      schedulerType: config.sync.intervalSeconds < 60 ? 'setInterval' : 'cron',
    };
  }
}
