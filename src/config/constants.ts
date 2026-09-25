/** Physical constants. Source: IAU/NASA fact sheets. Do not "round" these. */
export const MARS = {
  RADIUS_M: 3_389_500, // IAU 2000 mean radius
  GRAVITY_MS2: 3.71, // surface gravity (~0.38 g)
  SOL_SECONDS: 88_775.244, // mean solar day
} as const;

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;
