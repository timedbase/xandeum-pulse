import { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import { PNode } from '@/types/pnode';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/theme-provider';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreGlobeProps {
  nodes: PNode[];
}

// Regional coordinates (latitude, longitude)
const REGIONS = {
  'us-east': { lat: 40.7128, lon: -74.006, name: 'US-East', color: '#3b82f6' },
  'us-west': { lat: 37.7749, lon: -122.4194, name: 'US-West', color: '#8b5cf6' },
  'eu-central': { lat: 50.1109, lon: 8.6821, name: 'EU-Central', color: '#10b981' },
  'eu-west': { lat: 51.5074, lon: -0.1278, name: 'EU-West', color: '#14b8a6' },
  'asia-pacific': { lat: 35.6762, lon: 139.6503, name: 'Asia-Pacific', color: '#f59e0b' },
  'south-america': { lat: -23.5505, lon: -46.6333, name: 'S. America', color: '#ec4899' },
  'africa': { lat: -1.2921, lon: 36.8219, name: 'Africa', color: '#ef4444' },
  'oceania': { lat: -33.8688, lon: 151.2093, name: 'Oceania', color: '#06b6d4' },
};

export function MapLibreGlobe({ nodes }: MapLibreGlobeProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const { theme } = useTheme();
  const [popupInfo, setPopupInfo] = useState<{
    region: string;
    stats: { total: number; online: number; storage: number; uptime: number };
  } | null>(null);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Calculate regional statistics (memoized to prevent recreation on every render)
  const regionalStats = useMemo(() => {
    return nodes.reduce((acc, node) => {
      const region = node.region?.toLowerCase() || 'unknown';
      if (!acc[region]) {
        acc[region] = { total: 0, online: 0, storage: 0, uptime: 0 };
      }
      acc[region].total++;
      if (node.status === 'online') acc[region].online++;
      acc[region].storage += (node.storageCommitted || 0) / (1024 ** 3); // Convert to GB
      acc[region].uptime += node.uptimeSeconds ? Math.min(100, (node.uptimeSeconds / (30 * 24 * 60 * 60)) * 100) : 0;
      return acc;
    }, {} as Record<string, { total: number; online: number; storage: number; uptime: number }>);
  }, [nodes]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Clean up existing map if it exists
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    console.log('[MapLibreGlobe] Initializing map with', nodes.length, 'nodes');

    const mapStyle = isDark ? {
      version: 8,
      sources: {
        'carto-tiles': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap, © CartoDB'
        }
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': 'hsl(220, 16%, 8%)'
          }
        },
        {
          id: 'ocean',
          type: 'background',
          paint: {
            'background-color': 'hsl(220, 18%, 10%)'
          }
        },
        {
          id: 'map-tiles',
          type: 'raster',
          source: 'carto-tiles',
          paint: {
            'raster-opacity': 0.5,
            'raster-brightness-min': 0.1,
            'raster-brightness-max': 0.5,
            'raster-contrast': -0.2,
            'raster-saturation': -0.3,
            'raster-hue-rotate': 15
          }
        }
      ],
      projection: { type: 'globe' },
      fog: {
        color: 'hsl(172, 66%, 60%)',
        'high-color': 'hsl(172, 66%, 50%)',
        'horizon-blend': 0.03,
        'space-color': 'hsl(220, 16%, 6%)',
        'star-intensity': 0.4
      }
    } : {
      version: 8,
      sources: {
        'carto-tiles': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap, © CartoDB'
        }
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': '#f0f0f5'
          }
        },
        {
          id: 'map-tiles',
          type: 'raster',
          source: 'carto-tiles',
          paint: {
            'raster-opacity': 1
          }
        }
      ],
      projection: { type: 'globe' },
      fog: {
        color: 'hsl(172, 66%, 70%)',
        'high-color': 'hsl(172, 66%, 60%)',
        'horizon-blend': 0.02,
        'space-color': '#e8e8f0',
        'star-intensity': 0.1
      }
    };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle as any,
      center: [0, 20],
      zoom: 2.5,
      pitch: 0,
      bearing: 0,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;

      console.log('[MapLibreGlobe] Map loaded, adding markers for regions:', Object.keys(regionalStats));
      console.log('[MapLibreGlobe] Regional stats:', regionalStats);

      // Add markers for each region
      Object.entries(regionalStats).forEach(([region, stats]) => {
        const regionData = REGIONS[region as keyof typeof REGIONS];

        if (!regionData) {
          console.warn('[MapLibreGlobe] No region data found for:', region);
          return;
        }

        if (!map.current) return;

        const size = Math.max(16, Math.log(stats.total + 1) * 3 + 12); // Much smaller markers

        // Create marker element with improved styling for 3D globe
        const el = document.createElement('div');
        el.className = 'regional-marker';
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.backgroundColor = regionData.color;
        el.style.borderRadius = '50%';
        el.style.border = '1.5px solid white';
        el.style.boxShadow = `0 0 15px ${regionData.color}, 0 0 5px rgba(255,255,255,0.4)`;
        el.style.cursor = 'pointer';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = 'white';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '9px';
        el.style.textShadow = '0 0 2px rgba(0,0,0,1)';
        el.style.transition = 'transform 0.2s, box-shadow 0.2s';
        el.textContent = stats.total.toString();

        // Hover effect
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.5)';
          el.style.boxShadow = `0 0 25px ${regionData.color}, 0 0 12px rgba(255,255,255,0.6)`;
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = `0 0 15px ${regionData.color}, 0 0 5px rgba(255,255,255,0.4)`;
        });

        el.addEventListener('click', () => {
          setPopupInfo({ region: regionData.name, stats });
        });

        console.log('[MapLibreGlobe] Adding marker for', regionData.name, 'at', regionData.lat, regionData.lon);

        new maplibregl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([regionData.lon, regionData.lat])
          .addTo(map.current!);
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [nodes, isDark]);

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border relative bg-card">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Popup */}
      {popupInfo && (
        <div className="absolute top-4 right-4 z-10">
          <Card className="p-3 bg-background/95 backdrop-blur border-primary/20 shadow-xl min-w-[200px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">{popupInfo.region}</h3>
                <Badge variant={popupInfo.stats.online > 0 ? "default" : "secondary"} className="text-xs">
                  {popupInfo.stats.online}/{popupInfo.stats.total}
                </Badge>
                <button onClick={() => setPopupInfo(null)} className="ml-2 text-muted-foreground hover:text-foreground">
                  ×
                </button>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Nodes:</span>
                  <span className="font-medium">{popupInfo.stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Online:</span>
                  <span className="font-medium text-green-500">{popupInfo.stats.online}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage:</span>
                  <span className="font-medium">
                    {popupInfo.stats.storage !== undefined && popupInfo.stats.storage !== null
                      ? `${popupInfo.stats.storage.toFixed(1)} GB`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Uptime:</span>
                  <span className="font-medium">
                    {popupInfo.stats.uptime !== undefined && popupInfo.stats.uptime !== null &&
                     popupInfo.stats.total > 0
                      ? `${(popupInfo.stats.uptime / popupInfo.stats.total).toFixed(1)}%`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur p-3 rounded-lg border border-border/50 space-y-2 max-w-xs z-10">
        <h4 className="text-xs font-semibold text-muted-foreground">Global Regions</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(REGIONS).map(([key, data]) => {
            const stats = regionalStats[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                <span className="flex-1">{data.name}</span>
                {stats && <span className="text-muted-foreground">({stats.total})</span>}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
          Click markers • Drag to pan • Scroll to zoom
        </p>
      </div>
    </div>
  );
}
