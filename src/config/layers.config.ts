import type { LayerDef, Provenance } from '@/types';

/**
 * SINGLE registry of map layers. Add a layer here, nowhere else (AGENTS.md).
 * All tile URLs / product names are UNVERIFIED until T-001 in docs/TODO.md is done.
 */
const unverified = (p: Omit<Provenance, 'verified' | 'synthetic' | 'processed'> & Partial<Provenance>): Provenance => ({
  processed: false,
  synthetic: false,
  verified: false,
  ...p,
});

export const LAYERS: LayerDef[] = [
  {
    id: 'basemap-imagery',
    title: 'Surface imagery',
    group: 'base',
    kind: 'tile',
    tileUrl: import.meta.env.VITE_TILE_BASEMAP_URL || '',
    tms: false, // UNVERIFIED like the URL: set to match the chosen source's tile scheme (T-001, ADR-016)
    defaultVisible: true,
    defaultOpacity: 1,
    provenance: unverified({
      mission: 'MRO',
      instrument: 'CTX / HiRISE',
      product: 'Context / high-res imagery mosaic',
      resolution: '~6 m/px (CTX)',
      sourceUrl: 'https://trek.nasa.gov/mars/',
    }),
  },
  {
    id: 'elevation',
    title: 'Elevation (shaded relief)',
    group: 'terrain',
    kind: 'tile',
    tileUrl: import.meta.env.VITE_TILE_ELEVATION_URL || '',
    tms: false, // Mars Trek WMTS is row-from-north (false); TMS sources need true (ADR-016)
    defaultVisible: false,
    defaultOpacity: 0.6,
    provenance: unverified({
      mission: 'MGS',
      instrument: 'MOLA',
      product: 'MOLA (with HRSC blend) DEM',
      resolution: '200-463 m/px',
      sourceUrl: 'https://astrogeology.usgs.gov/search/map/mars_mgs_mola_mex_hrsc_blended_dem_global_200m',
    }),
  },
  {
    id: 'slope',
    title: 'Slope (derived)',
    group: 'terrain',
    kind: 'grid',
    dataPath: 'jezero-delta/slope.json',
    defaultVisible: false,
    defaultOpacity: 0.6,
    provenance: unverified({
      mission: 'MGS',
      instrument: 'MOLA',
      product: 'Slope computed from DEM by scripts/03_derive_terrain.py',
      processed: true,
      sourceUrl: 'https://pds-geosciences.wustl.edu/',
    }),
  },
  {
    id: 'mineralogy',
    title: 'Mineralogy / geology',
    group: 'science',
    kind: 'geojson',
    dataPath: 'jezero-delta/mineralogy.geojson',
    defaultVisible: false,
    defaultOpacity: 0.5,
    provenance: unverified({
      mission: 'MRO',
      instrument: 'CRISM',
      product: 'Mineral detections (carbonate, clay, olivine)',
      sourceUrl: 'https://pds-geosciences.wustl.edu/',
    }),
  },
  {
    id: 'thermal-inertia',
    title: 'Thermal inertia (sand vs rock)',
    group: 'terrain',
    kind: 'grid',
    dataPath: 'jezero-delta/thermal_inertia.json',
    defaultVisible: false,
    defaultOpacity: 0.5,
    provenance: unverified({
      mission: 'ODY',
      instrument: 'THEMIS',
      product: 'THEMIS IR-derived thermal inertia',
      sourceUrl: 'https://themis.asu.edu/',
    }),
  },
  {
    id: 'rover-traverse',
    title: 'Perseverance traverse',
    group: 'science',
    kind: 'geojson',
    dataPath: 'jezero-delta/traverse.geojson',
    defaultVisible: true,
    defaultOpacity: 1,
    provenance: unverified({
      mission: 'M2020',
      instrument: 'Rover navigation',
      product: 'Rover traverse / waypoints',
      sourceUrl: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
    }),
  },
  {
    id: 'science-targets',
    title: 'Science targets',
    group: 'science',
    kind: 'geojson',
    dataPath: 'jezero-delta/targets.geojson',
    defaultVisible: true,
    defaultOpacity: 1,
    provenance: unverified({
      mission: 'M2020',
      instrument: 'Multiple',
      product: 'Curated targets (rule-based, see SDD 5.3)',
      processed: true,
      sourceUrl: 'https://science.nasa.gov/mission/mars-2020-perseverance/',
    }),
  },
  {
    id: 'hazards',
    title: 'Hazard zones (derived)',
    group: 'route',
    kind: 'grid',
    dataPath: 'jezero-delta/hazard.json',
    defaultVisible: true,
    defaultOpacity: 0.5,
    provenance: unverified({
      mission: 'MRO',
      instrument: 'Derived',
      product: 'Hazard = f(slope, roughness, thermal inertia)',
      processed: true,
      sourceUrl: 'https://trek.nasa.gov/mars/',
    }),
  },
];
