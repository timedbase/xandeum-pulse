import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Server, Wifi, Database, Award, Clock, MapPin, Copy, ExternalLink, Activity, HardDrive } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LoadingState } from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { useNodeInfo } from '@/hooks/useRpcQuery';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PNodeDetail = () => {
  const { pubkey } = useParams<{ pubkey: string }>();
  const navigate = useNavigate();

  const { data: node, isLoading, error, refetch } = useNodeInfo(pubkey);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <LoadingState message="Loading pNode details..." size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <ErrorState
            title="Failed to Load pNode"
            error={error as Error}
            onRetry={refetch}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card variant="glass" className="p-8 text-center space-y-4">
            <Server className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">pNode Not Found</h2>
            <p className="text-muted-foreground">The requested pNode could not be found.</p>
            <Button variant="glow" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const storagePercent = node.storageUsagePercent || Math.round((node.storageUsed / node.storageCommitted) * 100);

  // Calculate uptime percentage (assume 30 days = 100%)
  const uptimePercent = Math.min(100, Math.round((node.uptimeSeconds / (30 * 24 * 60 * 60)) * 100));

  const statusConfig = {
    online: { badge: 'success', label: 'Online', dotColor: 'bg-success' },
    syncing: { badge: 'warning', label: 'Syncing', dotColor: 'bg-warning' },
    offline: { badge: 'danger', label: 'Offline', dotColor: 'bg-destructive' },
  } as const;

  const status = statusConfig[node.status];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-3 sm:px-4 lg:px-4 py-3 sm:py-4 lg:py-5 space-y-3 sm:space-y-4 lg:space-y-4">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-1 sm:mb-2">
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={cn(
              "p-2 sm:p-2.5 lg:p-3 rounded-lg",
              node.status === 'online' ? "bg-success/20 glow-success" :
              node.status === 'syncing' ? "bg-warning/20" : "bg-muted"
            )}>
              <Server className={cn(
                "w-5 h-5 sm:w-6 sm:h-6 lg:w-6 lg:h-6",
                node.status === 'online' ? "text-success" :
                node.status === 'syncing' ? "text-warning" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">pNode Details</h1>
              <p className="text-muted-foreground font-mono text-xs sm:text-sm">{node.pubkey.slice(0, 8)}...{node.pubkey.slice(-6)}</p>
            </div>
          </div>
          <Badge variant={status.badge as any} className="text-xs sm:text-sm px-3 sm:px-3 py-1 sm:py-1">
            <span className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2", status.dotColor)} />
            {status.label}
          </Badge>
        </div>

        {/* Performance Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
          <Card variant="glass" className="p-2.5 sm:p-3 lg:p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="p-1 sm:p-1.5 rounded bg-success/20">
                <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-success" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Health</p>
            </div>
            <p className="text-base sm:text-lg lg:text-xl font-bold">{uptimePercent}%</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Uptime</p>
          </Card>

          <Card variant="glass" className="p-2.5 sm:p-3 lg:p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="p-1 sm:p-1.5 rounded bg-primary/20">
                <HardDrive className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Storage</p>
            </div>
            <p className="text-base sm:text-lg lg:text-xl font-bold">{storagePercent}%</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">Utilized</p>
          </Card>

          <Card variant="glass" className="p-2.5 sm:p-3 lg:p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="p-1 sm:p-1.5 rounded bg-warning/20">
                <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-warning" />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Credits</p>
            </div>
            <p className="text-base sm:text-lg lg:text-xl font-bold">{(node.credits / 1000).toFixed(1)}K</p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground">XAND</p>
          </Card>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-3 lg:gap-4">
          {/* Main Info Card */}
          <Card variant="glass" className="lg:col-span-2 p-3 sm:p-4 lg:p-4 space-y-3 sm:space-y-3 lg:space-y-4">
            <h2 className="text-sm sm:text-base lg:text-base font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 sm:w-4 sm:h-4 text-primary" />
              Node Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-3">
              {/* Public Key */}
              <div className="space-y-1 sm:space-y-1.5 col-span-full">
                <label className="text-xs sm:text-xs text-muted-foreground">Public Key</label>
                <div className="flex items-center gap-1.5 p-2 sm:p-2.5 rounded-lg bg-muted/50 font-mono text-xs">
                  <span className="truncate flex-1">{node.pubkey}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6 sm:h-7 sm:w-7" onClick={() => copyToClipboard(node.pubkey, 'Public Key')}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Gossip Address */}
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-xs sm:text-xs text-muted-foreground">Gossip Address</label>
                <div className="flex items-center gap-1.5 p-2 sm:p-2.5 rounded-lg bg-muted/50 font-mono text-xs">
                  <Wifi className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="flex-1 truncate">{node.gossip}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0" onClick={() => copyToClipboard(node.gossip, 'Gossip Address')}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* pRPC Address */}
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-xs sm:text-xs text-muted-foreground">pRPC Address</label>
                <div className="flex items-center gap-1.5 p-2 sm:p-2.5 rounded-lg bg-muted/50 font-mono text-xs">
                  <ExternalLink className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="flex-1 truncate">{node.prpc}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0" onClick={() => copyToClipboard(node.prpc, 'pRPC Address')}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Version */}
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-xs sm:text-xs text-muted-foreground">Version</label>
                <div className="p-2 sm:p-2.5 rounded-lg bg-muted/50 font-mono text-xs">
                  v{node.version}
                </div>
              </div>

              {/* Region */}
              <div className="space-y-1 sm:space-y-1.5">
                <label className="text-xs sm:text-xs text-muted-foreground">Region</label>
                <div className="flex items-center gap-1.5 p-2 sm:p-2.5 rounded-lg bg-muted/50 text-xs">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span>{node.region}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="space-y-2.5 sm:space-y-3">
            {/* Uptime Card */}
            <Card variant="glass" className="p-3 sm:p-3.5 lg:p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded bg-primary/20">
                  <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="text-lg sm:text-xl font-bold">{uptimePercent}%</p>
                </div>
              </div>
              <Progress value={uptimePercent} className="h-1.5" />
            </Card>

            {/* Credits Card */}
            <Card variant="glass" className="p-3 sm:p-3.5 lg:p-3.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-warning/20">
                  <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Credits</p>
                  <p className="text-lg sm:text-xl font-bold">{node.credits.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            {/* Last Seen Card */}
            <Card variant="glass" className="p-3 sm:p-3.5 lg:p-3.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-muted">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Seen</p>
                  <p className="text-sm sm:text-base font-semibold">{node.lastSeen}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Storage Section */}
        <Card variant="glass" className="p-3 sm:p-4 lg:p-4 space-y-2.5 sm:space-y-3">
          <h2 className="text-sm sm:text-base lg:text-base font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 sm:w-4 sm:h-4 text-primary" />
            Storage Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Capacity</p>
              <p className="text-xl sm:text-2xl lg:text-2xl font-bold">{Math.round(node.storageCommitted / (1024 ** 3)).toLocaleString()} <span className="text-sm sm:text-base text-muted-foreground">GB</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Used Storage</p>
              <p className="text-xl sm:text-2xl lg:text-2xl font-bold text-primary">{Math.round(node.storageUsed / (1024 ** 3)).toLocaleString()} <span className="text-sm sm:text-base text-muted-foreground">GB</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Available</p>
              <p className="text-xl sm:text-2xl lg:text-2xl font-bold text-success">{Math.round((node.storageCommitted - node.storageUsed) / (1024 ** 3)).toLocaleString()} <span className="text-sm sm:text-base text-muted-foreground">GB</span></p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Storage Usage</span>
              <span className="font-mono">{storagePercent}%</span>
            </div>
            <div className="h-2.5 sm:h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default PNodeDetail;
