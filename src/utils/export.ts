/**
 * Data export utilities
 */

import type { PNode, NetworkStats, ClusterInfo } from '@/types/pnode';

export type ExportFormat = 'json' | 'csv' | 'txt';

/**
 * Download a file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export pNodes to JSON
 */
export function exportNodesAsJSON(nodes: PNode[], filename = 'pnodes-export.json') {
  const content = JSON.stringify(nodes, null, 2);
  downloadFile(content, filename, 'application/json');
}

/**
 * Export pNodes to CSV
 */
export function exportNodesAsCSV(nodes: PNode[], filename = 'pnodes-export.csv') {
  const headers = [
    'Public Key',
    'Status',
    'Gossip Address',
    'pRPC Address',
    'Version',
    'Uptime (seconds)',
    'Storage Committed (GB)',
    'Storage Used (GB)',
    'Storage Utilization (%)',
    'CPU Percent',
    'Credits',
    'Region',
    'Last Seen',
  ];

  const rows = nodes.map(node => {
    const storageCommittedGB = node.storageCommitted ? (node.storageCommitted / (1024 ** 3)).toFixed(2) : 'N/A';
    const storageUsedGB = node.storageUsed ? (node.storageUsed / (1024 ** 3)).toFixed(2) : 'N/A';
    const utilization = node.storageUsed && node.storageCommitted && node.storageCommitted > 0
      ? ((node.storageUsed / node.storageCommitted) * 100).toFixed(2)
      : 'N/A';

    return [
      node.pubkey,
      node.status,
      node.gossip,
      node.prpc,
      node.version,
      node.uptimeSeconds || 0,
      storageCommittedGB,
      storageUsedGB,
      utilization,
      node.cpuPercent !== undefined && node.cpuPercent !== null ? node.cpuPercent.toFixed(1) : 'N/A',
      node.credits !== undefined && node.credits !== null ? node.credits : 'N/A',
      node.region || '',
      node.lastSeen,
    ];
  });

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape cells containing commas or quotes
      const str = String(cell);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(','))
  ].join('\n');

  downloadFile(csv, filename, 'text/csv');
}

/**
 * Export pNodes to plain text
 */
export function exportNodesAsText(nodes: PNode[], filename = 'pnodes-export.txt') {
  const content = nodes.map(node => {
    const storageCommittedGB = node.storageCommitted ? (node.storageCommitted / (1024 ** 3)).toFixed(2) : 'N/A';
    const storageUsedGB = node.storageUsed ? (node.storageUsed / (1024 ** 3)).toFixed(2) : 'N/A';
    const utilization = node.storageUsed && node.storageCommitted && node.storageCommitted > 0
      ? ((node.storageUsed / node.storageCommitted) * 100).toFixed(2)
      : 'N/A';

    return `
=== pNode: ${node.pubkey} ===
Status: ${node.status}
Version: ${node.version}
Region: ${node.region || 'Unknown'}
Gossip: ${node.gossip}
pRPC: ${node.prpc}
Uptime: ${node.uptimeSeconds || 0} seconds
Storage: ${storageUsedGB} GB / ${storageCommittedGB} GB (${utilization}%)
CPU: ${node.cpuPercent !== undefined && node.cpuPercent !== null ? node.cpuPercent.toFixed(1) + '%' : 'N/A'}
Credits: ${node.credits !== undefined && node.credits !== null ? node.credits : 'N/A'}
Last Seen: ${node.lastSeen}
`.trim();
  }).join('\n\n' + '='.repeat(60) + '\n\n');

  const header = `Xandeum pNode Export
Generated: ${new Date().toISOString()}
Total Nodes: ${nodes.length}
${'='.repeat(60)}\n\n`;

  downloadFile(header + content, filename, 'text/plain');
}

/**
 * Export network statistics
 */
