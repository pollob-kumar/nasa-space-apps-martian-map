# DECISIONS (Architecture Decision Records)

Status: Proposed / Accepted / Superseded. **Only humans flip Proposed -> Accepted.** Agents add new ADRs, never silently change accepted ones.

## ADR-001 - Scope: Jezero western delta, one location + one route

Status: **Proposed (confirm)**. Context: challenge allows "a location or route"; small scope = finished product. Decision: Jezero delta, one demonstrable route with 2-3 science stops. Consequences: strong multi-mission data + rover conditions; backup Gale.

## ADR-002 - Static client + pre-processed data; no backend/DB in MVP

Status: Proposed. Context: 48 h hackathon, big NASA rasters. Decision: preprocess offline (scripts/), ship small files, host statically. Consequences: simple + robust; no live APIs except tiles; server/ only if needed later.

## ADR-003 - Vite + React 19 + TypeScript (strict)

Status: Proposed. Fast dev loop, wide AI/tooling support, type safety stops agent mistakes.

## ADR-004 - 2D map: Leaflet with lon/lat CRS (EPSG:4326-style), not web-mercator

Status: Proposed. Mars tile sets are equirectangular; mercator would distort. Consequence: tile template + `tms` flag must match each source (verify in T-001).

## ADR-005 - 3D: three.js via react-three-fiber + drei; 3D is a companion view

Status: Proposed. Astronaut + terrain make the demo memorable, but the core value is the layered planning map. 3D is lazy-loaded.

## ADR-006 - Coordinates: planetocentric, east-positive longitude

Status: Proposed. Avoids the planetographic/planetocentric mix-up. Every data file declares/converts to this convention.

## ADR-007 - Human EVA parameters are explicit assumptions

Status: Proposed. Defaults: max slope 20/12/15 deg (fast/safe/science), base speed 0.7-0.8 m/s, EVA 480 min with 25 % reserve. These are NOT NASA-validated. Decision: keep in `costModel.ts`/`marswalkPlan.ts`, show in UI "Assumptions", replace with cited values when found (T-050).

## ADR-008 - Data honesty policy

Status: **Accepted**. Provenance on everything; `synthetic` and `verified` flags rendered in UI; "latest available" not "live"; missing data shown as missing; no invented targets/coordinates/values.

## ADR-009 - AI assistant is optional and grounded

Status: Proposed. Phase 2 only, server-side key, may cite only app data. Not allowed to replace the map.

## ADR-010 - Astronaut asset: procedural fallback, optional GLB

Status: Proposed. Procedural avatar guarantees no licence/asset risk; a GLB can be dropped in `public/models/` if its licence is recorded.

## ADR-011 - State: zustand

Status: Proposed. Tiny, typed, no boilerplate; single store in `state/store.ts`.

## ADR-012 - Data prep in Python

Status: Proposed. rasterio/numpy handle GeoTIFF/PDS products far better than JS. Outputs are plain JSON/GeoJSON.

## ADR-013 - Dependencies and structure changes need an ADR

Status: Accepted. Prevents AI drift: no new dependency, folder, or convention without a new ADR entry.

## ADR-014 - Merge of two scaffolds: keep this static toolkit as the base; adopt only B's ideas, not its backend

Status: Proposed. Context: two toolkits were generated for the same challenge. This one (A) = static React/TypeScript app with a real route planner and provenance system. The other (B) = FastAPI backend + React/JS frontend where every data source is still sample data.
Decision: A is the base. From B we adopt: (1) the integrated point summary, implemented client-side (ADR-015); (2) the Mermaid architecture diagram and layer table; (3) the "Alternatives considered" field in ADRs; (4) B's Mars Trek tile URL as an UNVERIFIED candidate (DATA_SOURCES section 7, not enabled by default); (5) the offline-demo requirement (NFR-10, T-064); (6) the "fresh clone runs from the README alone" check.
Alternatives considered: (a) B as base - rejected: its point summary returned invented elevation and a hard-coded slope, its route was a straight line with no hazards, and its own acceptance bar was only 2 sources; (b) A frontend + B backend - rejected for the MVP: needs a hosted server and two runtimes at demo time, and NASA rasters are files, not API-shaped (ADR-002); (c) docs only, no code - rejected: FR-06 is a Must and had no implementation.
Consequences: no new dependency (ADR-013 not triggered by this ADR). If phase 2 needs a server, copy B's pattern: one service module per data source, thin HTTP handlers, response models mirroring API_SPEC.md.

## ADR-015 - Point inspector: new feature folder `features/inspector`

