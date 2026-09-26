import { SITES } from '@/config/sites.config';
import { useTerrainGrid } from '@/hooks/useTerrainGrid';
import { cellToLonLat, lonLatToCell, slopeDegrees } from '@/lib/geo/grid';
import { minutesToHhMm } from '@/lib/units/time';
import { useApp } from '@/state/store';
import { PROFILES } from './costModel';
import { planRoute } from './planner';
import { summarizeRoute } from './routeStats';

function ElevationProfile({ profile }: { profile: ReturnType<typeof summarizeRoute>['profile'] }) {
  if (profile.length < 2) return <div className="notice">No elevation profile data.</div>;

  const width = 320;
  const height = 140;
  const padding = { top: 12, right: 12, bottom: 28, left: 42 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const minElevation = Math.min(...profile.map((point) => point.elevationM));
  const maxElevation = Math.max(...profile.map((point) => point.elevationM));
  const elevationRange = Math.max(1, maxElevation - minElevation);
  const maxDistance = profile[profile.length - 1]!.distanceM;
  const distanceRange = Math.max(1, maxDistance);
  const points = profile
    .map((point) => {
      const x = padding.left + (point.distanceM / distanceRange) * plotWidth;
      const y = padding.top + ((maxElevation - point.elevationM) / elevationRange) * plotHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <figure className="elevation-profile">
      <figcaption>Elevation profile</figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Elevation profile along the planned route"
      >
        <line
          className="elevation-profile-axis"
          x1={padding.left}
          y1={padding.top + plotHeight}
          x2={width - padding.right}
          y2={padding.top + plotHeight}
        />
        <line
          className="elevation-profile-axis"
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotHeight}
        />
        <polyline className="elevation-profile-line" points={points} />
        <text className="elevation-profile-label" x={padding.left} y={height - 8}>
          0 km
        </text>
        <text className="elevation-profile-label" x={width - padding.right - 24} y={height - 8}>
          {(maxDistance / 1000).toFixed(1)} km
        </text>
        <text className="elevation-profile-label" x={2} y={padding.top + 4}>
          {maxElevation.toFixed(0)} m
        </text>
        <text className="elevation-profile-label" x={2} y={padding.top + plotHeight}>
          {minElevation.toFixed(0)} m
        </text>
      </svg>
    </figure>
  );
}

export function RoutePanel() {
  const {
    siteId,
    profile,
    setProfile,
    route,
    setRoute,
    routeStart,
    routeGoal,
    routePickMode,
    setRouteStart,
    setRouteGoal,
    setRoutePickMode,
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
    const out = planRoute({
      elevation: grid,
      slopeDeg: slope,
      hazard,
      science,
      start,
      goal,
      profile: p,
    });
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
      {synthetic && (
        <div className="notice">Using SYNTHETIC terrain - results are for UI development only.</div>
      )}
      <select
        value={profile}
        onChange={(e) => setProfile(e.target.value as typeof profile)}
        aria-label="Route profile"
      >
        {Object.keys(PROFILES).map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>{' '}
      <button
        onClick={() => setRoutePickMode('start')}
        className={routePickMode === 'start' ? 'active' : ''}
      >
        Pick start
      </button>{' '}
      <button
        onClick={() => setRoutePickMode('goal')}
        className={routePickMode === 'goal' ? 'active' : ''}
      >
        Pick destination
      </button>{' '}
      <button onClick={run} disabled={!grid || !routeStart || !routeGoal}>
        Plan route
      </button>
      <div className="data route-points">
        <div>
          Start:{' '}
          {routeStart
            ? `${routeStart.lon.toFixed(4)} E, ${routeStart.lat.toFixed(4)}`
            : 'not selected'}
        </div>
        <div>
          Destination:{' '}
          {routeGoal
            ? `${routeGoal.lon.toFixed(4)} E, ${routeGoal.lat.toFixed(4)}`
            : 'not selected'}
        </div>
      </div>
      {routePickMode && <button onClick={() => setRoutePickMode(null)}>Cancel map picking</button>}
      {(routeStart || routeGoal) && (
        <button
          onClick={() => {
            setRouteStart(null);
            setRouteGoal(null);
            setRoutePickMode(null);
          }}
        >
          Clear points
        </button>
      )}
      {route &&
        (() => {
          const stats = summarizeRoute(route.path, route.elevationsM);
          return (
            <>
              <ul className="data route-stats">
                <li>Distance {(route.distanceM / 1000).toFixed(2)} km</li>
                <li>Walk time {minutesToHhMm(route.estTimeMin)} (assumed speed model)</li>
                <li>Max slope {route.maxSlopeDeg.toFixed(1)} deg</li>
                <li>Average slope {stats.averageSlopeDeg.toFixed(1)} deg</li>
                <li>
                  Elevation +{stats.elevationGainM.toFixed(0)} m / -
                  {stats.elevationLossM.toFixed(0)} m
                </li>
              </ul>
              <ElevationProfile profile={stats.profile} />
            </>
          );
        })()}
    </section>
  );
}
