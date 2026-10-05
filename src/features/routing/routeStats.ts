import { haversineM } from '@/lib/geo/haversine';
import type { LonLat } from '@/types';

export interface ElevationProfilePoint {
  distanceM: number;
  elevationM: number;
}

export interface RouteStats {
  profile: ElevationProfilePoint[];
  averageSlopeDeg: number;
  elevationGainM: number;
  elevationLossM: number;
}

/** Builds route-distance/elevation samples and summary values for a planned route. */
export function summarizeRoute(path: LonLat[], elevationsM: number[]): RouteStats {
  const count = Math.min(path.length, elevationsM.length);
  if (count === 0) {
    return { profile: [], averageSlopeDeg: 0, elevationGainM: 0, elevationLossM: 0 };
  }

  const profile: ElevationProfilePoint[] = [{ distanceM: 0, elevationM: elevationsM[0]! }];
  let totalHorizontalM = 0;
  let totalSlopeDeg = 0;
  let elevationGainM = 0;
  let elevationLossM = 0;

  for (let i = 1; i < count; i++) {
    const previousElevation = elevationsM[i - 1]!;
    const elevation = elevationsM[i]!;
    const horizontalM = haversineM(path[i - 1]!, path[i]!);
    const elevationDeltaM = elevation - previousElevation;
    totalHorizontalM += horizontalM;
    if (elevationDeltaM > 0) elevationGainM += elevationDeltaM;
    if (elevationDeltaM < 0) elevationLossM -= elevationDeltaM;
    if (horizontalM > 0)
      totalSlopeDeg += Math.atan2(Math.abs(elevationDeltaM), horizontalM) * (180 / Math.PI);
    profile.push({ distanceM: totalHorizontalM, elevationM: elevation });
  }

  return {
    profile,
    averageSlopeDeg: count > 1 ? totalSlopeDeg / (count - 1) : 0,
    elevationGainM,
    elevationLossM,
  };
}
