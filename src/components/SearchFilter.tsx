import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  totalResults: number;
}

export function SearchFilter({ 
  searchQuery, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange,
  totalResults 
}: SearchFilterProps) {
  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'online', label: 'Online' },
    { value: 'syncing', label: 'Syncing' },
    { value: 'offline', label: 'Offline' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by pubkey, IP, or region..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card/50 border-border/50 focus:border-primary/50"
          />
        </div>
        
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1.5">
            {statuses.map((status) => (
              <Button
                key={status.value}
                variant={statusFilter === status.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onStatusFilterChange(status.value)}
                className="text-xs"
              >
                {status.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SlidersHorizontal className="w-4 h-4" />
        <span>Showing <strong className="text-foreground">{totalResults}</strong> pNodes</span>
        {searchQuery && (
          <Badge variant="ghost" className="ml-2">
            Query: "{searchQuery}"
          </Badge>
        )}
      </div>
    </div>
  );
}
