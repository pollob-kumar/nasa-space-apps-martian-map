import { SITES } from '@/config/sites.config';
import { useTerrainGrid } from '@/hooks/useTerrainGrid';
import { cellToLonLat, lonLatToCell, slopeDegrees } from '@/lib/geo/grid';
import { minutesToHhMm } from '@/lib/units/time';
import { useApp } from '@/state/store';
import { PROFILES } from './costModel';
import { planRoute } from './planner';

export function RoutePanel() {
  const {
    siteId, profile, setProfile, route, setRoute, routeStart, routeGoal, routePickMode,
    setRouteStart, setRouteGoal, setRoutePickMode,
  } = useApp();
  const { grid, synthetic } = useTerrainGrid(siteId);

  const run = () => {
    if (!grid) return;
    const site = SITES.find((s) => s.id === siteId);
    if (!site) return;
    const slope = slopeDegrees(grid);
    const p = PROFILES[profile];
    // TODO(T-040): hazard from real derived layer; science from real targets. Placeholder = slope-based hazard.
    const hazard = slope.map((s) => Math.min(1, s / p.maxSlopeDeg));
    const science = new Float32Array(grid.data.length);
    if (!routeStart || !routeGoal) return;
    const start = lonLatToCell(grid, routeStart);
    const goal = lonLatToCell(grid, routeGoal);
    const out = planRoute({ elevation: grid, slopeDeg: slope, hazard, science, start, goal, profile: p });
    if (!out) return setRoute(null);
    setRoute({
      path: out.cells.map((c) => cellToLonLat(grid, c.x, c.y)),
      elevationsM: out.cells.map((c) => grid.data[c.y * grid.width + c.x]!),
      distanceM: out.distanceM,
      maxSlopeDeg: out.maxSlopeDeg,
      estTimeMin: out.timeMin,
      profile,
    });
  };

  return (
    <section aria-label="Route">
      <h2>Route</h2>
      {synthetic && <div className="notice">Using SYNTHETIC terrain - results are for UI development only.</div>}
      <select value={profile} onChange={(e) => setProfile(e.target.value as typeof profile)} aria-label="Route profile">
        {Object.keys(PROFILES).map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>{' '}
      <button onClick={() => setRoutePickMode('start')} className={routePickMode === 'start' ? 'active' : ''}>Pick start</button>{' '}
      <button onClick={() => setRoutePickMode('goal')} className={routePickMode === 'goal' ? 'active' : ''}>Pick destination</button>{' '}
      <button onClick={run} disabled={!grid || !routeStart || !routeGoal}>Plan route</button>
      <div className="data route-points">
        <div>Start: {routeStart ? `${routeStart.lon.toFixed(4)} E, ${routeStart.lat.toFixed(4)}` : 'not selected'}</div>
        <div>Destination: {routeGoal ? `${routeGoal.lon.toFixed(4)} E, ${routeGoal.lat.toFixed(4)}` : 'not selected'}</div>
      </div>
      {routePickMode && <button onClick={() => setRoutePickMode(null)}>Cancel map picking</button>}
      {(routeStart || routeGoal) && <button onClick={() => { setRouteStart(null); setRouteGoal(null); setRoutePickMode(null); }}>Clear points</button>}
      {route && (
        <ul className="data">
          <li>Distance {(route.distanceM / 1000).toFixed(2)} km</li>
          <li>Max slope {route.maxSlopeDeg.toFixed(1)} deg</li>
          <li>Walk time {minutesToHhMm(route.estTimeMin)} (assumed speed model)</li>
        </ul>
      )}
    </section>
  );
}
