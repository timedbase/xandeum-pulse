import type { PNode } from '@/types/pnode';

// Region coordinates for map visualization
export const regionCoordinates: Record<string, { lat: number; lng: number; name: string }> = {
  'US-East': { lat: 40.7128, lng: -74.006, name: 'US East' },
  'US-West': { lat: 37.7749, lng: -122.4194, name: 'US West' },
  'EU-Central': { lat: 50.1109, lng: 8.6821, name: 'EU Central' },
  'EU-West': { lat: 51.5074, lng: -0.1278, name: 'EU West' },
  'Asia-Pacific': { lat: 35.6762, lng: 139.6503, name: 'Asia Pacific' },
  'South America': { lat: -23.5505, lng: -46.6333, name: 'South America' },
};

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
      storage: existing.storage + (node.storageCommitted || 0),
    });
  });

  return Array.from(regionMap.entries()).map(([region, stats]) => ({
    region,
    ...stats,
  }));
}
