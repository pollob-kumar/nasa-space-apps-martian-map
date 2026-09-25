import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { LonLat, Provenance, ScienceTarget } from '@/types';
import { loadGeoJson } from './geojson';

/**
 * GeoJSON -> domain types. Parsing is strict on purpose (AGENTS.md "Data honesty"): a feature that is missing a
 * required field or has no provenance is DROPPED, never patched up with invented values.
 * Contract for the input files: docs/API_SPEC.md section 2.
 */

const MISSIONS: readonly string[] = ['MGS', 'MRO', 'ODY', 'MSL', 'M2020', 'MEX_ESA'];
const TARGET_KINDS: readonly string[] = ['delta', 'carbonate', 'clay', 'igneous', 'sediment', 'other'];

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

export function isProvenance(x: unknown): x is Provenance {
  if (!isRecord(x)) return false;
  const mission = x['mission'];
  if (typeof mission !== 'string' || !MISSIONS.includes(mission)) return false;
  return (
    typeof x['instrument'] === 'string' &&
    typeof x['product'] === 'string' &&
    typeof x['sourceUrl'] === 'string' &&
    typeof x['processed'] === 'boolean' &&
    typeof x['synthetic'] === 'boolean' &&
    typeof x['verified'] === 'boolean'
  );
}

function isTargetKind(k: string): k is ScienceTarget['kind'] {
  return TARGET_KINDS.includes(k);
}

function parseTarget(f: Feature): ScienceTarget | null {
  const g = f.geometry;
  const p = f.properties;
  if (!g || g.type !== 'Point' || !isRecord(p)) return null;
  const lon = g.coordinates[0];
  const lat = g.coordinates[1];
  if (typeof lon !== 'number' || typeof lat !== 'number' || !Number.isFinite(lon) || !Number.isFinite(lat)) return null;

  const { id, name, kind, scienceValue, rationale, provenance } = p;
  if (typeof id !== 'string' || typeof name !== 'string' || typeof rationale !== 'string') return null;
  if (typeof kind !== 'string' || !isTargetKind(kind)) return null;
  if (typeof scienceValue !== 'number' || !(scienceValue >= 0 && scienceValue <= 1)) return null;
  if (!Array.isArray(provenance) || provenance.length === 0 || !provenance.every(isProvenance)) return null;

  return { id, name, position: { lon, lat }, kind, scienceValue, rationale, provenance };
}

/** Valid science targets from a FeatureCollection of Points. Invalid features are skipped. */
export function parseTargets(fc: FeatureCollection): ScienceTarget[] {
  const out: ScienceTarget[] = [];
  for (const f of fc.features) {
    const t = parseTarget(f);
    if (t) out.push(t);
  }
  return out;
}

function addPosition(out: LonLat[], c: readonly number[]): void {
  const lon = c[0];
  const lat = c[1];
  if (typeof lon === 'number' && typeof lat === 'number' && Number.isFinite(lon) && Number.isFinite(lat)) {
    out.push({ lon, lat });
  }
}

function collectPositions(g: Geometry, out: LonLat[]): void {
  switch (g.type) {
    case 'Point':
      addPosition(out, g.coordinates);
      break;
    case 'MultiPoint':
    case 'LineString':
      for (const c of g.coordinates) addPosition(out, c);
      break;
    case 'MultiLineString':
      for (const line of g.coordinates) for (const c of line) addPosition(out, c);
      break;
    case 'GeometryCollection':
      for (const sub of g.geometries) collectPositions(sub, out);
      break;
    default:
      break; // polygons are areas, not rover positions
  }
}

/** Every recorded position (vertex) of a rover-traverse FeatureCollection, in file order. */
export function traverseLonLats(fc: FeatureCollection): LonLat[] {
  const out: LonLat[] = [];
  for (const f of fc.features) if (f.geometry) collectPositions(f.geometry, out);
  return out;
}

/** Loaders never throw: null = file missing or malformed (the UI shows an explicit empty state). */
export async function loadTargets(path: string): Promise<ScienceTarget[] | null> {
  const fc = await loadGeoJson(path);
  if (!fc) return null;
  try {
    return parseTargets(fc);
  } catch {
    return null;
  }
}

export async function loadTraverse(path: string): Promise<LonLat[] | null> {
  const fc = await loadGeoJson(path);
  if (!fc) return null;
  try {
    return traverseLonLats(fc);
  } catch {
    return null;
  }
}
