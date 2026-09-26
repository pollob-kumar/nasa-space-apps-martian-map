import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LAYERS } from '@/config/layers.config';
import { SITES } from '@/config/sites.config';
import { loadGeoJson } from '@/data/loaders/geojson';
import { useApp } from '@/state/store';

/** 2D layered map. Mars uses plain lon/lat (EPSG:4326-style) tiles, NOT web-mercator (ADR-004). */
export function MapView() {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const managed = useRef<L.Layer[]>([]);
  const marker = useRef<L.CircleMarker | null>(null);
  const [hoveredLonLat, setHoveredLonLat] = useState<{ lon: number; lat: number } | null>(null);
  const { siteId, layerState, route, inspectedPoint } = useApp();

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { crs: L.CRS.EPSG4326, zoomControl: true, attributionControl: true });
    L.control.scale({ metric: true, imperial: false }).addTo(map.current);
    // FR-06: a click selects the point for the inspector. getState() avoids a stale closure in this run-once effect.
    map.current.on('click', (e: L.LeafletMouseEvent) => useApp.getState().inspect({ lon: e.latlng.lng, lat: e.latlng.lat }));
    map.current.on('mousemove', (e: L.LeafletMouseEvent) => setHoveredLonLat({ lon: e.latlng.lng, lat: e.latlng.lat }));
    map.current.on('mouseout', () => setHoveredLonLat(null));
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    const site = SITES.find((s) => s.id === siteId);
    if (m && site) m.setView([site.center.lat, site.center.lon], 9);
  }, [siteId]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    let alive = true;
    managed.current.forEach((l) => l.remove());
    managed.current = [];
    const add = (l: L.Layer) => {
      if (!alive) return;
      l.addTo(m);
      managed.current.push(l);
    };
    for (const def of LAYERS) {
      const st = layerState[def.id];
      if (!st?.visible) continue;
      if (def.kind === 'tile' && def.tileUrl) {
        add(L.tileLayer(def.tileUrl, { tms: def.tms ?? false, opacity: st.opacity, attribution: `${def.provenance.mission} ${def.provenance.instrument}` }));
      } else if (def.kind === 'geojson' && def.dataPath) {
        loadGeoJson(def.dataPath).then((fc) => {
          if (!fc) return;
          const color = def.id === 'rover-traverse' ? 'var(--route)' : 'var(--science)';
          add(L.geoJSON(fc, {
            style: { color, opacity: st.opacity, weight: def.id === 'rover-traverse' ? 3 : 1 },
            pointToLayer: (_feature, latlng) =>
              L.circleMarker(latlng, {
                className: def.id === 'science-targets' ? 'science-target-marker' : 'mineralogy-marker',
                color,
                fillColor: color,
                fillOpacity: 0.35,
                radius: def.id === 'science-targets' ? 6 : 4,
                weight: 2,
              }),
          }));
        });
      }
    }
    if (route) add(L.polyline(route.path.map((p) => [p.lat, p.lon] as [number, number]), { color: 'var(--route)', weight: 4 }));
    return () => {
      alive = false;
    };
  }, [layerState, route]);

  // Marker for the inspected point. Styled via CSS class (.inspect-marker) so colours stay in tokens.css.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    marker.current?.remove();
    marker.current = null;
    if (inspectedPoint) {
      marker.current = L.circleMarker([inspectedPoint.lat, inspectedPoint.lon], { radius: 6, weight: 2, fillOpacity: 0.25, className: 'inspect-marker' }).addTo(m);
    }
  }, [inspectedPoint]);

  const missingTiles = LAYERS.some((l) => l.kind === 'tile' && !l.tileUrl);
  return (
    <div>
      <div ref={el} style={{ position: 'absolute', inset: 0, background: 'var(--basalt-900)' }} />
      <div className="map-coordinate-readout" aria-live="polite" aria-label="Map cursor coordinates">
        {hoveredLonLat ? `Lon ${hoveredLonLat.lon.toFixed(5)}°E, Lat ${hoveredLonLat.lat.toFixed(5)}°` : 'Move over the map to read coordinates'}
      </div>
      {missingTiles && (
        <div className="notice" style={{ position: 'absolute', top: 8, left: 56, right: 8, zIndex: 1000, inset: 'auto' }}>
          No tile URL configured for some layers. Set VITE_TILE_* in .env.local (see docs/DATA_SOURCES.md, task T-001).
        </div>
      )}
    </div>
  );
}
