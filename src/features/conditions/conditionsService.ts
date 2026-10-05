import type { ConditionsSnapshot } from '@/types';
import { ageHours } from '@/lib/units/time';

/**
 * Loads the LATEST AVAILABLE conditions snapshot for a site from static data
 * (public/data/<site>/conditions.json). Always show observedAt and its age.
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

export function observationAgeLabel(s: ConditionsSnapshot, now: Date = new Date()): string {
  const hours = Math.max(0, ageHours(s.observedAt, now));
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${hours.toFixed(1)} h`;
  const days = hours / 24;
  if (days < 365) return `${days.toFixed(1)} days`;
  return `${(days / 365).toFixed(1)} years`;
}
