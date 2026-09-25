# API_SPEC

Four contracts: (1) external services we consume, (2) static data files we serve, (3) internal TypeScript module API, (4) optional phase-2 REST API.

## 1. External data services (consumed)
**All entries UNVERIFIED** - confirm URL, licence, CORS, rate limits in task T-001 and update the Status column.

| Service | Purpose | Access | Status |
|---|---|---|---|
| NASA Mars Trek (trek.nasa.gov/mars) | tiled basemaps, DEMs, layer browsing | WMTS/tiles; find tile template via the portal | unverified |
| USGS Astrogeology / Astropedia | MOLA-HRSC blended DEM, geologic maps | file download | unverified |
| PDS Geosciences Node | CRISM, MOLA, HiRISE products | file download | unverified |
| PDS Atmospheres Node | MEDA, REMS, RAD tables | file download (CSV/TAB) | unverified |
| HiRISE (UArizona) | imagery, DTMs | file download | unverified |
| Perseverance mission site | traverse / waypoints | download or scrape (check terms) | unverified |
| api.nasa.gov | key-based NASA APIs (check which still exist) | `VITE_NASA_API_KEY` | unverified |

Rule: the browser reads **pre-processed static files** wherever possible; live third-party calls only for tiles.

## 2. Static data contract (`public/data/`)
### `manifest.json`
```json
{ "schemaVersion": 1, "generatedBy": "scripts/04_build_manifest.py",
  "sites": [{ "id": "jezero-delta",
    "assets": { "dem": "jezero-delta/dem.json", "slope": null, "traverse": null, "targets": null, "conditions": null } }] }
```
### `<site>/dem.json` (grid file)
```json
{ "schemaVersion": 1, "width": 512, "height": 512,
  "bbox": { "west": 77.30, "south": 18.35, "east": 77.55, "north": 18.55 },
  "encoding": "float32-base64", "unit": "m", "data": "<base64 little-endian float32, row-major, row 0 = north>",
  "provenance": { "mission": "MGS", "instrument": "MOLA", "product": "...", "sourceUrl": "...", "processed": true, "synthetic": false, "verified": true, "sourceHash": "sha256:...", "fetchedAt": "2026-10-01T00:00:00Z" } }
// sourceHash / fetchedAt are optional until T-018 (NFR-05 reproducibility) runs; absent = not yet recorded, not "no hash exists".
```
### `<site>/targets.geojson` (FeatureCollection of Points)
`properties`: `id, name, kind, scienceValue (0..1), rationale, provenance[]` (see `ScienceTarget` in `src/types`). A feature missing any of these, with `kind` outside the `ScienceTarget` union, `scienceValue` outside 0..1, or an empty/invalid `provenance[]`, is dropped by the loader.
### `<site>/traverse.geojson`
LineString/Points with `properties.sol`, `properties.date` when known + collection-level `provenance`.
### `<site>/conditions.json`
`ConditionsSnapshot` (see `src/types`): `siteId, source(provenance), observedAt (ISO UTC), sol?, airTempC?, groundTempC?, pressurePa?, windMs?, dustOpacity?, uvIndex?, radiationUSvDay?`. Missing fields are omitted, never zero-filled.

## 3. Internal module API (TypeScript)
```ts
// lib/geo
haversineM(a: LonLat, b: LonLat, radiusM?: number): number
polylineLengthM(path: LonLat[]): number
slopeDegrees(elev: Grid): Float32Array
lonLatToCell(g: Grid, p: LonLat): {x:number;y:number}
cellToLonLat(g: Grid, x: number, y: number): LonLat
// features/routing
planRoute(input: PlannerInput): PlannerOutput | null      // null = unreachable under profile limits
stepCostFactor(profile, slopeDeg, hazard01, science01): number  // Infinity = blocked
// features/conditions
loadConditions(siteId): Promise<ConditionsSnapshot | null>
freshness(snapshot, now?): 'recent' | 'stale' | 'archival'
// features/marswalk
buildPlan(route, stops, minutesPerStop?, eva?): MarswalkPlan
// data/loaders
loadManifest() / loadGeoJson(path) / loadGrid(path): Promise<... | null>   // null on any failure
loadTargets(path): Promise<ScienceTarget[] | null>;  loadTraverse(path): Promise<LonLat[] | null>
parseTargets(fc): ScienceTarget[]          // drops features with missing fields or provenance
traverseLonLats(fc): LonLat[]              // every vertex, file order
// features/inspector
summarizeLocation(input: SummaryInput): LocationSummary   // null field = no data; never a guess
isInsideGrid(grid, point): boolean
```
Contract: loaders never throw; domain functions are pure; all units documented in JSDoc.

## 4. Optional REST API (phase 2, `server/`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | `{ "ok": true, "version": "..." }` |
| GET | `/api/conditions?site=jezero-delta` | latest snapshot (same shape as `conditions.json`) or 404 |
| POST | `/api/assistant/explain` | body `{ route, target?, question }` -> `{ answer, citations[] }` |
Errors: `{ "error": { "code": "NOT_FOUND|BAD_REQUEST|UPSTREAM", "message": "..." } }`. The assistant may only cite values contained in the request body/app data; the AI key lives in server env only.
