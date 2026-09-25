# AI Agent Prompts — Marswalk Planner (full TODO coverage)

Ei file-e `docs/TODO.md`-er **proti task (T-0XX)-er jonno ekta prompt** ache — AI
coding agent-e (Claude Code, Copilot CLI, Cursor, e.t.c.) diye kaj korano jonno.

## Eta pore full project complete hoye jabe na — keno

1. **Kichu kaj purapuri human-only.** Team registration, challenge page pora,
   demo rehearse kora, video record kora, submit kora — ei gulo kono prompt
   diye hoy na. Nichey "Human-only" table-e alada dewa ache, oigulo tumi nijei
   koro.
2. **Kichu kaj-e AI-r output tomar nijer check lage.** Science target-er
   rationale, data license, source-er trustworthiness — AI bhul-o bolte pare.
   "Verify" lekha prompt-gulo-o final call tomar.
3. **Ek shathe shob prompt dio na.** Ekta dao -> output dekho -> `npm run check`
   chalao -> thik thakle porerta dao. Ek shathe 30-ta dile agent context hariye
   fele bhul kaj korte pare.
4. **Agent bhul korbei kokhono kokhono.** Ei jonno proti Phase-er shesh-e ekta
   "Review prompt" deya ache — seta bad dio na.
5. **`docs/TODO.md`-o nijei perfect na.** Ekbar SRS.md-er proti FR/NFR-er
   acceptance criteria diye TODO.md cross-check kore 5-ta gap paoa gelo
   (lon/lat hover, first-load speed, responsiveness, data hash, bundle secret
   scan) — shegulo ADR-017-e record kore TODO.md-e T-018, T-043, T-044, T-045
   hishebe add kora hoyeche (ei file-e prompt-o ache). Mane: TODO.md-er shob
   box tick korleo, seta shudhu tokhoni "complete" jokhon proti SRS FR/NFR-er
   acceptance criteria (docs/SRS.md) shotti true hoy — checklist ta shudhu
   ekta tool, final proof na.

## Kivabe use korba

Proti prompt-er por:
```bash
npm run check    # typecheck + unit tests
```
Green na hole porerta dio na, age fix koro.

---

## Human-only tasks (kono prompt nai, nijei koro)

| ID | Kaj |
|---|---|
| T-000 | Team-er shathe kotha bole role decide, NASA Space Apps site-e register |
| T-003 (part) | Challenge-er Details/Resources/Submission tab nijer chokhe pora |
| T-032, T-064 | Demo tour nijer haate rehearse kora, offline-e test kora |
| T-060, T-061 | Projector-e test, video record, checklist-e sign-off |
| T-062 | Feature freeze-er deadline decide kora |

---

## Phase 0 — Decisions & verification

**T-001 — Data source verify**
```
Task: docs/TODO.md T-001. Open every URL/service in docs/DATA_SOURCES.md.
Confirm: exists, public without paid key, licence, and for tiles — exact
template + TMS vs XYZ/WMTS row order. If you cannot actually check a URL, say
so instead of marking it verified. Update docs/DATA_SOURCES.md status per
source, and src/config/layers.config.ts `tms` field to match (ADR-016). Touch
only these two files.
```

**T-002 — Site coordinates verify**
```
Task: docs/TODO.md T-002. Verify the bbox/centre in src/config/sites.config.ts
against an official gazetteer (USGS or the mission's own site page); cite the
source. If wrong, fix it there and in scripts/common.py (must match, ADR-006
convention: planetocentric, east-positive). If already correct, just confirm —
don't change anything.
```

