import { haversineM } from '@/lib/geo/haversine';
import { lonLatToCell, type Grid } from '@/lib/geo/grid';
import type { FeatureCollection, MultiPolygon, Polygon } from 'geojson';
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
  mineralogy: Record<string, unknown> | null;
  terrainUnit: string | null;
}

export interface SummaryInput {
  point: LonLat;
  grid: Grid | null;
  /** same shape as grid.data, from slopeDegrees(grid); null when no grid */
  slopeDeg: Float32Array | null;
  targets: ScienceTarget[] | null;
  roverPoints: LonLat[] | null;
  mineralogy: FeatureCollection | null;
}

export function isInsideGrid(g: Grid, p: LonLat): boolean {
  const b = g.bbox;
  return p.lon >= b.west && p.lon <= b.east && p.lat >= b.south && p.lat <= b.north;
}

function finiteOrNull(v: number | undefined): number | null {
  return v !== undefined && Number.isFinite(v) ? v : null;
}

function pointOnSegment(point: LonLat, a: readonly number[], b: readonly number[]): boolean {
  const cross = (point.lon - a[0]!) * (b[1]! - a[1]!) - (point.lat - a[1]!) * (b[0]! - a[0]!);
  if (Math.abs(cross) > 1e-10) return false;
  return point.lon >= Math.min(a[0]!, b[0]!) && point.lon <= Math.max(a[0]!, b[0]!) &&
    point.lat >= Math.min(a[1]!, b[1]!) && point.lat <= Math.max(a[1]!, b[1]!);
}

export function pointInPolygon(point: LonLat, rings: readonly (readonly (readonly number[])[])[]): boolean {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i]!;
      const b = ring[j]!;
      if (pointOnSegment(point, a, b)) return true;
      const intersects = (a[1]! > point.lat) !== (b[1]! > point.lat) &&
        point.lon < ((b[0]! - a[0]!) * (point.lat - a[1]!)) / (b[1]! - a[1]!) + a[0]!;
      if (intersects) inside = !inside;
    }
  }
  return inside;
}

function featureContainsPoint(point: LonLat, geometry: Polygon | MultiPolygon): boolean {
  if (geometry.type === 'Polygon') return pointInPolygon(point, geometry.coordinates);
  return geometry.coordinates.some((polygon) => pointInPolygon(point, polygon));
}

function mineralogyAtPoint(point: LonLat, collection: FeatureCollection | null): Record<string, unknown> | null {
  for (const feature of collection?.features ?? []) {
    const geometry = feature.geometry;
    if (geometry?.type !== 'Polygon' && geometry?.type !== 'MultiPolygon') continue;
    if (featureContainsPoint(point, geometry)) {
      return feature.properties && typeof feature.properties === 'object' ? feature.properties : {};
    }
  }
  return null;
}

export function summarizeLocation(inp: SummaryInput): LocationSummary {
  const { point, grid, slopeDeg, targets, roverPoints, mineralogy } = inp;

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

  const mineralogyProperties = mineralogyAtPoint(point, mineralogy);
  const terrainUnitValue = mineralogyProperties?.terrainUnit ?? mineralogyProperties?.terrain_unit;
  const terrainUnit = typeof terrainUnitValue === 'string' ? terrainUnitValue : null;
  return {
    point,
    insideGrid,
    elevationM,
    slopeDeg: slope,
    nearestTarget,
    nearestRoverPointM,
    mineralogy: mineralogyProperties,
    terrainUnit,
  };
}
