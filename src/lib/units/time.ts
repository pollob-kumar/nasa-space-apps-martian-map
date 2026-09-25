import { MARS } from '@/config/constants';

/** Convert a duration in Earth seconds to (fractional) sols. */
export const secondsToSols = (s: number) => s / MARS.SOL_SECONDS;
export const minutesToHhMm = (min: number) => `${Math.floor(min / 60)} h ${Math.round(min % 60)} min`;

/** Age of an observation, used for the "latest available" staleness badge. */
export function ageHours(observedAtIso: string, now: Date = new Date()): number {
  return (now.getTime() - new Date(observedAtIso).getTime()) / 3_600_000;
}
