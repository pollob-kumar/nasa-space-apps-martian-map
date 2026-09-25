/**
 * Cost model for a suited human on foot. ALL numbers are ASSUMPTIONS, not validated EVA data
 * (ADR-007). Keep them here, configurable, and shown in the UI ("Assumptions").
 */
export interface RouteProfile {
  id: 'fastest' | 'safest' | 'science';
  maxSlopeDeg: number; // hard limit: impassable above this
  cautionSlopeDeg: number; // penalty ramps up above this
  wSlope: number;
  wHazard: number;
  wScience: number; // reward for passing high-science cells (0 = ignore)
  baseSpeedMs: number; // flat-ground walking speed
}

export const PROFILES: Record<RouteProfile['id'], RouteProfile> = {
  fastest: { id: 'fastest', maxSlopeDeg: 20, cautionSlopeDeg: 15, wSlope: 1, wHazard: 1, wScience: 0, baseSpeedMs: 0.8 },
  safest: { id: 'safest', maxSlopeDeg: 12, cautionSlopeDeg: 6, wSlope: 4, wHazard: 6, wScience: 0, baseSpeedMs: 0.7 },
  science: { id: 'science', maxSlopeDeg: 15, cautionSlopeDeg: 8, wSlope: 2, wHazard: 3, wScience: 1.5, baseSpeedMs: 0.7 },
};

/** Multiplier applied to horizontal distance for one step. Infinity = blocked. */
export function stepCostFactor(p: RouteProfile, slopeDeg: number, hazard01: number, science01: number): number {
  if (slopeDeg > p.maxSlopeDeg) return Infinity;
  const over = Math.max(0, slopeDeg - p.cautionSlopeDeg) / Math.max(1e-6, p.maxSlopeDeg - p.cautionSlopeDeg);
  const factor = 1 + p.wSlope * over * over + p.wHazard * hazard01 - p.wScience * 0.5 * science01;
  return Math.max(0.2, factor); // never zero/negative -> keeps A* admissible with a 0.2 lower bound
}

/** Walking speed drops with slope (simple linear model, ASSUMPTION). */
export function speedMs(p: RouteProfile, slopeDeg: number): number {
  const k = Math.max(0.3, 1 - slopeDeg / (2 * p.maxSlopeDeg));
  return p.baseSpeedMs * k;
}