export function exportNetworkStats(
  stats: NetworkStats,
  clusterInfo: ClusterInfo,
  format: ExportFormat = 'json'
) {
  const data = {
    exportDate: new Date().toISOString(),
    networkStats: stats,
    clusterInfo,
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

  switch (format) {
    case 'json':
      downloadFile(
        JSON.stringify(data, null, 2),
        `network-stats-${timestamp}.json`,
        'application/json'
      );
      break;

    case 'csv': {
      const csv = [
        'Metric,Value',
        `Total Nodes,${stats.totalNodes}`,
        `Online Nodes,${stats.onlineNodes}`,
        `Total Storage Committed (TB),${stats.totalStorageCommitted !== undefined && stats.totalStorageCommitted !== null ? (stats.totalStorageCommitted / (1024 ** 4)).toFixed(2) : 'N/A'}`,
        `Total Storage Used (TB),${stats.totalStorageUsed !== undefined && stats.totalStorageUsed !== null ? (stats.totalStorageUsed / (1024 ** 4)).toFixed(2) : 'N/A'}`,
        `Avg Storage Usage (%),${stats.avgStorageUsagePercent !== undefined && stats.avgStorageUsagePercent !== null ? stats.avgStorageUsagePercent.toFixed(2) : 'N/A'}`,
        `Average Uptime (seconds),${stats.avgUptimeSeconds !== undefined && stats.avgUptimeSeconds !== null ? stats.avgUptimeSeconds : 'N/A'}`,
        `Average CPU (%),${stats.avgCpuPercent !== undefined && stats.avgCpuPercent !== null ? stats.avgCpuPercent.toFixed(2) : 'N/A'}`,
        `Network Version,${stats.networkVersion}`,
        '',
        'Cluster Information',
        `Epoch,${clusterInfo.epoch}`,
        `Slot,${clusterInfo.slot}`,
        `Block Height,${clusterInfo.blockHeight}`,
        `Absolute Slot,${clusterInfo.absoluteSlot}`,
      ].join('\n');
      downloadFile(csv, `network-stats-${timestamp}.csv`, 'text/csv');
      break;
    }

    case 'txt': {
      const text = `
Xandeum Network Statistics
Generated: ${new Date().toISOString()}
${'='.repeat(60)}

NETWORK STATISTICS
------------------
Total Nodes: ${stats.totalNodes}
Online Nodes: ${stats.onlineNodes}
Total Storage Committed: ${stats.totalStorageCommitted !== undefined && stats.totalStorageCommitted !== null ? (stats.totalStorageCommitted / (1024 ** 4)).toFixed(2) + ' TB' : 'N/A'}
Total Storage Used: ${stats.totalStorageUsed !== undefined && stats.totalStorageUsed !== null ? (stats.totalStorageUsed / (1024 ** 4)).toFixed(2) + ' TB' : 'N/A'}
Avg Storage Usage: ${stats.avgStorageUsagePercent !== undefined && stats.avgStorageUsagePercent !== null ? stats.avgStorageUsagePercent.toFixed(2) + '%' : 'N/A'}
Average Uptime: ${stats.avgUptimeSeconds !== undefined && stats.avgUptimeSeconds !== null ? stats.avgUptimeSeconds + ' seconds' : 'N/A'}
Average CPU: ${stats.avgCpuPercent !== undefined && stats.avgCpuPercent !== null ? stats.avgCpuPercent.toFixed(2) + '%' : 'N/A'}
Network Version: ${stats.networkVersion}

CLUSTER INFORMATION
------------------
Epoch: ${clusterInfo.epoch}
Slot: ${clusterInfo.slot}
Block Height: ${clusterInfo.blockHeight}
Absolute Slot: ${clusterInfo.absoluteSlot}
      `.trim();
      downloadFile(text, `network-stats-${timestamp}.txt`, 'text/plain');
      break;
    }
  }
}

/**
 * Export filtered/sorted nodes based on current view
 */
export function exportCurrentView(
  nodes: PNode[],
  format: ExportFormat,
  filterInfo?: {
    status?: string;
    searchQuery?: string;
    sortBy?: string;
  }
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `pnodes-filtered-${timestamp}`;

  const metadata = filterInfo ? `
Filter Applied:
${filterInfo.status ? `Status: ${filterInfo.status}` : ''}
${filterInfo.searchQuery ? `Search: ${filterInfo.searchQuery}` : ''}
${filterInfo.sortBy ? `Sorted By: ${filterInfo.sortBy}` : ''}
${'='.repeat(60)}

` : '';

  switch (format) {
    case 'json':
      downloadFile(
        JSON.stringify({ metadata: filterInfo, nodes, exportDate: new Date().toISOString() }, null, 2),
        `${filename}.json`,
        'application/json'
      );
      break;

    case 'csv':
      exportNodesAsCSV(nodes, `${filename}.csv`);
      break;

    case 'txt':
      exportNodesAsText(nodes, `${filename}.txt`);
      break;
  }
}

/**
 * Export individual node details
 */
export function exportNodeDetails(node: PNode, format: ExportFormat = 'json') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const shortKey = node.pubkey.slice(0, 8);

  switch (format) {
    case 'json':
      downloadFile(
        JSON.stringify(node, null, 2),
        `pnode-${shortKey}-${timestamp}.json`,
        'application/json'
      );
      break;

    case 'csv': {
      const csv = Object.entries(node)
        .map(([key, value]) => `${key},${value}`)
        .join('\n');
      downloadFile(csv, `pnode-${shortKey}-${timestamp}.csv`, 'text/csv');
      break;
    }

    case 'txt':
      exportNodesAsText([node], `pnode-${shortKey}-${timestamp}.txt`);
      break;
  }
}
