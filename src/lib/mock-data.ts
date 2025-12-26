import type { PNode, NetworkStats, ClusterInfo } from '@/types/pnode';

// Generate realistic mock pNode data
const regions = ['US-East', 'US-West', 'EU-Central', 'EU-West', 'Asia-Pacific', 'South America'];
const versions = ['0.6.1', '0.6.0', '0.5.9'];

// Region coordinates for map visualization
export const regionCoordinates: Record<string, { lat: number; lng: number; name: string }> = {
  'US-East': { lat: 40.7128, lng: -74.006, name: 'US East' },
  'US-West': { lat: 37.7749, lng: -122.4194, name: 'US West' },
  'EU-Central': { lat: 50.1109, lng: 8.6821, name: 'EU Central' },
  'EU-West': { lat: 51.5074, lng: -0.1278, name: 'EU West' },
  'Asia-Pacific': { lat: 35.6762, lng: 139.6503, name: 'Asia Pacific' },
  'South America': { lat: -23.5505, lng: -46.6333, name: 'South America' },
};

// Seeded random number generator for consistent mock data
let seed = 12345; // Fixed seed for consistency

function seededRandom(): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function seededRandomInRange(min: number, max: number): number {
  return Math.floor(seededRandom() * (max - min + 1)) + min;
}

function generatePubkey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(seededRandom() * chars.length));
  }
  return result;
}

