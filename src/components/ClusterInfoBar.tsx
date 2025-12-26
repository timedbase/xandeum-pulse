import type { ClusterInfo } from '@/types/pnode';

interface ClusterInfoBarProps {
  info: ClusterInfo;
}

export function ClusterInfoBar({ info }: ClusterInfoBarProps) {
  const stats = [
    { label: 'Epoch', value: info.epoch },
    { label: 'Slot', value: info.slot.toLocaleString() },
    { label: 'Block Height', value: info.blockHeight.toLocaleString() },
    { label: 'Absolute Slot', value: info.absoluteSlot.toLocaleString() },
  ];

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{stat.label}:</span>
            <span className="font-mono text-sm font-medium text-foreground">{stat.value}</span>
            {index < stats.length - 1 && (
              <span className="hidden md:block text-border ml-6">|</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}