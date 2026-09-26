import { useEffect, useState } from 'react';
import { LAYERS } from '@/config/layers.config';
import { loadMineralogy, loadTargets, loadTraverse } from '@/data/loaders/vectors';
import type { FeatureCollection } from 'geojson';
import type { LonLat, ScienceTarget } from '@/types';

/** null = the data file is missing/unreadable (distinct from "loaded, but empty"). */
export interface SiteVectors {
  targets: ScienceTarget[] | null;
  roverPoints: LonLat[] | null;
  mineralogy: FeatureCollection | null;
}

/** File paths come from the single layer registry (config/layers.config.ts), never hard-coded here. */
export function useSiteVectors(): SiteVectors {
  const [v, setV] = useState<SiteVectors>({ targets: null, roverPoints: null, mineralogy: null });
  useEffect(() => {
    let alive = true;
    const targetsPath = LAYERS.find((l) => l.id === 'science-targets')?.dataPath;
    const traversePath = LAYERS.find((l) => l.id === 'rover-traverse')?.dataPath;
    const mineralogyPath = LAYERS.find((l) => l.id === 'mineralogy')?.dataPath;
    (async () => {
      const [targets, roverPoints, mineralogy] = await Promise.all([
        targetsPath ? loadTargets(targetsPath) : null,
        traversePath ? loadTraverse(traversePath) : null,
        mineralogyPath ? loadMineralogy(mineralogyPath) : null,
      ]);
      if (alive) setV({ targets, roverPoints, mineralogy });
    })();
    return () => {
      alive = false;
    };
  }, []);
  return v;
}
