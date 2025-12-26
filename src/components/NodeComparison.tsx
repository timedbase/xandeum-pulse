import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { PNode } from '@/types/pnode';
import { Search, X, TrendingUp, TrendingDown, Minus, Award, Database, Activity, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface NodeComparisonProps {
  nodes: PNode[];
}

export function NodeComparison({ nodes }: NodeComparisonProps) {
  const [selectedNodes, setSelectedNodes] = useState<PNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = nodes.filter(node =>
    node.pubkey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.gossip.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addNode = (node: PNode) => {
    if (selectedNodes.length < 4 && !selectedNodes.find(n => n.pubkey === node.pubkey)) {
      setSelectedNodes([...selectedNodes, node]);
    }
  };

  const removeNode = (pubkey: string) => {
    setSelectedNodes(selectedNodes.filter(n => n.pubkey !== pubkey));
  };

  const compareMetric = (values: number[]) => {
    if (values.length < 2) return Array(values.length).fill('neutral');
    const max = Math.max(...values);
    const min = Math.min(...values);

    return values.map(v => {
      if (v === max && v !== min) return 'best';
      if (v === min && v !== max) return 'worst';
      return 'neutral';
    });
  };

  const uptimeComparison = compareMetric(selectedNodes.map(n => n.uptime));
  const storageUtilComparison = compareMetric(selectedNodes.map(n => (n.storageUsed / n.storageCapacity) * 100));
  const creditsComparison = compareMetric(selectedNodes.map(n => n.credits));
  const replicaSetsComparison = compareMetric(selectedNodes.map(n => n.replicaSets));

  const ComparisonIndicator = ({ status }: { status: string }) => {
    if (status === 'best') return <TrendingUp className="h-4 w-4 text-success" />;
    if (status === 'worst') return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Node Comparison</h2>
        <Badge variant="outline">
          {selectedNodes.length}/4 nodes selected
        </Badge>
      </div>

      {/* Node Search and Selection */}
      <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes by pubkey, IP, or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchQuery && (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {filteredNodes.slice(0, 10).map(node => (
                <button
                  key={node.pubkey}
                  onClick={() => addNode(node)}
                  disabled={selectedNodes.find(n => n.pubkey === node.pubkey) !== undefined || selectedNodes.length >= 4}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={node.status === 'online' ? 'success' : node.status === 'syncing' ? 'warning' : 'danger'}>
                      {node.status}
                    </Badge>
                    <span className="font-mono text-sm">{node.pubkey.slice(0, 12)}...</span>
                    <span className="text-xs text-muted-foreground">{node.region}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{node.uptime}% uptime</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Comparison Table */}
      {selectedNodes.length > 0 && (
        <div className="overflow-x-auto">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-2 text-sm font-medium text-muted-foreground">Metric</th>
                  {selectedNodes.map(node => (
                    <th key={node.pubkey} className="py-4 px-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{node.pubkey.slice(0, 8)}...</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeNode(node.pubkey)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge variant={node.status === 'online' ? 'success' : node.status === 'syncing' ? 'warning' : 'danger'}>
                          {node.status}
                        </Badge>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Basic Info */}
                <tr>
                  <td className="py-3 px-2 text-sm font-medium">Region</td>
                  {selectedNodes.map(node => (
                    <td key={node.pubkey} className="py-3 px-4 text-center text-sm">
                      {node.region || 'Unknown'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-2 text-sm font-medium">Version</td>
                  {selectedNodes.map(node => (
                    <td key={node.pubkey} className="py-3 px-4 text-center text-sm font-mono">
                      {node.version}
                    </td>
                  ))}
                </tr>

                {/* Performance Metrics */}
                <tr className="bg-muted/10">
                  <td className="py-3 px-2 text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Uptime
                  </td>
                  {selectedNodes.map((node, idx) => (
                    <td key={node.pubkey} className="py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{node.uptime}%</span>
                          <ComparisonIndicator status={uptimeComparison[idx]} />
                        </div>
                        <Progress value={node.uptime} className="w-full h-1" />
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-2 text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Credits
                  </td>
                  {selectedNodes.map((node, idx) => (
                    <td key={node.pubkey} className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium">
                          {node.credits !== undefined && node.credits !== null
                            ? node.credits.toLocaleString()
                            : 'N/A'}
                        </span>
                        <ComparisonIndicator status={creditsComparison[idx]} />
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Storage Metrics */}
                <tr className="bg-muted/10">
                  <td className="py-3 px-2 text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Storage Capacity
                  </td>
                  {selectedNodes.map(node => (
                    <td key={node.pubkey} className="py-3 px-4 text-center text-sm">
                      {node.storageCommitted !== undefined && node.storageCommitted !== null
                        ? (node.storageCommitted / (1024 ** 4)).toFixed(1) + ' TB'
                        : 'N/A'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-2 text-sm font-medium">Storage Used</td>
                  {selectedNodes.map(node => (
                    <td key={node.pubkey} className="py-3 px-4 text-center text-sm">
                      {node.storageUsed !== undefined && node.storageUsed !== null
                        ? (node.storageUsed / (1024 ** 4)).toFixed(1) + ' TB'
                        : 'N/A'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-2 text-sm font-medium">Storage Utilization</td>
                  {selectedNodes.map((node, idx) => {
                    const util = node.storageUsed !== undefined && node.storageUsed !== null &&
                                 node.storageCommitted !== undefined && node.storageCommitted !== null &&
                                 node.storageCommitted > 0
                      ? (node.storageUsed / node.storageCommitted) * 100
                      : 0;
                    return (
                      <td key={node.pubkey} className="py-3 px-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {util > 0 ? util.toFixed(1) + '%' : 'N/A'}
                            </span>
                            <ComparisonIndicator status={storageUtilComparison[idx]} />
                          </div>
                          <Progress value={util} className="w-full h-1" />
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Network Info */}
                <tr>
                  <td className="py-3 px-2 text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last Seen
                  </td>
                  {selectedNodes.map(node => (
                    <td key={node.pubkey} className="py-3 px-4 text-center text-xs text-muted-foreground">
                      {new Date(node.lastSeen).toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-2 text-sm font-medium">Gossip Address</td>
                  {selectedNodes.map(node => (
                    <td key={node.pubkey} className="py-3 px-4 text-center text-xs font-mono">
                      {node.gossip}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-3 px-2 text-sm font-medium">pRPC Address</td>
                  {selectedNodes.map(node => (
                    <td key={node.pubkey} className="py-3 px-4 text-center text-xs font-mono">
                      {node.prpc}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {selectedNodes.length === 0 && (
        <Card className="p-12 bg-card/50 backdrop-blur-sm border-border/50 text-center">
          <p className="text-muted-foreground">
            Search and select up to 4 nodes to compare their metrics
          </p>
        </Card>
      )}
    </div>
  );
}
