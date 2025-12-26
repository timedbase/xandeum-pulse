import { MainLayout } from '@/components/MainLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Activity,
  Database,
  Globe,
  GitCompare,
  Bell,
  Download,
  Search,
  BarChart3,
  Network,
  HardDrive,
  Award,
  Clock,
  MapPin,
  TrendingUp,
  Filter,
  ArrowUpDown
} from 'lucide-react';

const Docs = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-6">
        {/* Hero Section */}
        <section className="text-center space-y-2 sm:space-y-3 lg:space-y-3 py-4 sm:py-6 lg:py-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 lg:h-10 lg:w-10 text-primary" />
            <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold tracking-tight">
              Documentation
            </h1>
          </div>
          <p className="text-xs sm:text-sm lg:text-sm text-muted-foreground max-w-2xl mx-auto px-4">
            Learn how to use Xandeum Pulse to monitor and analyze pNode network performance
          </p>
        </section>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6 lg:space-y-5">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">Overview</TabsTrigger>
            <TabsTrigger value="features" className="text-xs sm:text-sm py-2">Features</TabsTrigger>
            <TabsTrigger value="metrics" className="text-xs sm:text-sm py-2">Metrics</TabsTrigger>
            <TabsTrigger value="guide" className="text-xs sm:text-sm py-2">User Guide</TabsTrigger>
            <TabsTrigger value="supabase" className="text-xs sm:text-sm py-2">Supabase</TabsTrigger>
            <TabsTrigger value="api" className="text-xs sm:text-sm py-2">API Info</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-3 sm:space-y-4 lg:space-y-4">
            <Card className="p-4 sm:p-5 lg:p-5 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="text-lg sm:text-xl lg:text-xl font-semibold mb-2 sm:mb-3 lg:mb-3">What is Xandeum Pulse?</h2>
              <div className="space-y-2 sm:space-y-3 lg:space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                <p>
                  Xandeum Pulse is a comprehensive analytics platform designed to monitor and analyze
                  the Xandeum pNode network. It provides real-time insights into the decentralized
                  storage infrastructure built on Solana.
                </p>
                <p>
                  <strong className="text-foreground">pNodes</strong> (Provider Nodes) are the backbone
                  of Xandeum's scalable storage layer, offering exabyte-scale storage capacity for Solana dApps.
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-4">
              <Card className="p-3 sm:p-4 lg:p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <Network className="h-5 w-5 sm:h-6 sm:w-6 lg:h-6 lg:w-6 text-primary mb-2 sm:mb-2.5 lg:mb-2" />
                <h3 className="text-sm sm:text-base lg:text-base font-semibold mb-1 sm:mb-1.5 lg:mb-1.5">Network Monitoring</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Track real-time status of all pNodes in the network, including uptime,
                  storage utilization, and performance metrics.
                </p>
              </Card>

              <Card className="p-3 sm:p-4 lg:p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-6 lg:w-6 text-primary mb-2 sm:mb-2.5 lg:mb-2" />
                <h3 className="text-sm sm:text-base lg:text-base font-semibold mb-1 sm:mb-1.5 lg:mb-1.5">Advanced Analytics</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Comprehensive charts and visualizations to understand network health,
                  regional distribution, and performance trends.
                </p>
              </Card>

              <Card className="p-3 sm:p-4 lg:p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 lg:h-6 lg:w-6 text-primary mb-2 sm:mb-2.5 lg:mb-2" />
                <h3 className="text-sm sm:text-base lg:text-base font-semibold mb-1 sm:mb-1.5 lg:mb-1.5">Smart Alerts</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Get notified about node status changes, storage issues, and network events
                  in real-time with customizable preferences.
                </p>
              </Card>

              <Card className="p-3 sm:p-4 lg:p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <Download className="h-5 w-5 sm:h-6 sm:w-6 lg:h-6 lg:w-6 text-primary mb-2 sm:mb-2.5 lg:mb-2" />
                <h3 className="text-sm sm:text-base lg:text-base font-semibold mb-1 sm:mb-1.5 lg:mb-1.5">Data Export</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Export network data in JSON, CSV, or TXT formats for further analysis
                  and reporting.
                </p>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-3 sm:space-y-4 lg:space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-4">
              {/* Feature 1 */}
              <Card className="p-3 sm:p-4 lg:p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-3">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 text-primary mt-0.5 sm:mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base lg:text-base font-semibold mb-1 sm:mb-1.5 lg:mb-1.5">Real-Time Monitoring</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-2.5 lg:mb-2">
                      Monitor all pNodes in real-time with automatic data refresh and WebSocket support.
                    </p>
                    <ul className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                      <li>• Auto-refresh every 30 seconds</li>
                      <li>• Live status updates via WebSocket</li>
                      <li>• Manual refresh controls</li>
                      <li>• Connection status indicators</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Feature 2 */}
              <Card className="p-3 sm:p-4 lg:p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-3">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 text-primary mt-0.5 sm:mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base lg:text-base font-semibold mb-1 sm:mb-1.5 lg:mb-1.5">Advanced Search & Filtering</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-2.5 lg:mb-2">
                      Powerful search and filtering capabilities to find exactly what you need.
                    </p>
                    <ul className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                      <li>• Full-text search across pubkeys, IPs, and regions</li>
                      <li>• Filter by status (online, syncing, offline)</li>
                      <li>• Region and version filters</li>
                      <li>• Uptime range slider</li>
                      <li>• Storage capacity filtering</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Feature 3 */}
              <Card className="p-3 sm:p-4 lg:p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-3">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 text-primary mt-0.5 sm:mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base lg:text-base font-semibold mb-1 sm:mb-1.5 lg:mb-1.5">Comprehensive Analytics</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-2.5 lg:mb-2">
                      6 different analytics views with interactive charts and visualizations.
                    </p>
                    <ul className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                      <li>• Performance distribution (pie charts)</li>
                      <li>• Storage utilization analysis (bar & scatter charts)</li>
                      <li>• Credits distribution</li>
                      <li>• Regional performance comparison</li>
                      <li>• Version adoption tracking</li>
                      <li>• Top performers leaderboard</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Feature 4 */}
              <Card className="p-3 sm:p-4 lg:p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-3">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 text-primary mt-0.5 sm:mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base lg:text-base font-semibold mb-1 sm:mb-1.5 lg:mb-1.5">3D Global Map Visualization</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-2.5 lg:mb-2">
                      Interactive 3D globe powered by MapLibre GL showing real-time pNode distribution worldwide.
                    </p>
                    <ul className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                      <li>• 3D spherical Earth with globe projection</li>
                      <li>• Theme-aware (auto dark/light mode)</li>
                      <li>• 8 regional markers with color coding</li>
                      <li>• Drag to rotate, scroll to zoom</li>
                      <li>• Atmospheric effects and fog</li>
                      <li>• Click markers for detailed statistics</li>
                      <li>• Legend with real-time node counts</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Feature 5 */}
              <Card className="p-3 sm:p-4 lg:p-4 bg-card/50 backdrop-blur-sm border-border/50">
                <div className="flex items-start gap-2 sm:gap-3 lg:gap-3">
                  <GitCompare className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 text-primary mt-0.5 sm:mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base lg:text-base font-semibold mb-1 sm:mb-1.5 lg:mb-1.5">Node Comparison</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-2.5 lg:mb-2">
                      Compare up to 4 nodes side-by-side to identify performance differences.
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Side-by-side metric comparison</li>
                      <li>• Best/worst performance indicators</li>
                      <li>• Search and select nodes</li>
                      <li>• Comprehensive comparison table</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-3 sm:space-y-4 lg:space-y-4">
            <Card className="p-4 sm:p-5 lg:p-5 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="text-lg sm:text-xl lg:text-xl font-semibold mb-3 sm:mb-4 lg:mb-4">Understanding pNode Metrics</h2>

              <div className="space-y-4 sm:space-y-5 lg:space-y-5">
                {/* Node Metrics */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 lg:mb-3 flex items-center gap-2">
                    <Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Node-Level Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 lg:gap-3">
                    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 lg:mb-1.5">
                        <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                        <strong className="text-xs sm:text-sm">Uptime</strong>
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        Percentage of time the node has been online and responsive.
                        <br/>99%+ = Excellent, 95-99% = Good, 90-95% = Fair, &lt;90% = Poor
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 lg:mb-1.5">
                        <HardDrive className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-primary" />
                        <strong className="text-xs sm:text-sm">Storage Capacity</strong>
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        Total storage space available on the node, measured in GB or TB.
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 lg:mb-1.5">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-warning" />
                        <strong className="text-xs sm:text-sm">Storage Utilization</strong>
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        Percentage of storage currently in use.
                        <br/>&lt;70% = Healthy, 70-90% = Warning, &gt;90% = Critical
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 lg:mb-1.5">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-yellow-500" />
                        <strong className="text-xs sm:text-sm">Credits</strong>
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        XAND token credits earned by the node for providing storage services.
                        Higher credits indicate better performance.
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 lg:mb-1.5">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-muted-foreground" />
                        <strong className="text-xs sm:text-sm">Last Seen</strong>
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        Timestamp of the last successful communication with the node.
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 lg:mb-1.5">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-red-500" />
                        <strong className="text-xs sm:text-sm">Region</strong>
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        Geographic location of the node (e.g., US-East, EU-Central, Asia-Pacific).
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 lg:mb-1.5">
                        <Badge variant="outline">v0.6.1</Badge>
                        <strong className="text-xs sm:text-sm">Version</strong>
                      </div>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        Software version running on the node. Latest version is recommended.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Network Metrics */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 lg:mb-3 flex items-center gap-2">
                    <Network className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Network-Level Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 lg:gap-3">
                    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <strong className="text-xs sm:text-sm block mb-1 sm:mb-1.5 lg:mb-1.5">Total Nodes</strong>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        Total number of pNodes registered in the network.
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <strong className="text-xs sm:text-sm block mb-1 sm:mb-1.5 lg:mb-1.5">Online Nodes</strong>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        Number of nodes currently online and operational.
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <strong className="text-xs sm:text-sm block mb-1 sm:mb-1.5 lg:mb-1.5">Total Storage</strong>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        Combined storage capacity across all nodes, measured in TB.
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 md:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <strong className="text-xs sm:text-sm block mb-1 sm:mb-1.5 lg:mb-1.5">Network Uptime</strong>
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        Average uptime percentage across all active nodes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* User Guide Tab */}
          <TabsContent value="guide" className="space-y-3 sm:space-y-4 lg:space-y-4">
            <Card className="p-4 sm:p-5 lg:p-5 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="text-lg sm:text-xl lg:text-xl font-semibold mb-3 sm:mb-4 lg:mb-4">How to Use Xandeum Pulse</h2>

              <div className="space-y-4 sm:space-y-5 lg:space-y-5 lg:space-y-8">
                {/* Searching */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-2.5 lg:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Searching for Nodes
                  </h3>
                  <ol className="space-y-1 sm:space-y-1.5 lg:space-y-1.5 text-[10px] sm:text-xs md:text-sm text-muted-foreground list-decimal list-inside">
                    <li>Use the search bar to find nodes by public key, IP address, or region</li>
                    <li>Click status pills (All, Online, Syncing, Offline) for quick filtering</li>
                    <li>Click "Advanced" to access more filter options</li>
                    <li>Apply multiple filters simultaneously for precise results</li>
                  </ol>
                </div>

                {/* Filtering */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-2.5 lg:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Advanced Filtering
                  </h3>
                  <ol className="space-y-1 sm:space-y-1.5 lg:space-y-1.5 text-[10px] sm:text-xs md:text-sm text-muted-foreground list-decimal list-inside">
                    <li>Click "Advanced" button to open the filter panel</li>
                    <li>Select specific regions from the dropdown</li>
                    <li>Filter by software version</li>
                    <li>Use the uptime slider to set minimum/maximum uptime range</li>
                    <li>Click "Clear Filters" to reset all filters</li>
                  </ol>
                </div>

                {/* Sorting */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-2.5 lg:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <ArrowUpDown className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Sorting Results
                  </h3>
                  <ol className="space-y-1 sm:space-y-1.5 lg:space-y-1.5 text-[10px] sm:text-xs md:text-sm text-muted-foreground list-decimal list-inside">
                    <li>Open the Advanced filters panel</li>
                    <li>Select a sort field from the dropdown (Public Key, Uptime, Credits, Storage, Last Seen)</li>
                    <li>Click the sort direction button to toggle between ascending/descending</li>
                    <li>Results update automatically</li>
                  </ol>
                </div>

                {/* Exporting */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-2.5 lg:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <Download className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Exporting Data
                  </h3>
                  <ol className="space-y-1 sm:space-y-1.5 lg:space-y-1.5 text-[10px] sm:text-xs md:text-sm text-muted-foreground list-decimal list-inside">
                    <li>Click the "Export" button in the top right</li>
                    <li>Choose your format: JSON (complete data), CSV (spreadsheet), or TXT (readable)</li>
                    <li>Select what to export: pNode data or Network statistics</li>
                    <li>File downloads automatically to your device</li>
                  </ol>
                </div>

                {/* Notifications */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-2.5 lg:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Managing Notifications
                  </h3>
                  <ol className="space-y-1 sm:space-y-1.5 lg:space-y-1.5 text-[10px] sm:text-xs md:text-sm text-muted-foreground list-decimal list-inside">
                    <li>Click the bell icon (🔔) in the top right</li>
                    <li>Toggle "Enable Notifications" to turn alerts on/off</li>
                    <li>Configure which types of alerts you want to receive</li>
                    <li>View notification history in the panel</li>
                    <li>Mark notifications as read or clear all</li>
                  </ol>
                </div>

                {/* Comparison */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-2.5 lg:mb-2 flex items-center gap-1.5 sm:gap-2">
                    <GitCompare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Comparing Nodes
                  </h3>
                  <ol className="space-y-1 sm:space-y-1.5 lg:space-y-1.5 text-[10px] sm:text-xs md:text-sm text-muted-foreground list-decimal list-inside">
                    <li>Navigate to the "Compare" tab</li>
                    <li>Use the search bar to find nodes</li>
                    <li>Click on nodes to add them (up to 4 nodes)</li>
                    <li>Review the comparison table showing all metrics</li>
                    <li>Look for green (best) and red (worst) indicators</li>
                  </ol>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Supabase Setup Tab */}
          <TabsContent value="supabase" className="space-y-4 sm:space-y-6 lg:space-y-5">
            <Card className="p-4 sm:p-5 lg:p-5 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="text-lg sm:text-xl lg:text-xl font-semibold mb-3 sm:mb-4 lg:mb-3">Supabase Integration Setup</h2>
              <p className="text-xs sm:text-sm lg:text-sm text-muted-foreground mb-4 sm:mb-5 lg:mb-4">
                Xandeum Pulse can optionally integrate with Supabase for historical data storage and advanced analytics.
              </p>

              <div className="space-y-4 sm:space-y-5 lg:space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg lg:text-base font-semibold mb-2 sm:mb-3 lg:mb-2">Prerequisites</h3>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-1.5 text-xs sm:text-sm lg:text-sm text-muted-foreground ml-2 sm:ml-3">
                    <li>A Supabase account (free tier works fine)</li>
                    <li>A Supabase project created</li>
                    <li>Node.js 18+ installed</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg lg:text-base font-semibold mb-2 sm:mb-3 lg:mb-2">Step 1: Create Supabase Project</h3>
                  <ol className="list-decimal list-inside space-y-2 sm:space-y-2.5 text-xs sm:text-sm lg:text-sm text-muted-foreground ml-2 sm:ml-3">
                    <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com</a> and create an account</li>
                    <li>Click "New Project" and fill in the required details</li>
                    <li>Wait for your project to be provisioned (usually takes 1-2 minutes)</li>
                    <li>Once ready, go to Project Settings → API to get your credentials</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg lg:text-base font-semibold mb-2 sm:mb-3 lg:mb-2">Step 2: Set Up Database Schema</h3>
                  <ol className="list-decimal list-inside space-y-2 sm:space-y-2.5 text-xs sm:text-sm lg:text-sm text-muted-foreground ml-2 sm:ml-3">
                    <li>In your Supabase dashboard, go to the SQL Editor</li>
                    <li>Copy the contents of <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">supabase/schema.sql</code> from this project</li>
                    <li>Paste it into the SQL Editor and click "Run"</li>
                    <li>This will create all necessary tables, indexes, triggers, and RLS policies</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg lg:text-base font-semibold mb-2 sm:mb-3 lg:mb-2">Step 3: Configure Environment Variables</h3>
                  <p className="text-xs sm:text-sm lg:text-sm text-muted-foreground mb-3">
                    Create a <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">.env</code> file in your project root with the following:
                  </p>
                  <div className="p-3 sm:p-4 rounded-lg bg-muted/50 font-mono text-xs overflow-x-auto">
                    <pre>{`VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}</pre>
                  </div>
                  <p className="text-xs sm:text-sm lg:text-sm text-muted-foreground mt-2">
                    Get these values from Project Settings → API in your Supabase dashboard.
                  </p>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg lg:text-base font-semibold mb-2 sm:mb-3 lg:mb-2">Step 4: Database Schema Overview</h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <h4 className="text-sm sm:text-base font-semibold mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        pnodes
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Stores the current state of all pNodes in the network with real-time updates.
                      </p>
                    </div>

                    <div className="p-3 sm:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <h4 className="text-sm sm:text-base font-semibold mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        pnode_history
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Time-series historical data for tracking node performance over time. Automatically populated via triggers.
                      </p>
                    </div>

                    <div className="p-3 sm:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <h4 className="text-sm sm:text-base font-semibold mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        network_stats
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Aggregated network-wide statistics recorded periodically for trend analysis.
                      </p>
                    </div>

                    <div className="p-3 sm:p-4 rounded-lg bg-muted/20 border border-border/30">
                      <h4 className="text-sm sm:text-base font-semibold mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4 text-primary" />
                        pnode_metrics
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Detailed performance metrics for advanced analytics and custom reporting.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg lg:text-base font-semibold mb-2 sm:mb-3 lg:mb-2">Step 5: Verify Setup</h3>
                  <ol className="list-decimal list-inside space-y-2 sm:space-y-2.5 text-xs sm:text-sm lg:text-sm text-muted-foreground ml-2 sm:ml-3">
                    <li>Restart your development server: <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">npm run dev</code></li>
                    <li>Check the browser console for any Supabase connection errors</li>
                    <li>If configured correctly, the app will automatically use Supabase for historical data</li>
                    <li>If not configured, it will gracefully fall back to mock data</li>
                  </ol>
                </div>

                <div className="p-3 sm:p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h4 className="text-sm sm:text-base font-semibold mb-2 text-primary">Benefits of Supabase Integration</h4>
                  <ul className="list-disc list-inside space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-muted-foreground ml-2 sm:ml-3">
                    <li>Historical data persistence across sessions</li>
                    <li>Advanced time-series analytics</li>
                    <li>Trend analysis and performance tracking</li>
                    <li>Real-time data synchronization</li>
                    <li>Scalable infrastructure for production deployments</li>
                  </ul>
                </div>

                <div className="p-3 sm:p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <h4 className="text-sm sm:text-base font-semibold mb-2 text-warning">Optional Feature</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Supabase integration is completely optional. The app works perfectly with mock data for development and testing.
                    Only set up Supabase if you need persistent historical data and production-grade analytics.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* API Info Tab */}
          <TabsContent value="api" className="space-y-4 sm:space-y-6 lg:space-y-5">
            <Card className="p-4 sm:p-5 lg:p-5 bg-card/50 backdrop-blur-sm border-border/50">
              <h2 className="text-lg sm:text-xl lg:text-xl font-semibold mb-3 sm:mb-4 lg:mb-3">API Information</h2>

              <div className="space-y-4 sm:space-y-6 lg:space-y-5">
                <div>
                  <h3 className="text-base sm:text-lg lg:text-base font-semibold mb-2 sm:mb-2.5 lg:mb-2">pRPC Endpoints</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 lg:mb-3">
                    Xandeum Pulse connects to pNode RPC (pRPC) endpoints to fetch real-time data.
                  </p>
                  <div className="bg-muted/20 p-3 sm:p-4 lg:p-3 rounded-lg font-mono text-xs sm:text-sm">
                    <div className="text-muted-foreground mb-2"># Default pRPC port</div>
                    <div>Port: <span className="text-primary">6000</span></div>
                    <div className="mt-3 text-muted-foreground">Example endpoint:</div>
                    <div className="text-success">http://your-prpc-endpoint:6000</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg lg:text-base font-semibold mb-2 sm:mb-2.5 lg:mb-2">Data Updates</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    The platform supports two methods for keeping data current:
                  </p>
                  <ul className="space-y-2 mt-3 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">Polling</Badge>
                      <span>Automatic data refresh every 30 seconds (configurable)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">WebSocket</Badge>
                      <span>Real-time updates pushed from the server (when available)</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg lg:text-base font-semibold mb-2 sm:mb-2.5 lg:mb-2">Configuration</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    Configure the platform using environment variables:
                  </p>
                  <div className="bg-muted/20 p-3 sm:p-4 lg:p-3 rounded-lg font-mono text-xs space-y-1">
                    <div><span className="text-blue-400">VITE_SUPABASE_URL</span>=https://your-project.supabase.co</div>
                    <div><span className="text-blue-400">VITE_SUPABASE_ANON_KEY</span>=your-anon-key</div>
                    <div><span className="text-blue-400">VITE_PRPC_ENDPOINT</span>=http://localhost:6000/rpc</div>
                    <div><span className="text-blue-400">VITE_POLLING_INTERVAL</span>=30000</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg lg:text-base font-semibold mb-2 sm:mb-2.5 lg:mb-2">Learn More</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    <a
                      href="https://docs.xandeum.network"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline"
                    >
                      → Official Xandeum Documentation
                    </a>
                    <a
                      href="https://pnodes.xandeum.network"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline"
                    >
                      → pNode Setup Guide
                    </a>
                    <a
                      href="https://discord.gg/uqRSmmM5m"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-primary hover:underline"
                    >
                      → Join Xandeum Discord
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Docs;
