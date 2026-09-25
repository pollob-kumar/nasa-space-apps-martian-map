import { DEG2RAD, MARS } from '@/config/constants';
import type { BBox, LonLat } from '@/types';

/** Regular lon/lat raster. Row 0 = NORTH edge. Values are row-major. */
export interface Grid {
  width: number;
  height: number;
  bbox: BBox;
  data: Float32Array;
}

export function cellSizeM(g: Grid): { dx: number; dy: number } {
  const midLat = (g.bbox.north + g.bbox.south) / 2;
  const dLon = (g.bbox.east - g.bbox.west) / g.width;
  const dLat = (g.bbox.north - g.bbox.south) / g.height;
  return {
    dx: MARS.RADIUS_M * Math.cos(midLat * DEG2RAD) * dLon * DEG2RAD,
    dy: MARS.RADIUS_M * dLat * DEG2RAD,
  };
}

export function lonLatToCell(g: Grid, p: LonLat): { x: number; y: number } {
  const x = Math.floor(((p.lon - g.bbox.west) / (g.bbox.east - g.bbox.west)) * g.width);
  const y = Math.floor(((g.bbox.north - p.lat) / (g.bbox.north - g.bbox.south)) * g.height);
  return { x: Math.min(g.width - 1, Math.max(0, x)), y: Math.min(g.height - 1, Math.max(0, y)) };
}

export function cellToLonLat(g: Grid, x: number, y: number): LonLat {
  return {
    lon: g.bbox.west + ((x + 0.5) / g.width) * (g.bbox.east - g.bbox.west),
    lat: g.bbox.north - ((y + 0.5) / g.height) * (g.bbox.north - g.bbox.south),
  };
}

/** Slope in degrees from an elevation grid (central differences, edges clamped). */
export function slopeDegrees(elev: Grid): Float32Array {
  const { width: w, height: h, data } = elev;
  const { dx, dy } = cellSizeM(elev);
  const out = new Float32Array(w * h);
  const at = (x: number, y: number) => data[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))]!;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dzdx = (at(x + 1, y) - at(x - 1, y)) / (2 * dx);
      const dzdy = (at(x, y - 1) - at(x, y + 1)) / (2 * dy); // north-up
      out[y * w + x] = Math.atan(Math.hypot(dzdx, dzdy)) / DEG2RAD;
    }
  }
  return out;
}
