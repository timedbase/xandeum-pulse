import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PNode } from '@/types/pnode';
import { TrendingUp, TrendingDown, Activity, Zap, HardDrive, Award } from 'lucide-react';

interface AdvancedAnalyticsProps {
  nodes: PNode[];
}

export function AdvancedAnalytics({ nodes }: AdvancedAnalyticsProps) {
  // Early return if no nodes
  if (!nodes || nodes.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground">
          No nodes found to analyze. Please check your connection or wait for data to sync.
        </p>
      </Card>
    );
  }

  const analytics = useMemo(() => {
    // Performance distribution (calculate uptime percentage from uptimeSeconds)
    const performanceBuckets = {
      excellent: nodes.filter(n => {
        const uptimePercent = n.uptimeSeconds ? (n.uptimeSeconds / (24 * 3600)) * 100 : 0;
        return uptimePercent >= 99;
      }).length,
      good: nodes.filter(n => {
        const uptimePercent = n.uptimeSeconds ? (n.uptimeSeconds / (24 * 3600)) * 100 : 0;
        return uptimePercent >= 95 && uptimePercent < 99;
      }).length,
      fair: nodes.filter(n => {
        const uptimePercent = n.uptimeSeconds ? (n.uptimeSeconds / (24 * 3600)) * 100 : 0;
        return uptimePercent >= 90 && uptimePercent < 95;
      }).length,
      poor: nodes.filter(n => {
        const uptimePercent = n.uptimeSeconds ? (n.uptimeSeconds / (24 * 3600)) * 100 : 0;
        return uptimePercent < 90;
      }).length,
    };

    // Storage utilization by range
    const storageUtilization = nodes
      .filter(node => node.storageCommitted && node.storageCommitted > 0)
      .map(node => {
        const util = node.storageCommitted ? (node.storageUsed / node.storageCommitted) * 100 : 0;
        return {
          pubkey: node.pubkey.slice(0, 8),
          utilization: Math.round(util),
          capacity: node.storageCommitted,
          used: node.storageUsed,
          status: node.status,
        };
      }).sort((a, b) => b.utilization - a.utilization);

    // Credits distribution
    const creditsDistribution = [
      { range: '0-1K', count: nodes.filter(n => n.credits !== undefined && n.credits !== null && n.credits < 1000).length },
      { range: '1K-5K', count: nodes.filter(n => n.credits !== undefined && n.credits !== null && n.credits >= 1000 && n.credits < 5000).length },
      { range: '5K-10K', count: nodes.filter(n => n.credits !== undefined && n.credits !== null && n.credits >= 5000 && n.credits < 10000).length },
      { range: '10K-25K', count: nodes.filter(n => n.credits !== undefined && n.credits !== null && n.credits >= 10000 && n.credits < 25000).length },
      { range: '25K+', count: nodes.filter(n => n.credits !== undefined && n.credits !== null && n.credits >= 25000).length },
    ];

    // Version distribution
    const versionDistribution = Object.entries(
      nodes.reduce((acc, node) => {
        acc[node.version] = (acc[node.version] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([version, count]) => ({ version, count }));

    // Regional performance
    const regionalPerformance = Object.entries(
      nodes.reduce((acc, node) => {
        const region = node.region || 'Unknown';
        if (!acc[region]) {
          acc[region] = { region, totalUptime: 0, count: 0, totalStorage: 0 };
        }
        const uptimePercent = node.uptimeSeconds ? (node.uptimeSeconds / (24 * 3600)) * 100 : 0;
        acc[region].totalUptime += uptimePercent;
        acc[region].count += 1;
        acc[region].totalStorage += node.storageCommitted || 0;
        return acc;
      }, {} as Record<string, { region: string; totalUptime: number; count: number; totalStorage: number }>)
    ).map(([_, data]) => ({
      region: data.region,
      avgUptime: Math.round(data.totalUptime / data.count),
      nodeCount: data.count,
      totalStorage: Math.round(data.totalStorage / (1024 ** 4)), // Convert bytes to TB
    }));

    // Capacity vs Utilization scatter
    const capacityVsUtil = nodes
      .filter(node => node.storageCommitted && node.storageCommitted > 0)
      .map(node => ({
        capacity: node.storageCommitted,
        utilization: node.storageCommitted ? Math.round((node.storageUsed / node.storageCommitted) * 100) : 0,
        credits: node.credits || 0,
        status: node.status,
      }));

    // Top performers
    const topPerformers = [...nodes]
      .filter(n => n.credits !== undefined && n.credits !== null)
      .sort((a, b) => (b.credits || 0) - (a.credits || 0))
      .slice(0, 10)
      .map(node => {
        const uptimePercent = node.uptimeSeconds ? (node.uptimeSeconds / (24 * 3600)) * 100 : 0;
        return {
          pubkey: node.pubkey.slice(0, 12),
          credits: node.credits || 0,
          uptime: Math.round(uptimePercent),
          storage: Math.round(node.storageUsed / (1024 ** 4)), // Bytes to TB
        };
      });

    // Status distribution (instead of replica sets which doesn't exist)
    const statusDistribution = Object.entries(
      nodes.reduce((acc, node) => {
        acc[node.status] = (acc[node.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    return {
      performanceBuckets,
      storageUtilization,
      creditsDistribution,
      versionDistribution,
      regionalPerformance,
      capacityVsUtil,
      topPerformers,
      statusDistribution,
    };
  }, [nodes]);

  const COLORS = {
    excellent: '#10b981',
    good: '#3b82f6',
    fair: '#f59e0b',
    poor: '#ef4444',
    online: '#10b981',
    syncing: '#f59e0b',
    offline: '#ef4444',
  };

  const performanceData = [
    { name: 'Excellent (≥99%)', value: analytics.performanceBuckets.excellent, color: COLORS.excellent },
    { name: 'Good (95-99%)', value: analytics.performanceBuckets.good, color: COLORS.good },
    { name: 'Fair (90-95%)', value: analytics.performanceBuckets.fair, color: COLORS.fair },
    { name: 'Poor (<90%)', value: analytics.performanceBuckets.poor, color: COLORS.poor },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Advanced Analytics</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4" />
          <span>{nodes.length} nodes analyzed</span>
        </div>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="credits">Credits</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="top">Top Nodes</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
              <h3 className="text-lg font-semibold mb-4">Performance Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-lg font-semibold mb-4">Storage Utilization by Node</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.storageUtilization.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="pubkey" stroke="#888" />
                <YAxis stroke="#888" label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'utilization') return [`${value}%`, 'Utilization'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="utilization" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-lg font-semibold mb-4">Capacity vs Utilization</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="capacity"
                  name="Capacity"
                  unit=" GB"
                  stroke="#888"
                  label={{ value: 'Storage Capacity (GB)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  dataKey="utilization"
                  name="Utilization"
                  unit="%"
                  stroke="#888"
                  label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Scatter name="Nodes" data={analytics.capacityVsUtil} fill="#06b6d4" />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-lg font-semibold mb-4">Credits Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.creditsDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="range" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Legend />
                <Bar dataKey="count" fill="#10b981" name="Number of Nodes" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-lg font-semibold mb-4">Regional Performance</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.regionalPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="region" stroke="#888" />
                <YAxis yAxisId="left" stroke="#888" />
                <YAxis yAxisId="right" orientation="right" stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="avgUptime" fill="#3b82f6" name="Avg Uptime %" />
                <Bar yAxisId="right" dataKey="nodeCount" fill="#10b981" name="Node Count" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-lg font-semibold mb-4">Version Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={analytics.versionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ version, count }) => `${version} (${count})`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.versionDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 120}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="top" className="space-y-4">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Top 10 Performers by Credits
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.topPerformers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#888" />
                <YAxis dataKey="pubkey" type="category" stroke="#888" width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  formatter={(value: number, name: string) => {
                    if (name === 'uptime') return [`${value}%`, 'Uptime'];
                    if (name === 'storage') return [`${value} TB`, 'Storage Used'];
                    return [value.toLocaleString(), 'Credits'];
                  }}
                />
                <Legend />
                <Bar dataKey="credits" fill="#f59e0b" name="Credits" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
