import type { FeatureCollection } from 'geojson';

/** All GeoJSON goes through here (never fetch inside components). Returns null when missing. */
export async function loadGeoJson(path: string): Promise<FeatureCollection | null> {
  try {
    const res = await fetch(`/data/${path}`);
    return res.ok ? ((await res.json()) as FeatureCollection) : null;
  } catch {
    return null;
  }
}
