import { useNavigate } from 'react-router-dom';
import { Server, Wifi, Database, Cpu, Clock, MapPin, Coins } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { PNode } from '@/types/pnode';
import { cn } from '@/lib/utils';

interface PNodeCardProps {
  node: PNode;
  index: number;
}

// Helper to format bytes to human-readable format
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Helper to format uptime seconds to hours/days
function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// Helper to format last seen as relative time
function formatLastSeen(isoString: string): string {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}d ago`;
}

export function PNodeCard({ node, index }: PNodeCardProps) {
  const navigate = useNavigate();
  const storagePercent = node.storageUsagePercent ||
    (node.storageCommitted > 0 ? Math.round((node.storageUsed / node.storageCommitted) * 100) : 0);
  
  const statusConfig = {
    online: { badge: 'success', label: 'Online', dotColor: 'bg-success' },
    syncing: { badge: 'warning', label: 'Syncing', dotColor: 'bg-warning' },
    offline: { badge: 'danger', label: 'Offline', dotColor: 'bg-destructive' },
  } as const;

  const status = statusConfig[node.status];

  const handleClick = () => {
    navigate(`/node/${node.pubkey}`);
  };

  return (
    <Card
      variant="glass"
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer",
        "hover:border-primary/40 hover:translate-y-[-2px]",
        node.status === 'online' && "hover:glow-primary"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={handleClick}
    >
      {/* Animated border stroke */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ borderRadius: '0.5rem' }}>
        <rect
          x="0.5"
          y="0.5"
          width="calc(100% - 1px)"
          height="calc(100% - 1px)"
          rx="8"
          fill="none"
          stroke={node.status === 'online' ? 'hsl(var(--success))' : node.status === 'syncing' ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'}
          strokeWidth="2"
          strokeDasharray="10 290"
          className={cn(
            node.status === 'online' && "animate-border-trace-green",
            node.status === 'syncing' && "animate-border-trace-yellow",
            node.status === 'offline' && "animate-border-trace-red"
          )}
        />
      </svg>

      {/* Status indicator line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-0.5 z-10",
        node.status === 'online' && "bg-gradient-to-r from-success/0 via-success to-success/0",
        node.status === 'syncing' && "bg-gradient-to-r from-warning/0 via-warning to-warning/0",
        node.status === 'offline' && "bg-gradient-to-r from-destructive/0 via-destructive to-destructive/0"
      )} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-lg transition-colors",
              node.status === 'online' ? "bg-success/20" : 
              node.status === 'syncing' ? "bg-warning/20" : "bg-muted"
            )}>
              <Server className={cn(
                "w-5 h-5",
                node.status === 'online' ? "text-success" : 
                node.status === 'syncing' ? "text-warning" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="font-mono text-sm font-medium text-foreground truncate max-w-[180px]">
                {node.pubkey.slice(0, 8)}...{node.pubkey.slice(-4)}
              </p>
              <p className="text-xs text-muted-foreground font-mono">{node.gossip}</p>
            </div>
          </div>
          
          <Badge variant={status.badge as any}>
            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", status.dotColor)} />
            {status.label}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Wifi className="w-3.5 h-3.5" />
              <span className="text-xs">Uptime</span>
            </div>
            <p className="text-sm font-semibold">{formatUptime(node.uptimeSeconds)}</p>
          </div>

          {node.cpuPercent !== undefined && node.cpuPercent !== null && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Cpu className="w-3.5 h-3.5" />
                <span className="text-xs">CPU</span>
              </div>
              <p className="text-sm font-semibold">{node.cpuPercent.toFixed(1)}%</p>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">Last Seen</span>
            </div>
            <p className="text-sm font-semibold">{formatLastSeen(node.lastSeen)}</p>
          </div>

          {node.region && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-xs">Region</span>
              </div>
              <p className="text-sm font-semibold">{node.region}</p>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Coins className="w-3.5 h-3.5" />
              <span className="text-xs">Credits</span>
            </div>
            <p className="text-sm font-semibold">
              {node.credits !== undefined && node.credits !== null ? node.credits.toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Storage Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Database className="w-3.5 h-3.5" />
              <span>Storage</span>
            </div>
            <span className="font-mono">
              {formatBytes(node.storageUsed)} / {formatBytes(node.storageCommitted)}
            </span>
          </div>
          <Progress
            value={storagePercent}
            className="h-1.5"
          />
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <span className="font-mono">v{node.version}</span>
        </div>
      </div>
    </Card>
  );
}
