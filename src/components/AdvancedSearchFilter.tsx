import { useState } from 'react';
import { Search, Filter, SlidersHorizontal, X, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export interface FilterOptions {
  searchQuery: string;
  statusFilter: string;
  regionFilter: string;
  minUptime: number;
  maxUptime: number;
  minStorage: number;
  maxStorage: number;
  versionFilter: string;
  sortBy: 'pubkey' | 'uptime' | 'credits' | 'storage' | 'lastSeen';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

interface AdvancedSearchFilterProps {
  filters: FilterOptions;
  onFiltersChange: (filters: Partial<FilterOptions>) => void;
  totalResults: number;
  availableRegions: string[];
  availableVersions: string[];
}

export function AdvancedSearchFilter({
  filters,
  onFiltersChange,
  totalResults,
  availableRegions,
  availableVersions,
}: AdvancedSearchFilterProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'online', label: 'Online' },
    { value: 'syncing', label: 'Syncing' },
    { value: 'offline', label: 'Offline' },
  ];

  const sortOptions = [
    { value: 'pubkey', label: 'Public Key' },
    { value: 'uptime', label: 'Uptime' },
    { value: 'credits', label: 'Credits' },
    { value: 'storage', label: 'Storage' },
    { value: 'lastSeen', label: 'Last Seen' },
  ];

  const pageSizeOptions = [10, 20, 50, 100];

  const hasActiveFilters =
    filters.searchQuery ||
    filters.statusFilter !== 'all' ||
    filters.regionFilter !== 'all' ||
    filters.minUptime > 0 ||
    filters.maxUptime < 100 ||
    filters.versionFilter !== 'all';

  const clearFilters = () => {
    onFiltersChange({
      searchQuery: '',
      statusFilter: 'all',
      regionFilter: 'all',
      minUptime: 0,
      maxUptime: 100,
      minStorage: 0,
      maxStorage: 10000,
      versionFilter: 'all',
    });
  };

  const totalPages = Math.ceil(totalResults / filters.pageSize);

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (filters.page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (filters.page >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        pages.push(filters.page - 1);
        pages.push(filters.page);
        pages.push(filters.page + 1);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onFiltersChange({ page: Math.max(1, filters.page - 1) })}
              className={filters.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {pages.map((page, idx) => (
            <PaginationItem key={idx}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onFiltersChange({ page })}
                  isActive={page === filters.page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onFiltersChange({ page: Math.min(totalPages, filters.page + 1) })}
              className={filters.page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {/* Search and Quick Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by pubkey, IP, or region..."
              value={filters.searchQuery}
              onChange={(e) => onFiltersChange({ searchQuery: e.target.value, page: 1 })}
              className="pl-10 bg-card/50 border-border/50 focus:border-primary/50"
            />
            {filters.searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFiltersChange({ searchQuery: '', page: 1 })}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Advanced Filters Button */}
          <Button
            variant="outline"
            size="default"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Advanced
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {statuses.map((status) => (
            <Button
              key={status.value}
              variant={filters.statusFilter === status.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onFiltersChange({ statusFilter: status.value, page: 1 })}
              className="text-xs"
            >
              {status.label}
            </Button>
          ))}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Region Filter */}
              <div className="space-y-2">
                <Label>Region</Label>
                <Select
                  value={filters.regionFilter}
                  onValueChange={(value) => onFiltersChange({ regionFilter: value, page: 1 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {availableRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Version Filter */}
              <div className="space-y-2">
                <Label>Version</Label>
                <Select
                  value={filters.versionFilter}
                  onValueChange={(value) => onFiltersChange({ versionFilter: value, page: 1 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Versions</SelectItem>
                    {availableVersions.map((version) => (
                      <SelectItem key={version} value={version}>
                        {version}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="flex gap-2">
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: any) => onFiltersChange({ sortBy: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onFiltersChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Uptime Range */}
            <div className="space-y-2">
              <Label>Uptime: {filters.minUptime}% - {filters.maxUptime}%</Label>
              <div className="px-2">
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[filters.minUptime, filters.maxUptime]}
                  onValueChange={([min, max]) => onFiltersChange({ minUptime: min, maxUptime: max, page: 1 })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results and Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{Math.min(totalResults, filters.pageSize)}</strong> of{' '}
              <strong className="text-foreground">{totalResults}</strong> pNodes
            </span>
            {hasActiveFilters && (
              <Badge variant="secondary">Filtered</Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Label htmlFor="pageSize" className="text-muted-foreground">Per page:</Label>
              <Select
                value={filters.pageSize.toString()}
                onValueChange={(value) => onFiltersChange({ pageSize: parseInt(value), page: 1 })}
              >
                <SelectTrigger id="pageSize" className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
}
