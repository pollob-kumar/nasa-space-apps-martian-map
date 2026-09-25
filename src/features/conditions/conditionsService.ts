import type { ConditionsSnapshot } from '@/types';
import { ageHours } from '@/lib/units/time';

/**
 * Loads the LATEST AVAILABLE conditions snapshot for a site from static data
 * (public/data/<site>/conditions.json). Mars data is never "live" - always show observedAt + age.
 */
export async function loadConditions(siteId: string): Promise<ConditionsSnapshot | null> {
  try {
    const res = await fetch(`/data/${siteId}/conditions.json`);
    if (!res.ok) return null;
    return (await res.json()) as ConditionsSnapshot;
  } catch {
    return null;
  }
}

export type Freshness = 'recent' | 'stale' | 'archival';
export function freshness(s: ConditionsSnapshot, now: Date = new Date()): Freshness {
  const h = ageHours(s.observedAt, now);
  if (h <= 24 * 7) return 'recent';
  if (h <= 24 * 365) return 'stale';
  return 'archival';
}
