import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { NetworkOverview } from '@/components/NetworkOverview';
import { PNodeGrid } from '@/components/PNodeGrid';
import { ClusterInfoBar } from '@/components/ClusterInfoBar';
import { NetworkCharts } from '@/components/NetworkCharts';
import { AdvancedAnalytics } from '@/components/AdvancedAnalytics';
import { NodeComparison } from '@/components/NodeComparison';
import { NotificationSystem } from '@/components/NotificationSystem';
import { ExportButton } from '@/components/ExportButton';
import { LoadingState, LoadingGrid } from '@/components/LoadingState';
import { ConnectionError } from '@/components/ErrorState';
import { GlobeWrapper } from '@/components/GlobeWrapper';
import { useClusterNodes, useNetworkStats, useClusterInfo } from '@/hooks/useRpcQuery';
import { useRealtimePNodes } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, BarChart3, GitCompare, Globe } from 'lucide-react';
import { useRefreshData } from '@/hooks/useRpcQuery';

const Dashboard = () => {
  const { data: nodes, isLoading: nodesLoading, error: nodesError, refetch: refetchNodes } = useClusterNodes();
  const { data: stats, isLoading: statsLoading, error: statsError } = useNetworkStats();
  const { data: clusterInfo, isLoading: clusterLoading, error: clusterError } = useClusterInfo();
  const { refreshAll } = useRefreshData();
  const [activeTab, setActiveTab] = useState('overview');

  // Enable real-time updates via WebSocket
  useRealtimePNodes();

  const isLoading = nodesLoading || statsLoading || clusterLoading;
  const hasError = nodesError || statsError || clusterError;

  // Show loading state
  if (isLoading && !nodes) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <section className="text-center space-y-2 py-4">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              <span className="text-primary">pNode</span> Network Analytics
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Real-time monitoring for Xandeum's decentralized storage network.
            </p>
          </section>
          <LoadingState message="Fetching pNode data..." size="lg" />
          <LoadingGrid count={6} />
        </div>
      </MainLayout>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6">
          <ConnectionError onRetry={refetchNodes} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <section className="text-center space-y-2 py-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              <span className="text-primary">pNode</span> Network Analytics
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshAll()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              {nodes && stats && clusterInfo && (
                <>
                  <NotificationSystem nodes={nodes} />
                  <ExportButton nodes={nodes} stats={stats} clusterInfo={clusterInfo} />
                </>
              )}
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Real-time monitoring for Xandeum's decentralized storage network.
          </p>
        </section>

        {/* Cluster Info */}
        {clusterInfo && <ClusterInfoBar info={clusterInfo} />}

        {/* Network Stats */}
        {stats && <NetworkOverview stats={stats} />}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Globe className="h-4 w-4" />
              Global Map
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <GitCompare className="h-4 w-4" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Charts Section */}
            {nodes && <NetworkCharts nodes={nodes} />}

            {/* pNodes Grid */}
            {nodes && <PNodeGrid nodes={nodes} />}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {nodes && <AdvancedAnalytics nodes={nodes} />}
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            {nodes && <GlobeWrapper nodes={nodes} />}
          </TabsContent>

          <TabsContent value="compare" className="space-y-6">
            {nodes && <NodeComparison nodes={nodes} />}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
