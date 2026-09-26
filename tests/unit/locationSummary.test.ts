import { describe, expect, it } from 'vitest';
import { isInsideGrid, pointInPolygon, summarizeLocation } from '@/features/inspector/locationSummary';
import { haversineM } from '@/lib/geo/haversine';
import { slopeDegrees, type Grid } from '@/lib/geo/grid';
import type { Provenance, ScienceTarget } from '@/types';

// TEST FIXTURES ONLY (synthetic on purpose; never shipped as app data).
const W = 10;
const grid = (): Grid => {
  const data = new Float32Array(W * W);
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) data[y * W + x] = 100 + x * 10; // rises to the east
  return { width: W, height: W, bbox: { west: 10, east: 11, south: 20, north: 21 }, data };
};
const prov: Provenance = { mission: 'M2020', instrument: 'test', product: 'test', sourceUrl: 'x', processed: false, synthetic: true, verified: false };
const target = (id: string, lon: number, lat: number): ScienceTarget => ({
  id, name: id, position: { lon, lat }, kind: 'other', scienceValue: 0.5, rationale: 'test', provenance: [prov],
});

describe('summarizeLocation', () => {
  it('reads elevation and slope from the cell under the point', () => {
    const g = grid();
    const s = summarizeLocation({ point: { lon: 10.55, lat: 20.5 }, grid: g, slopeDeg: slopeDegrees(g), targets: null, roverPoints: null, mineralogy: null });
    expect(s.insideGrid).toBe(true);
    expect(s.elevationM).toBe(150); // x = floor(0.55 * 10) = 5 -> 100 + 50
    expect(s.slopeDeg).not.toBeNull();
    expect(s.slopeDeg!).toBeGreaterThan(0);
  });

  it('returns no elevation/slope outside the grid instead of clamping to the edge', () => {
    const g = grid();
    const s = summarizeLocation({ point: { lon: 12, lat: 20.5 }, grid: g, slopeDeg: slopeDegrees(g), targets: null, roverPoints: null, mineralogy: null });
    expect(s.insideGrid).toBe(false);
    expect(s.elevationM).toBeNull();
    expect(s.slopeDeg).toBeNull();
  });

  it('treats a NaN cell as no data', () => {
    const g = grid();
    g.data[5 * W + 5] = NaN;
    const s = summarizeLocation({ point: { lon: 10.55, lat: 20.45 }, grid: g, slopeDeg: slopeDegrees(g), targets: null, roverPoints: null, mineralogy: null });
    expect(s.insideGrid).toBe(true);
    expect(s.elevationM).toBeNull();
  });

  it('works with no grid loaded at all', () => {
    const s = summarizeLocation({ point: { lon: 10.5, lat: 20.5 }, grid: null, slopeDeg: null, targets: null, roverPoints: null, mineralogy: null });
    expect(s.insideGrid).toBe(false);
    expect(s.elevationM).toBeNull();
  });

  it('picks the nearest target and reports a great-circle distance', () => {
    const near = target('near', 10.51, 20.5);
    const far = target('far', 10.9, 20.9);
    const p = { lon: 10.5, lat: 20.5 };
    const s = summarizeLocation({ point: p, grid: null, slopeDeg: null, targets: [far, near], roverPoints: null, mineralogy: null });
    expect(s.nearestTarget).not.toBeNull();
    expect(s.nearestTarget!.target.id).toBe('near');
    expect(s.nearestTarget!.distanceM).toBeCloseTo(haversineM(p, near.position), 3);
  });

  it('distinguishes "no file" (null) from "empty file" for targets and rover points', () => {
    const p = { lon: 10.5, lat: 20.5 };
    const empty = summarizeLocation({ point: p, grid: null, slopeDeg: null, targets: [], roverPoints: [], mineralogy: null });
    expect(empty.nearestTarget).toBeNull();
    expect(empty.nearestRoverPointM).toBeNull();
    const rover = summarizeLocation({ point: p, grid: null, slopeDeg: null, targets: null, roverPoints: [{ lon: 10.5, lat: 20.6 }, { lon: 10.5, lat: 20.501 }], mineralogy: null });
    expect(rover.nearestRoverPointM!).toBeCloseTo(haversineM(p, { lon: 10.5, lat: 20.501 }), 3);
  });

  describe('pointInPolygon', () => {
    const square = [[
      [0, 0], [2, 0], [2, 2], [0, 2], [0, 0],
    ]];

    it('includes interior and boundary points and excludes exterior points', () => {
      expect(pointInPolygon({ lon: 1, lat: 1 }, square)).toBe(true);
      expect(pointInPolygon({ lon: 0, lat: 1 }, square)).toBe(true);
      expect(pointInPolygon({ lon: 3, lat: 1 }, square)).toBe(false);
    });

    it('supports holes', () => {
      const withHole = [
        square[0]!,
        [[0.5, 0.5], [1.5, 0.5], [1.5, 1.5], [0.5, 1.5], [0.5, 0.5]],
      ];
      expect(pointInPolygon({ lon: 0.25, lat: 0.25 }, withHole)).toBe(true);
      expect(pointInPolygon({ lon: 1, lat: 1 }, withHole)).toBe(false);
    });

    it('returns mineralogy properties and terrain unit for a containing region', () => {
      const mineralogy = {
        type: 'FeatureCollection' as const,
        features: [{
          type: 'Feature' as const,
          geometry: { type: 'Polygon' as const, coordinates: square },
          properties: { mineral: 'carbonate', terrainUnit: 'delta-front' },
        }],
      };
      const summary = summarizeLocation({
        point: { lon: 1, lat: 1 },
        grid: null,
        slopeDeg: null,
        targets: null,
        roverPoints: null,
        mineralogy,
      });
      expect(summary.mineralogy).toEqual({ mineral: 'carbonate', terrainUnit: 'delta-front' });
      expect(summary.terrainUnit).toBe('delta-front');
    });
  });
});

describe('isInsideGrid', () => {
  it('includes the bbox edges and excludes points beyond them', () => {
    const g = grid();
    expect(isInsideGrid(g, { lon: 10, lat: 20 })).toBe(true);
    expect(isInsideGrid(g, { lon: 11, lat: 21 })).toBe(true);
    expect(isInsideGrid(g, { lon: 11.001, lat: 20.5 })).toBe(false);
  });
});
