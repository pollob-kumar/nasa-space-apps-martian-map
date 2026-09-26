import { Suspense, lazy } from 'react';
import { SITES } from '@/config/sites.config';
import { ConditionsPanel } from '@/features/conditions/ConditionsPanel';
import { InspectorPanel } from '@/features/inspector/InspectorPanel';
import { LayerPanel } from '@/features/layers/LayerPanel';
import { MapView } from '@/features/map2d/MapView';
import { MarswalkPanel } from '@/features/marswalk/MarswalkPanel';
import { RoutePanel } from '@/features/routing/RoutePanel';
import { ScienceTargetPanel } from '@/features/science/ScienceTargetPanel';
import { useApp } from '@/state/store';
import { useSiteVectors } from '@/hooks/useSiteVectors';

// 3D is code-split so the 2D planning view loads fast (three.js is large).
const TerrainScene = lazy(() => import('@/features/view3d/TerrainScene').then((m) => ({ default: m.TerrainScene })));

export function App() {
  const { siteId, setSite, view, setView } = useApp();
  const { targets } = useSiteVectors();
  return (
    <div className="shell">
      <header className="topbar">
        <h1>Marswalk Planner</h1>
        <select value={siteId} onChange={(e) => setSite(e.target.value)} aria-label="Site">
          {SITES.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <span>
          <button className={view === '2d' ? 'active' : ''} onClick={() => setView('2d')}>2D map</button>{' '}
          <button className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}>3D view</button>
        </span>
      </header>
      <aside className="panel"><LayerPanel /></aside>
      <main className="stage">{view === '2d' ? <MapView /> : <Suspense fallback={<div className="notice">Loading 3D view...</div>}><TerrainScene /></Suspense>}</main>
      <aside className="panel">
        <ConditionsPanel />
        <RoutePanel />
        <ScienceTargetPanel targets={targets ?? []} />
        <InspectorPanel />
        <MarswalkPanel />
      </aside>
    </div>
  );
}
