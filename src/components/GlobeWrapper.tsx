import { Suspense } from 'react';
import { PNode } from '@/types/pnode';
import { LoadingState } from '@/components/LoadingState';
import { MapLibreGlobe } from './MapLibreGlobe';

interface GlobeWrapperProps {
  nodes: PNode[];
}

export function GlobeWrapper({ nodes }: GlobeWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[600px] rounded-lg border border-border/50 bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
          <LoadingState message="Loading Global Map..." size="lg" />
        </div>
      }
    >
      <MapLibreGlobe nodes={nodes} />
    </Suspense>
  );
}
