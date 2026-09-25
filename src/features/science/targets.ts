import type { ScienceTarget } from '@/types';

/**
 * Science value rule (SDD 5.3), 0..1:
 *   0.5 * mineralogy interest (carbonate/clay/olivine detected)
 * + 0.3 * geologic-context interest (delta front, contact between units)
 * + 0.2 * proximity to prior rover sampling (comparison value)
 * Targets are loaded from public/data/<site>/targets.geojson - do NOT hard-code invented targets here.
 */
export function rankTargets(targets: ScienceTarget[]): ScienceTarget[] {
  return [...targets].sort((a, b) => b.scienceValue - a.scienceValue);
}
