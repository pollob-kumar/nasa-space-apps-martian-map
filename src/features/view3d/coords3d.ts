import { Vector3 } from 'three';
import { cellSizeM, type Grid } from '@/lib/geo/grid';
import type { LonLat } from '@/types';

export const SCENE_SIZE = 100; // world units across the site's east-west extent
export const V_EXAGGERATION = 4; // vertical exaggeration, ALWAYS shown in the UI

export function worldScale(g: Grid) {
  const { dx } = cellSizeM(g);
  return SCENE_SIZE / (dx * g.width); // world units per metre
}

/** lon/lat + elevation(m) -> scene position. x = east, z = south (three.js convention), y = up. */
export function toWorld(g: Grid, p: LonLat, elevM: number): Vector3 {
  const u = (p.lon - g.bbox.west) / (g.bbox.east - g.bbox.west);
  const v = (g.bbox.north - p.lat) / (g.bbox.north - g.bbox.south);
  const depth = SCENE_SIZE * (g.height / g.width);
  return new Vector3((u - 0.5) * SCENE_SIZE, elevM * worldScale(g) * V_EXAGGERATION, (v - 0.5) * depth);
}
