import type { Feature, FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import { isProvenance, parseTargets, traverseLonLats } from '@/data/loaders/vectors';

// TEST FIXTURES ONLY (synthetic on purpose; never shipped as app data).
const prov = { mission: 'M2020', instrument: 'test', product: 'test', sourceUrl: 'x', processed: false, synthetic: true, verified: false };
const fc = (features: Feature[]): FeatureCollection => ({ type: 'FeatureCollection', features });
const targetFeature = (props: Record<string, unknown>, coords: number[] = [77.4, 18.4]): Feature => ({
  type: 'Feature',
  geometry: { type: 'Point', coordinates: coords },
  properties: { id: 't1', name: 'Test target', kind: 'clay', scienceValue: 0.7, rationale: 'test', provenance: [prov], ...props },
});

describe('parseTargets', () => {
  it('parses a complete target', () => {
    const out = parseTargets(fc([targetFeature({})]));
    expect(out).toHaveLength(1);
    expect(out[0]!.position).toEqual({ lon: 77.4, lat: 18.4 });
    expect(out[0]!.kind).toBe('clay');
  });

  it('drops a target with no provenance (data honesty)', () => {
    expect(parseTargets(fc([targetFeature({ provenance: [] })]))).toHaveLength(0);
    expect(parseTargets(fc([targetFeature({ provenance: undefined })]))).toHaveLength(0);
  });

  it('drops out-of-range value, unknown kind, bad provenance, missing rationale and non-point geometry', () => {
    const line: Feature = { type: 'Feature', geometry: { type: 'LineString', coordinates: [[1, 2], [3, 4]] }, properties: { id: 'l' } };
    const out = parseTargets(
      fc([
        targetFeature({ scienceValue: 1.5 }),
        targetFeature({ kind: 'volcano' }),
        targetFeature({ provenance: [{ mission: 'NOPE' }] }),
        targetFeature({ rationale: undefined }),
        line,
      ]),
    );
    expect(out).toHaveLength(0);
  });

  it('keeps valid targets and skips only the invalid ones', () => {
    const out = parseTargets(fc([targetFeature({ id: 'a' }), targetFeature({ id: 'b', scienceValue: -1 }), targetFeature({ id: 'c' })]));
    expect(out.map((t) => t.id)).toEqual(['a', 'c']);
  });
});

describe('isProvenance', () => {
  it('requires every provenance field, including the honesty flags', () => {
    expect(isProvenance(prov)).toBe(true);
    expect(isProvenance({ ...prov, verified: undefined })).toBe(false);
    expect(isProvenance(null)).toBe(false);
  });
});

describe('traverseLonLats', () => {
  it('flattens points and lines in file order and ignores polygons', () => {
    const out = traverseLonLats(
      fc([
        { type: 'Feature', geometry: { type: 'Point', coordinates: [1, 2] }, properties: null },
        { type: 'Feature', geometry: { type: 'LineString', coordinates: [[3, 4], [5, 6]] }, properties: null },
        { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] }, properties: null },
      ]),
    );
    expect(out).toEqual([{ lon: 1, lat: 2 }, { lon: 3, lat: 4 }, { lon: 5, lat: 6 }]);
  });

  it('skips non-finite coordinates', () => {
    const out = traverseLonLats(fc([{ type: 'Feature', geometry: { type: 'LineString', coordinates: [[1, NaN], [2, 3]] }, properties: null }]));
    expect(out).toEqual([{ lon: 2, lat: 3 }]);
  });
});
