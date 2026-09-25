import { SITES } from '@/config/sites.config';
import { useTerrainGrid } from '@/hooks/useTerrainGrid';
import { cellToLonLat, slopeDegrees } from '@/lib/geo/grid';
import { minutesToHhMm } from '@/lib/units/time';
import { useApp } from '@/state/store';
import { PROFILES } from './costModel';
import { planRoute } from './planner';

export function RoutePanel() {
  const { siteId, profile, setProfile, route, setRoute } = useApp();
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
    const start = { x: 2, y: grid.height - 3 };
    const goal = { x: grid.width - 3, y: 2 };
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
      <button onClick={run} disabled={!grid}>Plan route</button>
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
