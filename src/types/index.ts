/** Planetocentric, East-positive longitude (0..360 or -180..180 both accepted; see ADR-006). Degrees. */
export interface LonLat {
  lon: number;
  lat: number;
}

export interface BBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

/** NASA missions (plus ESA partner data that reaches us through NASA/USGS products). */
export type Mission = 'MGS' | 'MRO' | 'ODY' | 'MSL' | 'M2020' | 'MEX_ESA';

/** Every layer and every displayed value must carry this. See AGENTS.md rule "Data honesty". */
export interface Provenance {
  mission: Mission;
  instrument: string; // e.g. "MOLA", "HiRISE", "MEDA"
  product: string; // human-readable product name
  resolution?: string; // e.g. "463 m/px"
  acquired?: string; // ISO date or sol range, if known
  sourceUrl: string;
  processed: boolean; // true if we derived it (slope, hazard...)
  synthetic: boolean; // true = placeholder data, MUST be labelled in the UI
  verified: boolean; // false = source/URL/values not yet checked by a human
  /** sha256 of the raw downloaded file, for NFR-05 reproducibility (ADR-017). Optional: only set once T-018 runs. */
  sourceHash?: string;
  /** ISO datetime this raw file was fetched, for NFR-05. Optional: only set once T-018 runs. */
  fetchedAt?: string;
}

export type LayerGroup = 'base' | 'terrain' | 'science' | 'conditions' | 'route';
export type LayerKind = 'tile' | 'geojson' | 'grid';

export interface LayerDef {
  id: string;
  title: string;
  group: LayerGroup;
  kind: LayerKind;
  tileUrl?: string; // for kind 'tile' (TMS/XYZ template)
  /** Tile row order. false/undefined = XYZ/WMTS (row 0 at the north edge); true = TMS (row 0 at the south). Must match the source (ADR-004, ADR-016). */
  tms?: boolean;
  dataPath?: string; // for kind 'geojson' | 'grid' (relative to /data)
  provenance: Provenance;
  defaultVisible: boolean;
  defaultOpacity: number; // 0..1
}

export interface Site {
  id: string;
  name: string;
  center: LonLat;
  bbox: BBox;
  /** false until a human has checked coordinates against an official gazetteer */
  verified: boolean;
  note?: string;
}

export interface ScienceTarget {
  id: string;
  name: string;
  position: LonLat;
  kind: 'delta' | 'carbonate' | 'clay' | 'igneous' | 'sediment' | 'other';
  /** 0..1 relative scientific value, from a documented rule (see SDD 5.3) */
  scienceValue: number;
  rationale: string;
  provenance: Provenance[];
}

export interface ConditionsSnapshot {
  siteId: string;
  source: Provenance;
  observedAt: string; // ISO UTC
  sol?: number;
  airTempC?: number;
  groundTempC?: number;
  pressurePa?: number;
  windMs?: number;
  dustOpacity?: number;
  uvIndex?: number;
  radiationUSvDay?: number;
}

export interface RouteResult {
  path: LonLat[];
  distanceM: number;
  elevationsM: number[];
  maxSlopeDeg: number;
  estTimeMin: number;
  profile: 'fastest' | 'safest' | 'science';
}
