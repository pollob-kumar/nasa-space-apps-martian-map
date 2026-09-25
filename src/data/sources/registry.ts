import { LAYERS } from '@/config/layers.config';
import type { Mission } from '@/types';

/** Distinct missions currently registered. The challenge requires MULTIPLE NASA missions (target: >= 3). */
export function missionsInUse(): Mission[] {
  return [...new Set(LAYERS.map((l) => l.provenance.mission))];
}
