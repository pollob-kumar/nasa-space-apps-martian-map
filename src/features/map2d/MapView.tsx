import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LAYERS } from '@/config/layers.config';
import { SITES } from '@/config/sites.config';
import { loadGrid } from '@/data/loaders/grid';
import { loadTargets, loadTraverse, loadVectorCollection } from '@/data/loaders/vectors';
import { GridCanvasOverlay } from './GridCanvasOverlay';
import { useApp } from '@/state/store';

/** 2D layered map. Mars uses plain lon/lat (EPSG:4326-style) tiles, NOT web-mercator (ADR-004). */
export function MapView() {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const managed = useRef<L.Layer[]>([]);
  const marker = useRef<L.CircleMarker | null>(null);
  const [hoveredLonLat, setHoveredLonLat] = useState<{ lon: number; lat: number } | null>(null);
  const { siteId, layerState, route, inspectedPoint, routeStart, routeGoal, routePickMode } = useApp();

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { crs: L.CRS.EPSG4326, zoomControl: true, attributionControl: true });
    L.control.scale({ metric: true, imperial: false }).addTo(map.current);
    // One click feeds both the inspector and the active route endpoint.
    map.current.on('click', (e: L.LeafletMouseEvent) => {
      const point = { lon: e.latlng.lng, lat: e.latlng.lat };
      const state = useApp.getState();
      state.inspect(point);
      if (state.routePickMode === 'start') {
        state.setRouteStart(point);
        state.setRoutePickMode(null);
      } else if (state.routePickMode === 'goal') {
        state.setRouteGoal(point);
        state.setRoutePickMode(null);
      }
    });
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
        if (def.id === 'rover-traverse') {
          loadTraverse(def.dataPath).then((points) => {
            if (points?.length) {
              add(L.polyline(points.map((p) => [p.lat, p.lon] as [number, number]), {
                className: 'rover-traverse-line',
                color: 'var(--route)',
                opacity: st.opacity,
                weight: 3,
              }));
            }
          });
        } else if (def.id === 'science-targets') {
          loadTargets(def.dataPath).then((targets) => {
            if (targets?.length) {
              const markers = targets.map((target) =>
                L.circleMarker([target.position.lat, target.position.lon], {
                  className: 'science-target-marker',
                  color: 'var(--science)',
                  fillColor: 'var(--science)',
                  fillOpacity: 0.35,
                  opacity: st.opacity,
                  radius: 6,
                  weight: 2,
                }).bindTooltip(target.name).on('click', () => useApp.getState().selectTarget(target.id)),
              );
              add(L.layerGroup(markers));
            }
          });
        } else if (def.id === 'mineralogy') {
          loadVectorCollection(def.dataPath).then((fc) => {
            if (!fc) return;
            add(L.geoJSON(fc, {
              style: { color: 'var(--ok)', opacity: st.opacity, weight: 2 },
              pointToLayer: (_feature, latlng) =>
                L.circleMarker(latlng, {
                  className: 'mineralogy-marker',
                  color: 'var(--ok)',
                  fillColor: 'var(--ok)',
                  fillOpacity: 0.35,
                  radius: 4,
                  weight: 2,
                }),
            }));
          });
        }
      } else if (def.kind === 'grid' && def.dataPath && (def.id === 'slope' || def.id === 'hazards')) {
        loadGrid(def.dataPath).then((grid) => {
          if (grid) add(new GridCanvasOverlay(grid, def.id === 'slope' ? 'slope' : 'hazard', { opacity: st.opacity }));
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

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const layers: L.Layer[] = [];
    if (routeStart) layers.push(L.circleMarker([routeStart.lat, routeStart.lon], { radius: 7, className: 'route-start-marker' }).addTo(m));
    if (routeGoal) layers.push(L.circleMarker([routeGoal.lat, routeGoal.lon], { radius: 7, className: 'route-goal-marker' }).addTo(m));
    return () => layers.forEach((layer) => layer.remove());
  }, [routeStart, routeGoal]);

  const missingTiles = LAYERS.some((l) => l.kind === 'tile' && !l.tileUrl);
  return (
    <div>
      <div ref={el} style={{ position: 'absolute', inset: 0, background: 'var(--basalt-900)' }} />
      <div className="map-coordinate-readout" aria-live="polite" aria-label="Map cursor coordinates">
        {hoveredLonLat ? `Lon ${hoveredLonLat.lon.toFixed(5)}°E, Lat ${hoveredLonLat.lat.toFixed(5)}°` : 'Move over the map to read coordinates'}
      </div>
      {routePickMode && <div className="notice route-pick-notice">Click the map to set the {routePickMode === 'start' ? 'start' : 'destination'} point.</div>}
      {missingTiles && (
        <div className="notice" style={{ position: 'absolute', top: 8, left: 56, right: 8, zIndex: 1000, inset: 'auto' }}>
          No tile URL configured for some layers. Set VITE_TILE_* in .env.local (see docs/DATA_SOURCES.md, task T-001).
        </div>
      )}
    </div>
  );
}
