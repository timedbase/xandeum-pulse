import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileText, Table } from 'lucide-react';
import type { PNode, NetworkStats, ClusterInfo } from '@/types/pnode';
import {
  exportNodesAsJSON,
  exportNodesAsCSV,
  exportNodesAsText,
  exportNetworkStats,
  exportCurrentView,
  type ExportFormat,
} from '@/utils/export';
import { toast } from 'sonner';

interface ExportButtonProps {
  nodes?: PNode[];
  stats?: NetworkStats;
  clusterInfo?: ClusterInfo;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  filterInfo?: {
    status?: string;
    searchQuery?: string;
    sortBy?: string;
  };
}

export function ExportButton({
  nodes,
  stats,
  clusterInfo,
  variant = 'outline',
  size = 'sm',
  filterInfo,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat, type: 'nodes' | 'stats') => {
    setIsExporting(true);

    try {
      if (type === 'nodes' && nodes) {
        if (filterInfo) {
          exportCurrentView(nodes, format, filterInfo);
        } else {
          switch (format) {
            case 'json':
              exportNodesAsJSON(nodes);
              break;
            case 'csv':
              exportNodesAsCSV(nodes);
              break;
            case 'txt':
              exportNodesAsText(nodes);
              break;
          }
        }
        toast.success('Export Complete', {
          description: `pNode data exported as ${format.toUpperCase()}`,
        });
      } else if (type === 'stats' && stats && clusterInfo) {
        exportNetworkStats(stats, clusterInfo, format);
        toast.success('Export Complete', {
          description: `Network statistics exported as ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      toast.error('Export Failed', {
        description: error instanceof Error ? error.message : 'Failed to export data',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const hasNodes = nodes && nodes.length > 0;
  const hasStats = stats && clusterInfo;

  if (!hasNodes && !hasStats) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {hasNodes && (
          <>
            <DropdownMenuLabel>Export pNode Data</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleExport('json', 'nodes')}>
              <FileJson className="h-4 w-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv', 'nodes')}>
              <Table className="h-4 w-4 mr-2" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('txt', 'nodes')}>
              <FileText className="h-4 w-4 mr-2" />
              Export as Text
            </DropdownMenuItem>
          </>
        )}

        {hasNodes && hasStats && <DropdownMenuSeparator />}

        {hasStats && (
          <>
            <DropdownMenuLabel>Export Network Stats</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleExport('json', 'stats')}>
              <FileJson className="h-4 w-4 mr-2" />
              Stats as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('csv', 'stats')}>
              <Table className="h-4 w-4 mr-2" />
              Stats as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('txt', 'stats')}>
              <FileText className="h-4 w-4 mr-2" />
              Stats as Text
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
