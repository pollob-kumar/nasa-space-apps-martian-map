import { useMemo } from 'react';
import { ProvenanceBadge } from '@/features/provenance/ProvenanceBadge';
import { useSiteVectors } from '@/hooks/useSiteVectors';
import { useTerrainGrid } from '@/hooks/useTerrainGrid';
import { slopeDegrees } from '@/lib/geo/grid';
import { useApp } from '@/state/store';
import { summarizeLocation } from './locationSummary';

const fmtDist = (m: number) => (m < 1000 ? `${m.toFixed(0)} m` : `${(m / 1000).toFixed(2)} km`);

/** Integrated view (FR-06): click any point on the 2D map -> all loaded layers' answers for it in one place. */
export function InspectorPanel() {
  const siteId = useApp((s) => s.siteId);
  const point = useApp((s) => s.inspectedPoint);
  const { grid, synthetic } = useTerrainGrid(siteId);
  const { targets, roverPoints } = useSiteVectors();
  const slope = useMemo(() => (grid ? slopeDegrees(grid) : null), [grid]);
  const summary = useMemo(
    () => (point ? summarizeLocation({ point, grid, slopeDeg: slope, targets, roverPoints }) : null),
    [point, grid, slope, targets, roverPoints],
  );

  if (!point || !summary) {
    return (
      <section aria-label="Selected point">
        <h2>Selected point</h2>
        <div className="notice">Click the 2D map to see elevation, slope, the nearest science target and rover data for that point.</div>
      </section>
    );
  }

  const { nearestTarget } = summary;
  return (
    <section aria-label="Selected point">
      <h2>Selected point</h2>
      <p className="data">
        lat {point.lat.toFixed(4)}, lon {point.lon.toFixed(4)} (east-positive)
      </p>

      {!summary.insideGrid ? (
        <div className="notice">Outside the loaded terrain grid: elevation and slope are unknown here.</div>
      ) : (
        <>
          {synthetic ? (
            <div className="notice">
              <span className="badge warn">SYNTHETIC</span> Terrain below is placeholder data, not Mars.
            </div>
          ) : (
            <div className="notice">
              DEM provenance is stored in dem.json; showing it here is still to do (docs/TODO.md T-024). Slope is derived in the browser from that DEM.
            </div>
          )}
          <ul className="data">
            <li>Elevation {summary.elevationM === null ? 'no data' : `${summary.elevationM.toFixed(1)} m`}</li>
            <li>Slope {summary.slopeDeg === null ? 'no data' : `${summary.slopeDeg.toFixed(1)} deg`}</li>
          </ul>
        </>
      )}

      <h2>Nearby</h2>
      {targets === null ? (
        <div className="notice">Science targets: no data file loaded.</div>
      ) : !nearestTarget ? (
        <div className="notice">Science targets: the data file contains no valid targets.</div>
      ) : (
        <>
          <p>
            <strong>{nearestTarget.target.name}</strong> - {fmtDist(nearestTarget.distanceM)} away
          </p>
          <p>{nearestTarget.target.rationale}</p>
          {nearestTarget.target.provenance.map((p) => (
            <ProvenanceBadge key={p.product} p={p} />
          ))}
        </>
      )}

      {roverPoints === null ? (
        <div className="notice">Rover traverse: no data file loaded.</div>
      ) : summary.nearestRoverPointM === null ? (
        <div className="notice">Rover traverse: the data file contains no positions.</div>
      ) : (
        <p className="data">Nearest recorded traverse point {fmtDist(summary.nearestRoverPointM)}</p>
      )}

      <div className="notice">Mineralogy and terrain unit: not looked up by point yet (docs/TODO.md T-024).</div>
    </section>
  );
}
