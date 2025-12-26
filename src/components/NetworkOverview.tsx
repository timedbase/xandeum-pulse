import { Server, HardDrive, Cpu, TrendingUp, Users, Coins } from 'lucide-react';
import { StatCard } from './StatCard';
import type { NetworkStats } from '@/types/pnode';

interface NetworkOverviewProps {
  stats: NetworkStats;
}

// Helper to format bytes to human-readable format
function formatBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Helper to format seconds to hours/days
function formatUptime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '0h';
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// Helper to format credits to human-readable format
function formatCredits(credits: number | null | undefined): string {
  if (credits === null || credits === undefined) return 'N/A';
  if (credits >= 1000000) return `${(credits / 1000000).toFixed(1)}M`;
  if (credits >= 1000) return `${(credits / 1000).toFixed(1)}K`;
  return credits.toLocaleString();
}

export function NetworkOverview({ stats }: NetworkOverviewProps) {
  return (
    <section className="space-y-2 sm:space-y-3 lg:space-y-3">
      <h2 className="text-base sm:text-lg lg:text-lg font-semibold">Network Overview</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 lg:gap-2.5">
        <StatCard
          title="Total pNodes"
          value={stats.totalNodes}
          subtitle="In network"
          icon={<Server className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-3.5 lg:h-3.5" />}
        />

        <StatCard
          title="Online"
          value={stats.onlineNodes}
          subtitle={`${Math.round((stats.onlineNodes / stats.totalNodes) * 100)}% up`}
          icon={<Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-3.5 lg:h-3.5" />}
        />

        <StatCard
          title="Storage"
          value={formatBytes(stats.totalStorageCommitted)}
          subtitle="Committed"
          icon={<HardDrive className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-3.5 lg:h-3.5" />}
        />

        <StatCard
          title="Used"
          value={stats.avgStorageUsagePercent !== undefined && stats.avgStorageUsagePercent !== null
            ? `${stats.avgStorageUsagePercent.toFixed(1)}%`
            : 'N/A'}
          subtitle="Avg usage"
          icon={<HardDrive className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-3.5 lg:h-3.5" />}
        />

        <StatCard
          title="Avg Uptime"
          value={formatUptime(stats.avgUptimeSeconds)}
          subtitle="Per node"
          icon={<TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-3.5 lg:h-3.5" />}
        />

        {stats.avgCpuPercent !== undefined && stats.avgCpuPercent !== null && (
          <StatCard
            title="Avg CPU"
            value={`${stats.avgCpuPercent.toFixed(1)}%`}
            subtitle="Network load"
            icon={<Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-3.5 lg:h-3.5" />}
          />
        )}

        {stats.totalCredits !== undefined && stats.totalCredits !== null && (
          <StatCard
            title="Total Credits"
            value={formatCredits(stats.totalCredits)}
            subtitle="Network credits"
            icon={<Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-3.5 lg:h-3.5" />}
          />
        )}
      </div>
    </section>
  );
}