Status: Proposed. Context: FR-06 (Must) asks that one click shows location, elevation, slope, terrain unit, mineralogy, nearest rover data, rationale and provenance together. ADR-013 requires an ADR for a new folder.
Decision: `features/inspector/locationSummary.ts` (pure, unit-tested) + `InspectorPanel.tsx`; parsing in `data/loaders/vectors.ts`; loading in `hooks/useSiteVectors.ts`; store fields `inspectedPoint` / `inspect`; the map click sets the point. Missing data is an explicit "no data" row, never a guess; a synthetic DEM shows the SYNTHETIC badge and no mission badge.
Alternatives considered: (a) a server endpoint like B's `/locations/{lat}/{lon}/summary` - rejected by ADR-002; (b) extend `ScienceTargetPanel` - rejected: it is target-centred, FR-06 wants any point; (c) compute inside `MapView` - rejected: mixes UI and logic, cannot be unit-tested.
Consequences: mineralogy / terrain-unit rows are "not looked up yet" until point-in-polygon on the mineralogy layer exists (T-024); real-DEM provenance is not yet shown in the panel (the grid loader drops it).

## ADR-016 - Per-layer tile scheme flag `LayerDef.tms`

Status: Proposed. Context: ADR-004 says the `tms` flag must match each tile source, but `MapView` hard-coded `tms: true`. Mars Trek serves WMTS (row 0 at the north), which needs `false`; a wrong value flips tiles north-south.
Decision: optional `tms` on `LayerDef` (default false = XYZ/WMTS); both tile layers set `tms: false` explicitly, marked unverified; `MapView` passes it to Leaflet.
Alternatives considered: (a) keep the hard-coded `true` - rejected: wrong for the only candidate source we know; (b) one global constant - rejected: different layers may come from different providers.
Consequences: whoever verifies a source (T-001) must confirm and set the flag.

## ADR-017 - SRS-vs-TODO cross-check; five missing tasks added; optional provenance hash/date fields

Status: Proposed. Context: a second pass compared every SRS.md FR/NFR acceptance criterion against docs/TODO.md and found five gaps TODO.md did not track: FR-01's lon/lat hover readout, NFR-01's first-load-time budget, NFR-03's laptop/mobile responsiveness check, NFR-05's source version/hash recording, NFR-07's client-bundle secret scan.
Decision: T-020 reworded to include the hover readout explicitly; four new tasks added - T-018 (Phase 1, NFR-05), T-043/T-044/T-045 (Phase 4, NFR-01/03/07). `Provenance` gets two optional fields, `sourceHash` and `fetchedAt`, populated once T-018 runs; absent means "not yet recorded", consistent with the rest of the honesty model (ADR-010-style: missing is a state, not a lie).
Alternatives considered: (a) leave the gap and rely on SUBMISSION_CHECKLIST.md to catch it later - rejected: that checklist is Phase 5, too late to budget time for a code change like code-splitting; (b) a separate `ReproducibilityInfo` type instead of extending `Provenance` - rejected: the hash/date describe the same source the rest of `Provenance` already describes, a second type would need joining back to it everywhere it's displayed.
Consequences: `isProvenance()` in `data/loaders/vectors.ts` does not need to change (the new fields are optional and not required by the type guard). Every checklist or prompt file that enumerates "all tasks" must be re-diffed against SRS.md when SRS.md changes, not assumed complete.

## ADR-018 - Hazard model thresholds (Roughness and Sand Risk)

Status: Accepted
Context: To implement the hazard model in `docs/SDD.md` (T-013, T-014), we need thresholds to normalize roughness and sand-risk into a 0..1 score, as well as weights for the final blend. Specific NASA engineering constraints for the rover are not universally published for these metrics, and THEMIS thermal-inertia data is currently missing from the raw fetches.
Decision: We adopt the following thresholds and weights:

- **Roughness**: 3x3 cell elevation variance. Max risk (1.0) at variance >= 0.5 m².
- **Sand risk**: Based on Putzig et al. (2005), TI < 250 SI units = max risk (1.0), TI > 400 = 0 risk (0.0). Linear in between. Since THEMIS data is missing, we use a synthetic grid of 0.0 (no risk) for now.
- **Hazard weights**: 0.4 (slope), 0.4 (roughness), 0.2 (sand risk).
  Alternatives considered: (a) Use standard deviation instead of variance - rejected to avoid expensive sqrt per cell in potential client-side porting; variance threshold of 0.5 m² (approx 0.7m std dev) is equivalent. (b) Wait for THEMIS data - rejected; the model can run with a synthetic 0.0 sand risk placeholder to unblock routing (T-040).
  Consequences: `03_derive_terrain.py` generates `roughness.json`, `sand_risk.json`, and `hazard.json`. Both `sand_risk` and `hazard` are marked `synthetic: true` to adhere to ADR-008 until real THEMIS data is provided.

## Template

```
## ADR-0XX - Title
Status: Proposed | Accepted | Superseded by ADR-0YY
Context: ...
Decision: ...
Alternatives considered: ...   (what else was possible and why not; ADR-001..013 predate this field - add it when you revisit them)
Consequences: ...
```
