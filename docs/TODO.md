# TODO

Dates: today ~ Sep 25, 2026; hackathon **Nov 14-15, 2026** (verify). Work top-down; one task at a time; tick here and note deviations in DECISIONS.md. IDs match SRS where relevant.

## Phase 0 - Decisions and verification (week 1)

- [ ] T-000 Team confirms ADR-001 scope and roles; register team on the Space Apps site (max 6)
- [x] T-001 **Verify every data source**: open each URL in `DATA_SOURCES.md`, confirm licence/CORS/tile template; set `verified` flags; fill `VITE_TILE_*`. Includes the Mars Trek candidate in DATA_SOURCES section 7 (does it still serve tiles? is `tms:false` right? which layer does it belong to?)
- [x] T-002 Verify site coordinates/bbox against official gazetteer; confirmed the Jezero/Gale centre + bbox values are consistent with the official NASA mission-site context; no config change required
- [x] T-003 Read the official challenge Details/Resources/Submission tabs; paste extras into `CHALLENGE_ANALYSIS.md`
- [x] T-004 `npm ci && npm run dev` works for every teammate; CI green

## Phase 1 - Data pipeline (weeks 2-3)

- [x] T-010 Implement `01_fetch_data.py` for DEM, imagery/tiles, CRISM, THEMIS, traverse, MEDA
- [x] T-011 `02_make_dem_grid.py` on real DEM -> `dem.json` (with provenance)
- [x] T-012 Slope grid (match TS `slopeDegrees`; cross-check test)
- [x] T-013 Roughness + thermal-inertia sand risk
- [x] T-014 Hazard grid with documented weights
- [x] T-015 `04_build_manifest.py` + validation (provenance present, bbox valid)
- [x] T-016 Curate 3-5 science targets from real CRISM/geology info with rationale + sources
- [x] T-017 Conditions snapshot from MEDA (or REMS) with timestamp
- [x] T-018 Record each raw source file's version/fetch date + sha256 hash (e.g. `data/raw/{site}/SOURCES_LOCK.json`); copy into `sourceHash`/`fetchedAt` on the matching `Provenance` (NFR-05, ADR-017)

## Phase 2 - Core app (weeks 3-5)

- [ ] T-020 Basemap + elevation tiles render, including the pan/zoom scale bar and east-positive lon/lat hover readout (FR-01). Hover readout is implemented. Elevation URL responds with HTTP 200 JPEG/CORS, but is opt-in by default; basemap verification is blocked because `.env.local` has an empty `VITE_TILE_BASEMAP_URL`.
- [x] T-021 Layer panel complete incl. per-layer legends (FR-02)
- [ ] T-022 GeoJSON layers styled: traverse, targets, mineralogy (FR-03). Map wiring uses the strict vector loaders, but `public/data/jezero-delta/traverse.geojson` and `mineralogy.geojson` are not present in this checkout, so those layers remain no-data until their source files are supplied.
- [x] T-023 Grid layers (slope, hazard) rendered as bbox-aligned canvas overlays
- [x] T-024 Integrated target panel: elevation/slope/mineral/rover/provenance (FR-06). Uses real DEM provenance, target/traverse/mineralogy loaders, point-in-polygon lookup, and target selection state. Missing source files remain explicit no-data states.
- [x] T-025 Route UI: pick start/destination(s) on map (FR-04)
- [ ] T-026 Route stats + elevation profile chart (FR-05)
- [ ] T-027 Conditions panel on real snapshot (FR-07)
- [ ] T-028 Marswalk plan + go/no-go checklist + assumptions list (FR-08)
- [ ] T-029 Export plan JSON + print view (FR-12)

## Phase 3 - 3D and polish (weeks 5-6)

- [ ] T-030 3D terrain from real DEM; route line synced (FR-09)
- [ ] T-031 Astronaut avatar walk, camera follow; optional GLB (FR-09/15)
- [ ] T-032 Guided 3-minute demo tour (FR-11)
- [ ] T-033 Accessibility pass (NFR-02); self-host fonts
- [ ] T-034 Empty/error states verified with data removed (NFR-04)

## Phase 4 - Hardening

- [ ] T-040 Replace placeholder hazard/science inputs in `RoutePanel` with real layers
- [ ] T-041 Move A* to `routing.worker.ts` if > 2 s (NFR-01)
- [ ] T-042 Tests: cost model, plan budget, loaders, provenance validator
- [ ] T-043 Measure first load time (Lighthouse or `vite build --profile`); code-split the 3D view (`view3d/`) behind `React.lazy` if it's pulling load over 3 s (NFR-01, ADR-017)
- [ ] T-044 Test at 1280px laptop width (primary) and on a phone-size viewport (best-effort); fix any broken breakpoint (NFR-03, ADR-017)
- [ ] T-045 `npm run build`, then grep `dist/` for anything that looks like a secret/API key; confirm only `VITE_*` public vars made it into the bundle (NFR-07, ADR-017)
- [ ] T-050 Replace ADR-007 assumptions with cited values or keep clearly labelled
- [ ] T-051 (Could) route comparison FR-13; (Could) AI explainer FR-14

## Phase 5 - Submission (Nov 1-15)

- [ ] T-060 Deploy static build; test on projector resolution
- [ ] T-061 Complete `SUBMISSION_CHECKLIST.md`; record demo/video if required
- [ ] T-062 Freeze features 48 h before; only bug fixes
- [ ] T-063 Credits/attribution page for all datasets and assets
- [ ] T-064 Rehearse the whole demo offline (airplane mode): tiles and data cached or vendored (NFR-10)
