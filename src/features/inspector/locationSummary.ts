import { haversineM } from '@/lib/geo/haversine';
import { lonLatToCell, type Grid } from '@/lib/geo/grid';
import type { LonLat, ScienceTarget } from '@/types';

/**
 * Integrated point summary (FR-06): everything the loaded data can say about ONE clicked point.
 * Pure function - no React, no fetch. Idea borrowed from the FastAPI toolkit's /locations/{lat}/{lon}/summary,
 * but computed client-side from the same static data (ADR-014, ADR-015).
 *
 * Honesty rules: a field is null when its data is missing, never a guess. Longitudes are compared in the
 * grid's own convention (planetocentric, east-positive; ADR-006).
 */

export interface NearestTarget {
  target: ScienceTarget;
  /** great-circle distance, metres */
  distanceM: number;
}

export interface LocationSummary {
  point: LonLat;
  /** false when the point lies outside the DEM grid (or no grid is loaded): elevation and slope are unknown there */
  insideGrid: boolean;
  /** metres relative to the source DEM datum; null when unknown or the cell is NaN (= no data) */
  elevationM: number | null;
  /** degrees, derived from the DEM by central differences; null when unknown */
  slopeDeg: number | null;
  nearestTarget: NearestTarget | null;
  /** metres to the nearest recorded traverse point (vertex), NOT to the line between vertices */
  nearestRoverPointM: number | null;
}

export interface SummaryInput {
  point: LonLat;
  grid: Grid | null;
  /** same shape as grid.data, from slopeDegrees(grid); null when no grid */
  slopeDeg: Float32Array | null;
  targets: ScienceTarget[] | null;
  roverPoints: LonLat[] | null;
}

export function isInsideGrid(g: Grid, p: LonLat): boolean {
  const b = g.bbox;
  return p.lon >= b.west && p.lon <= b.east && p.lat >= b.south && p.lat <= b.north;
}

function finiteOrNull(v: number | undefined): number | null {
  return v !== undefined && Number.isFinite(v) ? v : null;
}

export function summarizeLocation(inp: SummaryInput): LocationSummary {
  const { point, grid, slopeDeg, targets, roverPoints } = inp;

  let insideGrid = false;
  let elevationM: number | null = null;
  let slope: number | null = null;
  if (grid && isInsideGrid(grid, point)) {
    insideGrid = true;
    const { x, y } = lonLatToCell(grid, point);
    const i = y * grid.width + x;
    elevationM = finiteOrNull(grid.data[i]);
    slope = finiteOrNull(slopeDeg?.[i]);
  }

  let nearestTarget: NearestTarget | null = null;
  for (const t of targets ?? []) {
    const d = haversineM(point, t.position);
    if (nearestTarget === null || d < nearestTarget.distanceM) nearestTarget = { target: t, distanceM: d };
  }

  let nearestRoverPointM: number | null = null;
  for (const r of roverPoints ?? []) {
    const d = haversineM(point, r);
    if (nearestRoverPointM === null || d < nearestRoverPointM) nearestRoverPointM = d;
  }

  return { point, insideGrid, elevationM, slopeDeg: slope, nearestTarget, nearestRoverPointM };
}
