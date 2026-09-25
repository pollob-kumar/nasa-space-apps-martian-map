export interface SiteAssets {
  dem: string | null;
  slope: string | null;
  traverse: string | null;
  targets: string | null;
  conditions: string | null;
}
export interface Manifest {
  schemaVersion: number;
  generatedBy: string | null;
  sites: { id: string; assets: SiteAssets }[];
}

export async function loadManifest(): Promise<Manifest | null> {
  try {
    const res = await fetch('/data/manifest.json');
    return res.ok ? ((await res.json()) as Manifest) : null;
  } catch {
    return null;
  }
}
