# SDD - Software Design Description

How the requirements are realised. Structure/tech decisions: `ARCHITECTURE.md`, `DECISIONS.md`.

## 1. Design principles
1. **Decision support over decoration.** Every UI element answers "does this help plan a Marswalk?"
2. **Provenance everywhere.** Data never appears without mission/instrument/resolution/date/derived/synthetic/verified.
3. **Fail visibly, never silently invent.** Missing data -> explicit empty state.
4. **One registry, one source of truth** for layers (`config/layers.config.ts`), sites, profiles, tokens.
5. **2D is the planning tool; 3D is the communication tool.**

## 2. UI layout
```
+--------------------------------------------------------------------------+
| Marswalk Planner   [Site v]                        [2D map] [3D view]    |
+----------------+--------------------------------------+------------------+
| LAYERS         |                                      | CONDITIONS       |
| [x] imagery    |            MAP / 3D STAGE            |  latest, age     |
| [ ] elevation  |   route, targets, traverse, hazards  | ROUTE            |
| [x] traverse   |                                      |  profile, stats  |
| ... provenance |    scale bar / lon-lat readout       | SELECTED TARGET  |
| badges         |                                      | MARSWALK PLAN    |
+----------------+--------------------------------------+------------------+
```
Left = what data is on; centre = where; right = what it means for the walk. Left-aligned text; data in monospace.

## 3. Module design

| Module | Responsibility | Key files |
|---|---|---|
| layers | registry, toggles, opacity, legend | `config/layers.config.ts`, `features/layers/*` |
| map2d | Leaflet map (lon/lat CRS), layer rendering | `features/map2d/MapView.tsx` |
| view3d | terrain mesh, route line, astronaut | `features/view3d/*` |
| routing | cost model, A*, profiles, worker | `features/routing/*`, `workers/routing.worker.ts` |
| science | targets, science value | `features/science/*` |
| inspector | integrated point summary on map click (FR-06) | `features/inspector/*`, `data/loaders/vectors.ts`, `hooks/useSiteVectors.ts` |
| conditions | latest snapshot + freshness | `features/conditions/*` |
| marswalk | plan, budget, checklist, export | `features/marswalk/*` |
| provenance | badges + source links | `features/provenance/*` |
| data | loaders (only place that fetches) | `data/loaders/*` |
| lib | pure math: haversine, grid, slope, heap | `lib/*` |
| state | global UI/route state (zustand) | `state/store.ts` |

## 4. Coordinates and units
Planetocentric, **east-positive longitude**, latitude degrees; distances in metres; time in minutes for UI, seconds internally; elevation in metres relative to the Mars datum of the source DEM (record which). Great-circle distance uses R = 3,389,500 m. Grids are row-major with **row 0 = north**. Never mix planetographic and planetocentric (ADR-006).

## 5. Algorithms
### 5.1 Slope
Central differences on the DEM with metric cell size (`cellSizeM`); `slope = atan(|grad|)`.
### 5.2 Hazard (0..1)
`hazard = clamp(a*slopeNorm + b*roughnessNorm + c*sandRisk)` with sandRisk from THEMIS thermal inertia (low inertia ~ loose fines). Weights a,b,c are tunable and written into the output provenance. **Placeholder today: slope only** (T-040).
### 5.3 Science value (0..1) per target
`0.5*mineralogy + 0.3*geologic context + 0.2*proximity to prior rover samples`, documented per target in `rationale`. Targets come from data files, never hard-coded.
### 5.4 Route cost
8-connected A* on the grid. Step cost = horizontal distance x `stepCostFactor`:
`factor = 1 + wSlope*over^2 + wHazard*hazard - wScience*0.5*science`, where `over = (slope - caution)/(max - caution)` clipped at 0; slope > max is impassable; factor floor 0.2 keeps the heuristic (0.2 x Euclid) admissible. Profiles: fastest / safest / science-rich (`costModel.ts`).
### 5.5 Time model
`speed = base * max(0.3, 1 - slope/(2*maxSlope))`; time = sum(3D segment length / speed). **Assumption, not validated.**
### 5.6 Plan budget
`total = 2 x walkTime + stops x minutesPerStop`; usable EVA = `maxEva * (1 - reserve%)`. Defaults 480 min / 25 % are placeholders (ADR-007).

### 5.7 Point inspection
`summarizeLocation` (pure) takes the clicked point, the DEM grid + derived slope grid, the targets and the traverse vertices. Elevation and slope come from the cell under the point and only if the point is inside the grid bbox (never clamped to the edge); NaN cells are "no data". Nearest target and nearest traverse **vertex** use great-circle distance (a sparse traverse line is not interpolated, so the distance is to the recorded point, not to the line). Every absent input is reported as absent, not zero.

## 6. 3D design
### 6.1 Scene
Heightfield mesh from the same DEM grid as routing (single source of truth), vertical exaggeration x4 (always displayed), low sun directional light, dusty sky, orbit controls.
### 6.2 Coordinate mapping
`toWorld(grid, lonlat, elev)`: x = east, z = south, y = up; horizontal extent normalised to 100 units.
### 6.3 Astronaut avatar
Procedural (capsules/sphere/box) so no asset is required; walks the route polyline with limb swing; scaled for visibility, so the UI states "not to scale".
### 6.4 Using a real model
Put `public/models/astronaut.glb`, load with drei `useGLTF`, keep the same `path/speed/height` props. Use only models whose licence allows it (NASA-created media is generally reusable but check each item's usage note); record source + licence in `DATA_SOURCES.md`.
### 6.5 Camera modes
Orbit (MVP), follow (S), first-person at eye height (C, FR-15).

## 7. Visual design tokens (`styles/tokens.css`)
| Token | Value | Use |
|---|---|---|
| basalt 900/800/700/500 | #141b25 / #1c2532 / #263244 / #4a5a72 | backgrounds, panels, borders |
| dust 100/300 | #f1e6d9 / #cbb9a6 | text |
| route | #5cc8d7 | planned route, focus ring |
| science | #e5a94d | science targets |
| hazard | #e0523f | hazards / blocked / warnings |
| ok | #6fbf8f | within budget |
Type: **Atkinson Hyperlegible** (UI, chosen for legibility under stress) + **JetBrains Mono** (measured data). Self-host the fonts in `public/` before submission (system fallbacks are set). Colour is never the only carrier of meaning (icons/labels too). Spend visual boldness on ONE thing: the route-on-terrain moment (map and 3D).

## 8. States and errors
| Situation | Behaviour |
|---|---|
| Tile URL missing/unreachable | Notice in map; other layers keep working |
| Data file missing | Layer shows "no data"; manifest entry null |
| No route (blocked) | "No route within limits" + which limit blocks |
| Synthetic data | Persistent SYNTHETIC badge + notice |
| Stale conditions | Freshness badge and age; text never says "live" |
| Click outside the terrain grid | "Outside the loaded terrain grid: elevation and slope are unknown here" |
| Target in a data file has no provenance / bad fields | Dropped by `parseTargets`, never shown |

## 9. Copy rules
Sentence case, plain verbs, specific errors ("No conditions file for jezero-delta"), sources named, units always shown, no exclamation marks.

## 10. Testing strategy
Unit (vitest): haversine, slope, A*, cost model, plan budget. Fixture grids in `tests/fixtures`. Manual: demo script (FR-11). Data checks: provenance present on every file; bbox inside site bbox.
