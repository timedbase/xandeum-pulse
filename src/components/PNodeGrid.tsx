import { useMemo, useState } from 'react';
import { PNodeCard } from './PNodeCard';
import { AdvancedSearchFilter, type FilterOptions } from './AdvancedSearchFilter';
import { ExportButton } from './ExportButton';
import type { PNode } from '@/types/pnode';

interface PNodeGridProps {
  nodes: PNode[];
}

const defaultFilters: FilterOptions = {
  searchQuery: '',
  statusFilter: 'all',
  regionFilter: 'all',
  minUptime: 0,
  maxUptime: 100,
  minStorage: 0,
  maxStorage: 10000,
  versionFilter: 'all',
  sortBy: 'pubkey',
  sortOrder: 'asc',
  page: 1,
  pageSize: 20,
};

export function PNodeGrid({ nodes }: PNodeGridProps) {
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);

  // Extract unique regions and versions
  const availableRegions = useMemo(() => {
    const regions = new Set(nodes.map(n => n.region).filter(Boolean) as string[]);
    return Array.from(regions).sort();
  }, [nodes]);

  const availableVersions = useMemo(() => {
    const versions = new Set(nodes.map(n => n.version));
    return Array.from(versions).sort();
  }, [nodes]);

  // Filter and sort nodes
  const { filteredNodes, paginatedNodes } = useMemo(() => {
    let result = [...nodes];

    // Apply filters
    result = result.filter((node) => {
      // Status filter
      if (filters.statusFilter !== 'all' && node.status !== filters.statusFilter) {
        return false;
      }

      // Region filter
      if (filters.regionFilter !== 'all' && node.region !== filters.regionFilter) {
        return false;
      }

      // Version filter
      if (filters.versionFilter !== 'all' && node.version !== filters.versionFilter) {
        return false;
      }

      // Uptime filter
      if (node.uptime < filters.minUptime || node.uptime > filters.maxUptime) {
        return false;
      }

      // Storage filter
      if (node.storageCapacity < filters.minStorage || node.storageCapacity > filters.maxStorage) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          node.pubkey.toLowerCase().includes(query) ||
          node.gossip.toLowerCase().includes(query) ||
          node.prpc.toLowerCase().includes(query) ||
          node.region?.toLowerCase().includes(query) ||
          node.version.toLowerCase().includes(query)
        );
      }

      return true;
    });

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'pubkey':
          comparison = a.pubkey.localeCompare(b.pubkey);
          break;
        case 'uptime':
          comparison = a.uptime - b.uptime;
          break;
        case 'credits':
          comparison = a.credits - b.credits;
          break;
        case 'storage':
          comparison = a.storageUsed - b.storageUsed;
          break;
        case 'lastSeen':
          comparison = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime();
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const startIndex = (filters.page - 1) * filters.pageSize;
    const endIndex = startIndex + filters.pageSize;
    const paginated = result.slice(startIndex, endIndex);

    return { filteredNodes: result, paginatedNodes: paginated };
  }, [nodes, filters]);

  const handleFiltersChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">pNodes</h2>
        <ExportButton
          nodes={paginatedNodes}
          filterInfo={{
            status: filters.statusFilter,
            searchQuery: filters.searchQuery,
            sortBy: filters.sortBy,
          }}
        />
      </div>

      <AdvancedSearchFilter
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalResults={filteredNodes.length}
        availableRegions={availableRegions}
        availableVersions={availableVersions}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedNodes.map((node, index) => (
          <PNodeCard key={node.pubkey} node={node} index={index} />
        ))}
      </div>

      {filteredNodes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No pNodes match your search criteria.</p>
        </div>
      )}
    </section>
  );
}
