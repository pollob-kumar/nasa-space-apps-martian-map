import { DEG2RAD, MARS } from '@/config/constants';
import type { LonLat } from '@/types';

/** Great-circle distance on Mars in metres. */
export function haversineM(a: LonLat, b: LonLat, radiusM: number = MARS.RADIUS_M): number {
  const dLat = (b.lat - a.lat) * DEG2RAD;
  const dLon = (b.lon - a.lon) * DEG2RAD;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * DEG2RAD) * Math.cos(b.lat * DEG2RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * radiusM * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function polylineLengthM(path: LonLat[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += haversineM(path[i - 1]!, path[i]!);
  return total;
}
