import React, { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { PNode } from '@/types/pnode';
import { generateStorageHistory, generateUptimeHistory, generateNetworkGrowth, getRegionStats, regionCoordinates } from '@/lib/mock-data';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface NetworkChartsProps {
  nodes: PNode[];
}

const CHART_COLORS = {
  primary: 'hsl(172, 66%, 50%)',
  muted: 'hsl(220, 10%, 50%)',
  success: 'hsl(142, 71%, 45%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 72%, 51%)',
};

export function NetworkCharts({ nodes }: NetworkChartsProps) {
  const [hoveredNode, setHoveredNode] = React.useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(3.5);
  const [center, setCenter] = React.useState<[number, number]>([0, 20]);

  const storageHistory = useMemo(() => generateStorageHistory(30), []);
  const uptimeHistory = useMemo(() => generateUptimeHistory(30), []);
  const networkGrowth = useMemo(() => generateNetworkGrowth(12), []);
  const regionStats = useMemo(() => getRegionStats(nodes), [nodes]);

  // Generate individual node coordinates with slight offset from region center
  const nodeCoordinates = useMemo(() => {
    return nodes.map((node, index) => {
      const regionCoord = regionCoordinates[node.region || 'US-East'];
      if (!regionCoord) return null;

      // Create a deterministic offset based on node pubkey to avoid random repositioning
      const hash = node.pubkey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angle = (hash % 360) * (Math.PI / 180);
      const distance = ((hash % 100) / 100) * 0.8; // Smaller spread within ~0.8 degree radius for accuracy

      return {
        node,
        lat: regionCoord.lat + Math.sin(angle) * distance,
        lng: regionCoord.lng + Math.cos(angle) * distance,
      };
    }).filter(Boolean);
  }, [nodes]);

  const statusData = useMemo(() => {
    const online = nodes.filter(n => n.status === 'online').length;
    const syncing = nodes.filter(n => n.status === 'syncing').length;
    const offline = nodes.filter(n => n.status === 'offline').length;
    return [
      { name: 'Online', value: online, color: CHART_COLORS.success },
      { name: 'Syncing', value: syncing, color: CHART_COLORS.warning },
      { name: 'Offline', value: offline, color: CHART_COLORS.destructive },
    ];
  }, [nodes]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md p-3 border border-border bg-popover shadow-lg">
          <p className="font-medium text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name}: <span className="font-mono font-medium text-foreground">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Network Analytics</h2>

      <div className="rounded-lg border border-border bg-card">
        <Tabs defaultValue="storage" className="p-4">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="uptime">Uptime</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="regions">Regions</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          <TabsContent value="storage">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={storageHistory}>
                  <defs>
                    <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
                  <XAxis dataKey="date" stroke={CHART_COLORS.muted} fontSize={11} tickLine={false} />
                  <YAxis stroke={CHART_COLORS.muted} fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="used" stroke={CHART_COLORS.primary} fill="url(#storageGradient)" strokeWidth={2} name="Used (TB)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">Storage usage over the last 30 days</p>
          </TabsContent>

          <TabsContent value="uptime">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={uptimeHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
                  <XAxis dataKey="date" stroke={CHART_COLORS.muted} fontSize={11} tickLine={false} />
                  <YAxis stroke={CHART_COLORS.muted} fontSize={11} domain={[90, 100]} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="uptime" stroke={CHART_COLORS.success} strokeWidth={2} dot={false} name="Uptime %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">Network uptime over the last 30 days</p>
          </TabsContent>

          <TabsContent value="growth">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={networkGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 18%)" />
                  <XAxis dataKey="month" stroke={CHART_COLORS.muted} fontSize={11} tickLine={false} />
                  <YAxis stroke={CHART_COLORS.muted} fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="nodes" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} name="Total Nodes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">Network growth over the last 12 months</p>
          </TabsContent>

          <TabsContent value="regions">
            <div className="space-y-4 relative">
              <div className="h-[400px] bg-muted/5 rounded border border-border relative">
                {/* Zoom Controls */}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-background/95 backdrop-blur"
                    onClick={() => setZoom(prev => Math.min(prev + 0.5, 8))}
                    title="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-background/95 backdrop-blur"
                    onClick={() => setZoom(prev => Math.max(prev - 0.5, 0.8))}
                    title="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 bg-background/95 backdrop-blur"
                    onClick={() => {
                      setZoom(3.5);
                      setCenter([0, 20]);
                    }}
                    title="Reset view"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>

                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 140, center: center }}
                  width={800}
                  height={400}
                  className="w-full h-full"
                >
                  <ZoomableGroup zoom={zoom} center={center} onMoveEnd={(position: any) => setCenter(position.coordinates)}>
                    <Geographies geography={geoUrl}>
                      {({ geographies }: any) =>
                        geographies.map((geo: any) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill="hsl(var(--muted))"
                            stroke="hsl(var(--border))"
                            strokeWidth={0.3}
                            style={{
                              default: { outline: 'none' },
                              hover: {
                                fill: 'hsl(var(--muted) / 0.7)',
                                outline: 'none',
                                cursor: 'pointer'
                              },
                              pressed: { outline: 'none' }
                            }}
                          />
                        ))
                      }
                    </Geographies>
                    {nodeCoordinates.map((coord: any) => {
                      const { node, lat, lng } = coord;
                      const isHovered = hoveredNode === node.pubkey;

                      // Color based on status
                      let markerColor = CHART_COLORS.success; // online
                      if (node.status === 'syncing') markerColor = CHART_COLORS.warning;
                      if (node.status === 'offline') markerColor = CHART_COLORS.destructive;

                      return (
                        <Marker key={node.pubkey} coordinates={[lng, lat]}>
                          {/* Pulse ring on hover */}
                          {isHovered && (
                            <circle
                              r={5 / zoom}
                              fill="none"
                              stroke={markerColor}
                              strokeWidth={1.5 / zoom}
                              opacity={0.6}
                            />
                          )}

                          {/* Main marker */}
                          <circle
                            r={3 / zoom}
                            fill={markerColor}
                            stroke="hsl(var(--background))"
                            strokeWidth={0.5 / zoom}
                            opacity={isHovered ? 1 : 0.85}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={(e: any) => {
                              setHoveredNode(node.pubkey);
                              const rect = e.target.getBoundingClientRect?.();
                              if (rect) {
                                setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                              }
                            }}
                            onMouseLeave={() => setHoveredNode(null)}
                          />
                        </Marker>
                      );
                    })}
                  </ZoomableGroup>
                </ComposableMap>

                {/* Hover Tooltip */}
                {hoveredNode && (
                  <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                      left: `${tooltipPos.x}px`,
                      top: `${tooltipPos.y - 140}px`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="bg-popover border border-border rounded-lg shadow-xl p-3 min-w-[220px]">
                      {(() => {
                        const node = nodes.find(n => n.pubkey === hoveredNode);
                        if (!node) return null;

                        const statusColor = node.status === 'online'
                          ? 'text-success'
                          : node.status === 'syncing'
                            ? 'text-warning'
                            : 'text-destructive';

                        return (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-xs">pNode</h4>
                              <span className={`text-xs font-medium ${statusColor}`}>{node.status}</span>
                            </div>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Region:</span>
                                <span className="font-mono text-foreground">{node.region}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Storage:</span>
                                <span className="font-mono text-foreground">
                                  {(node.storageUsed / (1024 ** 3)).toFixed(0)} / {(node.storageCommitted / (1024 ** 3)).toFixed(0)} GB
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Usage:</span>
                                <span className="font-mono text-foreground">{node.storageUsagePercent.toFixed(1)}%</span>
                              </div>
                              {node.cpuPercent !== undefined && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">CPU:</span>
                                  <span className="font-mono text-foreground">{node.cpuPercent.toFixed(1)}%</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between pt-1.5 border-t border-border">
                                <span className="text-muted-foreground">Pubkey:</span>
                                <span className="font-mono text-foreground text-[10px]">{node.pubkey.slice(0, 8)}...</span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {regionStats.map((stat) => {
                  return (
                    <div
                      key={stat.region}
                      className="text-center p-2 rounded border border-border bg-card/50"
                    >
                      <div className="text-xs text-muted-foreground mb-1">{stat.region}</div>
                      <div className="font-bold text-lg">{stat.count}</div>
                      <div className="text-xs text-muted-foreground">{stat.online} online</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="status">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-3 text-center">Node Status</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {statusData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs text-muted-foreground">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3 text-center">Regional Distribution</h3>
                <div className="space-y-2">
                  {regionStats.slice(0, 6).map((stat) => (
                    <div key={stat.region} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-20 truncate">{stat.region}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(stat.count / nodes.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-6 text-right">{stat.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}