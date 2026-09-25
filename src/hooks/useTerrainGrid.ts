import { useEffect, useState } from 'react';
import { SITES } from '@/config/sites.config';
import { loadGrid, syntheticGrid } from '@/data/loaders/grid';
import { loadManifest } from '@/data/loaders/manifest';
import type { Grid } from '@/lib/geo/grid';

/** Real DEM if the manifest lists one, otherwise SYNTHETIC terrain (flagged so the UI can warn). */
export function useTerrainGrid(siteId: string): { grid: Grid | null; synthetic: boolean } {
  const [state, setState] = useState<{ grid: Grid | null; synthetic: boolean }>({ grid: null, synthetic: true });
  useEffect(() => {
    let alive = true;
    (async () => {
      const site = SITES.find((s) => s.id === siteId);
      if (!site) return;
      const manifest = await loadManifest();
      const demPath = manifest?.sites.find((s) => s.id === siteId)?.assets.dem;
      const real = demPath ? await loadGrid(demPath) : null;
      if (alive) setState(real ? { grid: real, synthetic: false } : { grid: syntheticGrid(site.bbox), synthetic: true });
    })();
    return () => {
      alive = false;
    };
  }, [siteId]);
  return state;
}
