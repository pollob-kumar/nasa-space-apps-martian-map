import { useEffect, useState } from 'react';
import { LAYERS } from '@/config/layers.config';
import { loadTargets, loadTraverse } from '@/data/loaders/vectors';
import type { LonLat, ScienceTarget } from '@/types';

/** null = the data file is missing/unreadable (distinct from "loaded, but empty"). */
export interface SiteVectors {
  targets: ScienceTarget[] | null;
  roverPoints: LonLat[] | null;
}

/** File paths come from the single layer registry (config/layers.config.ts), never hard-coded here. */
export function useSiteVectors(): SiteVectors {
  const [v, setV] = useState<SiteVectors>({ targets: null, roverPoints: null });
  useEffect(() => {
    let alive = true;
    const targetsPath = LAYERS.find((l) => l.id === 'science-targets')?.dataPath;
    const traversePath = LAYERS.find((l) => l.id === 'rover-traverse')?.dataPath;
    (async () => {
      const [targets, roverPoints] = await Promise.all([
        targetsPath ? loadTargets(targetsPath) : null,
        traversePath ? loadTraverse(traversePath) : null,
      ]);
      if (alive) setV({ targets, roverPoints });
    })();
    return () => {
      alive = false;
    };
  }, []);
  return v;
}