function generateIP(): string {
  return `${seededRandomInRange(1, 223)}.${seededRandomInRange(0, 255)}.${seededRandomInRange(0, 255)}.${seededRandomInRange(0, 255)}`;
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePNode(): PNode {
  const ip = generateIP();
  const statusRand = seededRandom();
  const status = statusRand > 0.15 ? 'online' : statusRand > 0.05 ? 'syncing' : 'offline';

  // Storage in GB
  const storageCommittedGB = seededRandomInRange(500, 10000);
  const storageUsedGB = seededRandomInRange(100, Math.floor(storageCommittedGB * 0.8));

  // Convert to bytes
  const storageCommitted = storageCommittedGB * 1024 * 1024 * 1024;
  const storageUsed = storageUsedGB * 1024 * 1024 * 1024;
  const storageUsagePercent = (storageUsed / storageCommitted) * 100;

  // Uptime in seconds (up to 30 days = 2,592,000 seconds)
  const uptimeSeconds = status === 'online'
    ? seededRandomInRange(86400, 2592000) // 1 day to 30 days
    : status === 'syncing'
    ? seededRandomInRange(3600, 86400) // 1 hour to 1 day
    : 0;

  const ramTotal = seededRandomInRange(8, 64) * 1024 * 1024 * 1024; // 8-64 GB
  const ramUsed = Math.floor(ramTotal * (0.5 + seededRandom() * 0.3)); // 50-80% used

  return {
    pubkey: generatePubkey(),
    gossip: `${ip}:9001`,
    prpc: `${ip}:6000`,
    version: versions[Math.floor(seededRandom() * versions.length)],
    status,
    isPublic: seededRandom() > 0.3, // 70% are public
    region: regions[Math.floor(seededRandom() * regions.length)],
    lastSeen: status === 'online'
      ? 'Just now'
      : status === 'syncing'
        ? `${seededRandomInRange(1, 5)} min ago`
        : `${seededRandomInRange(10, 120)} min ago`,

    // Storage (in bytes)
    storageCommitted,
    storageUsed,
    storageUsagePercent: Math.round(storageUsagePercent * 100) / 100,

    // Uptime (in seconds)
    uptimeSeconds,

    // Performance stats
    cpuPercent: status === 'online' ? seededRandomInRange(20, 80) : 0,
    ramUsed,
    ramTotal,
    packetsReceived: seededRandomInRange(100000, 10000000),
    packetsSent: seededRandomInRange(100000, 10000000),
    activeStreams: seededRandomInRange(1, 20),

    // Credits
    credits: seededRandomInRange(100, 50000),
  };
}

// Cache for consistent mock data
let cachedMockNodes: PNode[] | null = null;

export function generateMockPNodes(count: number = 42): PNode[] {
  // Return cached nodes if they exist
  if (cachedMockNodes && cachedMockNodes.length === count) {
    return cachedMockNodes;
  }

  // Reset seed for consistent generation
  seed = 12345;

  // Generate new nodes
  cachedMockNodes = Array.from({ length: count }, () => generatePNode());
  return cachedMockNodes;
}

export function calculateNetworkStats(nodes: PNode[]): NetworkStats {
  const onlineNodes = nodes.filter(n => n.status === 'online').length;

  // Calculate storage totals (already in bytes)
  const totalStorageCommitted = nodes.reduce((acc, n) => acc + n.storageCommitted, 0);
  const totalStorageUsed = nodes.reduce((acc, n) => acc + n.storageUsed, 0);
  const avgStorageUsagePercent = totalStorageCommitted > 0
    ? (totalStorageUsed / totalStorageCommitted) * 100
    : 0;

  // Calculate average uptime in seconds
  const avgUptimeSeconds = nodes.length > 0
    ? nodes.reduce((acc, n) => acc + n.uptimeSeconds, 0) / nodes.length
    : 0;

  // Calculate average CPU and RAM
  const nodesWithCpu = nodes.filter(n => n.cpuPercent !== undefined);
  const avgCpuPercent = nodesWithCpu.length > 0
    ? nodesWithCpu.reduce((acc, n) => acc + (n.cpuPercent || 0), 0) / nodesWithCpu.length
    : undefined;

  const nodesWithRam = nodes.filter(n => n.ramUsed !== undefined && n.ramTotal !== undefined);
  const avgRamUsagePercent = nodesWithRam.length > 0
    ? nodesWithRam.reduce((acc, n) => {
        const ramPercent = n.ramTotal! > 0 ? (n.ramUsed! / n.ramTotal!) * 100 : 0;
        return acc + ramPercent;
      }, 0) / nodesWithRam.length
    : undefined;

  const totalActiveStreams = nodes.reduce((acc, n) => acc + (n.activeStreams || 0), 0);

  return {
    totalNodes: nodes.length,
    onlineNodes,
    totalStorageCommitted,
    totalStorageUsed,
    avgStorageUsagePercent: Math.round(avgStorageUsagePercent * 100) / 100,
    avgUptimeSeconds: Math.round(avgUptimeSeconds),
    avgCpuPercent: avgCpuPercent ? Math.round(avgCpuPercent * 100) / 100 : undefined,
    avgRamUsagePercent: avgRamUsagePercent ? Math.round(avgRamUsagePercent * 100) / 100 : undefined,
    totalActiveStreams,
    networkVersion: 'v0.6 Stuttgart',
  };
}

export function generateClusterInfo(): ClusterInfo {
  const slot = randomInRange(280000000, 290000000);
  return {
    epoch: Math.floor(slot / 432000),
    slot: slot % 432000,
    blockHeight: slot - randomInRange(1000, 5000),
    absoluteSlot: slot,
  };
}

// Generate historical data for charts
export function generateStorageHistory(days: number = 30): { date: string; used: number; total: number }[] {
  const data = [];
  const now = new Date();
  let baseUsed = 80;
  let baseTotal = 150;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    baseUsed += randomInRange(-2, 5);
    baseTotal += randomInRange(0, 3);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      used: Math.max(50, baseUsed),
      total: Math.max(baseUsed + 20, baseTotal),
    });
  }
  return data;
}

export function generateUptimeHistory(days: number = 30): { date: string; uptime: number }[] {
  const data = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      uptime: randomInRange(92, 100),
    });
  }
  return data;
}

export function generateNetworkGrowth(months: number = 12): { month: string; nodes: number }[] {
  const data = [];
  const now = new Date();
  let nodeCount = 8;

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    nodeCount += randomInRange(2, 8);
    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      nodes: nodeCount,
    });
  }
  return data;
}

export function getRegionStats(nodes: PNode[]): { region: string; count: number; online: number; storage: number }[] {
  const regionMap = new Map<string, { count: number; online: number; storage: number }>();

  nodes.forEach(node => {
    const region = node.region || 'Unknown';
    const existing = regionMap.get(region) || { count: 0, online: 0, storage: 0 };
    regionMap.set(region, {
      count: existing.count + 1,
      online: existing.online + (node.status === 'online' ? 1 : 0),
      storage: existing.storage + node.storageCommitted,
    });
  });

  return Array.from(regionMap.entries()).map(([region, stats]) => ({
    region,
    ...stats,
  }));
}
