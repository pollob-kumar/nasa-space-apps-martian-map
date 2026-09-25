import { useEffect, useRef } from 'react';
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
  const { siteId, layerState, route, inspectedPoint } = useApp();

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { crs: L.CRS.EPSG4326, zoomControl: true, attributionControl: true });
    L.control.scale({ metric: true, imperial: false }).addTo(map.current);
    // FR-06: a click selects the point for the inspector. getState() avoids a stale closure in this run-once effect.
    map.current.on('click', (e: L.LeafletMouseEvent) => useApp.getState().inspect({ lon: e.latlng.lng, lat: e.latlng.lat }));
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
        loadGeoJson(def.dataPath).then((fc) => fc && add(L.geoJSON(fc, { style: { opacity: st.opacity } })));
      }
    }
    if (route) add(L.polyline(route.path.map((p) => [p.lat, p.lon] as [number, number]), { color: '#5cc8d7', weight: 4 }));
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
      {missingTiles && (
        <div className="notice" style={{ position: 'absolute', top: 8, left: 56, right: 8, zIndex: 1000, inset: 'auto' }}>
          No tile URL configured for some layers. Set VITE_TILE_* in .env.local (see docs/DATA_SOURCES.md, task T-001).
        </div>
      )}
    </div>
  );
}