**T-003 — Challenge analysis (after you've read the page yourself)**
```
Task: docs/TODO.md T-003. I'm pasting the challenge's Details/Resources/
Submission tab content below. Read docs/CHALLENGE_ANALYSIS.md's existing
structure first, then merge this new info into it without duplicating what's
already there. Flag anything that contradicts docs/SRS.md or docs/DECISIONS.md
instead of silently changing scope.

<paste the challenge page text here>
```

**T-004 — Fresh-clone check / CI**
```
Task: docs/TODO.md T-004. Simulate a fresh teammate: run `npm ci`, `npm run
check`, `npm run build` and `npm run dev` exactly as README.md's Quick Start
says, with no extra steps. Report anything that fails or needed an undocumented
step, and fix README.md or .github/workflows/ci.yml so it's accurate. Don't
change app code in this task.
```

---

## Phase 1 — Data pipeline

**T-010 — Fetch scripts for all sources**
```
Task: docs/TODO.md T-010. Read scripts/README.md and scripts/common.py first.
Implement scripts/01_fetch_data.py to download, for site {site-id}: DEM,
CTX/HiRISE imagery, CRISM mineralogy, THEMIS thermal inertia, the Mars 2020
traverse, and a MEDA conditions snapshot — one function per source, each
writing to data/raw/{site-id}/. Use the sources confirmed in T-001; if a
source isn't verified yet, make that function raise NotImplementedError with a
clear message instead of silently skipping it. No invented data.
```

**T-011 — DEM grid**
```
Task: docs/TODO.md T-011. Implement scripts/02_make_dem_grid.py: read the raw
DEM from data/raw/{site-id}/, resample/clip to the site bbox, and write
public/data/{site-id}/dem.json exactly matching docs/API_SPEC.md section 2
(schemaVersion, width, height, bbox, unit, base64 float32 data, full
provenance with synthetic:false, verified:true). No-data cells = NaN, never 0.
Run it and show me the output size and a few sample values.
```

**T-012 — Slope grid, cross-checked against the TS implementation**
```
Task: docs/TODO.md T-012. Add a slope-grid step (new script or inside
02_make_dem_grid.py — your call, tell me which) using the exact same
central-difference formula as slopeDegrees() in src/lib/geo/grid.ts. Add a
Python test using the same fixture values as tests/unit/slope.test.ts, so the
two implementations are checked against each other, not just against
themselves.
```

**T-013 — Roughness + thermal-inertia sand risk**
```
Task: docs/TODO.md T-013. Using the THEMIS thermal-inertia data fetched in
T-010 and the DEM, compute a roughness grid (local elevation variance) and a
sand-risk score per docs/SDD.md's hazard model. Document the exact formula and
any threshold you pick in docs/DECISIONS.md as a new ADR (per AGENTS.md
section 4 — ask me before finalizing thresholds you can't cite a source for).
```

**T-014 — Hazard grid**
```
Task: docs/TODO.md T-014. Combine slope (T-012), roughness/sand-risk (T-013)
into public/data/{site-id}/hazard.json, same schema style as dem.json. Write
the exact weighting formula in docs/SDD.md section 5.2, replacing the
"placeholder, slope-only" note. If you can't justify the weights with a
source, say clearly in the doc that they're an assumption, not measured.
```

**T-015 — Manifest + validation**
```
Task: docs/TODO.md T-015. Update scripts/04_build_manifest.py to list every
file in public/data/{site-id}/ with schemaVersion and provenance, and add a
validation pass (in the script or a separate check) that fails loudly if any
file is missing provenance or has an invalid bbox. Run it and paste the
resulting manifest.json.
```

**T-016 — Science targets (needs your own verification after)**
```
Task: docs/TODO.md T-016. Using {CRISM data / paper / source you name}, curate
3-5 science targets for {site-id} as public/data/{site-id}/targets.geojson,
matching the schema in docs/API_SPEC.md section 3 (parseTargets in
src/data/loaders/vectors.ts will reject anything missing a field). Each
target's rationale must cite what it's based on — one sentence, no invented
justification. List your sources separately so I can double-check them myself
before this goes in the demo.
```

**T-017 — Conditions snapshot**
```
Task: docs/TODO.md T-017. Build public/data/{site-id}/conditions.json from a
real MEDA (or REMS) reading, with an actual observedAt timestamp — never
"now()" at build time. Match the schema src/features/conditions/
conditionsService.ts expects. State which exact reading/sol you used.
```

**T-018 — Source hashes for reproducibility (NFR-05, ADR-017)**
```
Task: docs/TODO.md T-018. For every raw file downloaded in T-010 into
data/raw/{site-id}/, record its source version/date and a sha256 hash in
data/raw/{site-id}/SOURCES_LOCK.json. Then copy the matching hash and fetch
date into `sourceHash` / `fetchedAt` on that file's Provenance block wherever
it appears in public/data/{site-id}/. Leave sourceHash/fetchedAt absent (not
zero or "unknown") on anything you haven't hashed yet.
```

**Review prompt (run after Phase 1)**
```
List every file in public/data/{site-id}/. For each, print its provenance
block. Flag any file where synthetic:true or verified:false is still set —
those need my attention before Phase 2 depends on them.
```

---

## Phase 2 — Core app

**T-020 — Basemap + elevation tiles + lon/lat hover readout**
```
Task: docs/TODO.md T-020 (FR-01). VITE_TILE_BASEMAP_URL and
VITE_TILE_ELEVATION_URL are set in .env.local from T-001. Confirm both render
in src/features/map2d/MapView.tsx at the site's default view — run `npm run
dev` yourself, and if a tile layer doesn't load, tell me the exact error
(network, CORS, wrong tms flag) rather than just "it doesn't work". Also add
the lon/lat hover readout FR-01 requires but the scaffold never built: a small
on-map label that updates on mousemove, in the same east-positive convention
as the rest of the app (ADR-006).
```

**T-021 — Layer panel + legends**
```
Task: docs/TODO.md T-021 (FR-02). Finish src/features/layers/LayerPanel.tsx:
every layer in src/config/layers.config.ts needs a visible legend (colour
scale or symbol key) matching its actual rendering, not a generic one. Pull
colours from src/styles/tokens.css only — no hard-coded hex in the component.
```

**T-022 — GeoJSON layers styled**
```
Task: docs/TODO.md T-022 (FR-03). Render traverse.geojson, targets.geojson and
mineralogy.geojson on the 2D map with distinct styling per layer (see
tokens.css for the palette). Reuse the parsing in src/data/loaders/vectors.ts
— don't re-implement GeoJSON parsing in the map component.
```

**T-023 — Grid layers as canvas overlay**
```
Task: docs/TODO.md T-023. Render the slope and hazard grids (from T-012/T-014)
as a colour-mapped canvas overlay on the Leaflet map, aligned to their bbox.
Keep the canvas-drawing code in a new file under src/features/map2d/ — tell me
the filename you chose before writing it (AGENTS.md "where things go").
```

**T-024 — Finish the integrated inspector**
```
Task: docs/TODO.md T-024. The scaffold is in src/features/inspector/. Wire it
to the real data from Phase 1 instead of synthetic. Add mineralogy and
terrain-unit lookup (point-in-polygon against mineralogy.geojson) to
summarizeLocation() in locationSummary.ts, and show the DEM's own provenance
in InspectorPanel.tsx (it's currently dropped by the grid loader — fix that
too). Also make clicking a target on the map set selectedTargetId in the
store. Add unit tests for the new point-in-polygon logic.
```

**T-025 — Route start/destination picking**
```
Task: docs/TODO.md T-025 (FR-04). Let me pick start and destination by
clicking the 2D map — reuse the click handling already in MapView.tsx and
features/inspector, don't duplicate it. Call planRoute() from
src/features/routing/planner.ts and draw the result. If you think this needs a
new dependency or top-level folder, stop and ask me first (AGENTS.md section 4).
```

**T-026 — Route stats + elevation profile**
```
Task: docs/TODO.md T-026 (FR-05). Add distance/time stats and an elevation
profile chart to RoutePanel.tsx for the currently planned route. Before adding
a charting library, check package.json — if nothing suitable is already a
dependency, ask me before installing one (AGENTS.md section 4).
```

**T-027 — Conditions panel on real data**
```
Task: docs/TODO.md T-027 (FR-07). Point src/features/conditions/
conditionsService.ts at public/data/{site-id}/conditions.json (T-017).
Confirm the UI shows "latest available" with the observation time and age —
never the word "live" anywhere (AGENTS.md section 3 rule 3).
```

**T-028 — Marswalk plan + go/no-go**
```
Task: docs/TODO.md T-028 (FR-08). In src/features/marswalk/marswalkPlan.ts,
build a go/no-go checklist from the planned route's hazard exposure, EVA
duration budget (from costModel.ts) and current conditions. List every
assumption used (speed, slope limit, EVA duration) in the UI with its source,
per AGENTS.md section 3 rule 4 — don't hide them in code comments only.
```

**T-029 — Export plan**
```
Task: docs/TODO.md T-029 (FR-12). Add a "Export plan" action that downloads
the current route + plan + assumptions as JSON (schema: tell me what you
propose before writing it), plus a print-friendly view (CSS @media print).
```

**Review prompt (run after Phase 2)**
```
Go through FR-01 to FR-08 in docs/SRS.md one by one. For each, tell me: done,
partially done (what's missing), or not started. Don't mark anything "done" I
haven't seen working in the browser myself.
```

---

## Phase 3 — 3D and polish

**T-030 — 3D terrain from real DEM**
```
Task: docs/TODO.md T-030 (FR-09). Point src/features/view3d/Terrain.tsx at the
real dem.json instead of synthetic data, and keep the route line
(src/features/routing) in sync between the 2D and 3D views via the shared
store.
```

**T-031 — Astronaut avatar**
```
Task: docs/TODO.md T-031 (FR-09/15). Add a walking astronaut avatar in the 3D
view that follows the planned route, with camera-follow. If using a GLB model,
confirm its licence with me before adding it (AGENTS.md section 4 — unknown
licence 3D assets are a hard stop). A simple primitive-based avatar is fine if
no licensed model is available.
```

**T-032 — Guided demo tour (build the code; you rehearse it yourself)**
```
Task: docs/TODO.md T-032 (FR-11). Build a "Start demo tour" button that
auto-plays: fly to the site, show layers turning on, plan a route, open the
inspector on a target, show the plan. Keep it under 3 minutes and skippable at
any step. I'll rehearse the actual timing myself.
```

**T-033 — Accessibility pass**
```
Task: docs/TODO.md T-033 (NFR-02). Check keyboard navigation (tab order, can
every panel and the map click-equivalent be reached without a mouse?), colour
contrast against tokens.css, and self-host the fonts in src/styles instead of
loading them from a CDN. List what you changed and what's still not
keyboard-reachable.
```

**T-034 — Empty/error states**
```
Task: docs/TODO.md T-034 (NFR-04). Temporarily rename or delete each file
under public/data/{site-id}/ one at a time, run the app, and confirm each
panel shows an explicit "no data" state instead of crashing or showing stale
values. Restore the files after. Report any panel that breaks.
```

---

## Phase 4 — Hardening

**T-040 — Replace RoutePanel placeholders**
```
Task: docs/TODO.md T-040. src/features/routing/RoutePanel.tsx has hard-coded
hazard/science placeholder inputs (from the original scaffold). Replace them
with the real hazard.json and targets.geojson data now that Phase 1 is done.
```

**T-041 — Move A* to a worker if slow**
```
Task: docs/TODO.md T-041 (NFR-01). Time planRoute() on the real DEM grid for
{site-id}. If it's over 2 seconds, move it into src/features/routing/
routing.worker.ts (Web Worker) so it doesn't block the UI thread; if it's
under 2 seconds, tell me the measured time and leave it as is — don't add
worker complexity that isn't needed.
```

**T-042 — Test coverage**
```
Task: docs/TODO.md T-042. Add unit tests under tests/unit for: costModel.ts,
the plan-budget logic in marswalkPlan.ts, every loader in src/data/loaders,
and a provenance validator (a function that checks a Provenance object has all
required fields — extract this from data/loaders/vectors.ts's isProvenance if
it doesn't already exist as a standalone testable function).
```

**T-043 — First-load performance + 3D code-split (NFR-01, ADR-017)**
```
Task: docs/TODO.md T-043. Run `npm run build` and measure first-load time
(Lighthouse, or vite's own build report) for the 2D view without the 3D code
loaded. If it's over 3 seconds, wrap the 3D view (src/features/view3d) in
React.lazy + Suspense so it's a separate chunk loaded only when the user
switches to 3D. Report the before/after numbers.
```

**T-044 — Responsiveness check (NFR-03, ADR-017)**
```
Task: docs/TODO.md T-044. Test the app at 1280px width (primary target) and
at a phone-size viewport (best-effort only — don't over-invest here). List
anything that overlaps, overflows, or becomes unusable at either size, and fix
the ones at 1280px; for phone-size, just tell me what's broken so I can decide
if it's worth fixing before the deadline.
```

**T-045 — Bundle secret scan (NFR-07, ADR-017)**
```
Task: docs/TODO.md T-045. Run `npm run build`, then search dist/ for anything
that looks like a secret or API key (not a VITE_* public var). Confirm
.env.local itself is git-ignored and was never committed. Report what you
found — if nothing, say so explicitly rather than skipping this silently.
```

**T-050 — Replace assumption values**
```
Task: docs/TODO.md T-050. List every numeric assumption currently in
costModel.ts / marswalkPlan.ts (walking speed, slope limits, EVA duration,
etc.) alongside ADR-007 in docs/DECISIONS.md. For each, tell me if you found a
citable NASA/EVA-standard source; if yes, propose the replacement value and
source; if no, leave it but make sure the UI still clearly labels it as an
assumption.
```

**T-051 — (Could-have, only if time allows)**
```
Task: docs/TODO.md T-051. This is a Could-have (FR-13 route comparison and/or
FR-14 AI explainer) — only start this after every Must (FR-01..FR-08) and
Should is done and demo-rehearsed. Propose a small scope for whichever one you
pick before writing code.
```

---

## Phase 5 — Submission

**T-063 — Credits/attribution page**
```
Task: docs/TODO.md T-063. Build a Credits page/panel listing every dataset and
asset used, pulled from the provenance blocks already in public/data/ (don't
hand-type it — read it from the manifest so it can't drift out of sync).
```

**Final review prompt (run before you touch T-060/T-061/T-062/T-064 yourself)**
```
Run npm run check and npm run build. Go through docs/SUBMISSION_CHECKLIST.md
item by item and tell me, honestly, which are done, which are partial, and
which you haven't verified at all (don't guess — say "not verified" if you
didn't actually check). List every place in the app or docs that still says
"synthetic", "placeholder", "unverified" or "TODO".
```
