# SRS - Software Requirements Specification

Priority: **M**ust / **S**hould / **C**ould. IDs are stable; reference them in commits and TODO.md.

## 1. Purpose and scope
A web app that gives a Mars explorer an integrated, layered view of one Martian location/route built from multiple NASA missions, to plan and carry out a Marswalk. Context: `PROJECT_CONTEXT.md`.

## 2. Actors
Explorer/planner (primary). Judge/reviewer (secondary). Developer/AI agent (maintains). No accounts, no login.

## 3. Functional requirements

| ID | P | Requirement | Acceptance criteria |
|---|---|---|---|
| FR-01 | M | 2D map of the chosen site with pan/zoom, scale bar, lon/lat readout | Opens on Jezero; scale bar in metres; coordinates shown on hover |
| FR-02 | M | Layer manager: toggle, opacity, group, legend | Every layer in `layers.config.ts` appears; toggle updates map <200 ms |
| FR-03 | M | >= 6 layers from >= 3 distinct NASA missions: imagery, elevation, slope, mineralogy, traverse, science targets (+ hazards, thermal inertia) | `missionsInUse().length >= 3`; each layer opens on real (not synthetic) data before submission |
| FR-04 | M | Route planning between start and destination(s) with profiles fastest / safest / science-rich | Route drawn on map; different profiles produce different routes on real data; blocked when slope > profile limit |
| FR-05 | M | Route details: distance, elevation profile, max/avg slope, est. walk time, hazards crossed, stops | Numbers match a hand-check on a fixture route (tests) |
| FR-06 | M | Integrated destination panel: click a target/point -> location, elevation, slope, terrain unit, mineralogy, nearest rover data, science rationale, provenance | One click shows all fields; missing fields say "no data", never blank or invented |
| FR-07 | M | Conditions panel: latest available conditions with observation time, sol, age, source | Shows freshness badge (recent/stale/archival); no "live" wording anywhere |
| FR-08 | M | Marswalk plan: ordered stops, walk + science time vs assumed EVA budget, go/no-go checklist | Over-budget plans are flagged; assumptions listed in UI |
| FR-09 | S | 3D view: terrain mesh + astronaut avatar walking the planned route; orbit camera | Same site/route as 2D; exaggeration + "not to scale" notice; >= 30 fps on a mid laptop |
| FR-10 | M | Provenance and honesty: badges on layers/values; synthetic/unverified flags; source links | No layer without provenance; synthetic data visibly labelled |
| FR-11 | S | Guided 3-minute demo tour for judges | Steps: layers -> click target -> plan route -> conditions -> 3D |
| FR-12 | S | Export plan (JSON + printable summary) | File contains route, stops, assumptions, sources, timestamp |
| FR-13 | C | Compare two route profiles side by side | Table of distance/time/max slope/science value |
| FR-14 | C | Optional grounded AI explainer ("why this route?") | Only cites app data; refuses to invent values (phase 2) |
| FR-15 | C | First-person 3D "Marswalk" camera | Camera follows avatar eye height |

## 4. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 Performance | First load < 3 s on broadband (3D code-split); route compute < 2 s for a 512x512 grid (worker if slower) |
| NFR-02 Accessibility | Keyboard operable, visible focus, contrast >= 4.5:1, reduced-motion respected, not colour-only meaning |
| NFR-03 Responsiveness | Usable on a 1280 px laptop (primary) and a projector; mobile is best-effort |
| NFR-04 Reliability | Missing data never crashes the UI; every loader returns null and the UI explains |
| NFR-05 Reproducibility | `scripts/` regenerates all `public/data` from raw sources; versions and hashes recorded |
| NFR-06 Compliance | NASA/USGS/other credits shown; asset licences recorded in DATA_SOURCES.md |
| NFR-07 Security | No secrets in client bundle; only `VITE_*` public vars |
| NFR-08 Maintainability | TS strict, `npm run check` green, feature folders, ADRs for structural changes |
| NFR-09 Honesty | No claim of live data, validated EVA limits, or verified coordinates without evidence |
| NFR-10 Demo reliability | The judged demo runs with no internet (tiles and data cached or vendored); rehearse it in airplane mode (T-064). Event Wi-Fi is not something to depend on |

## 5. Constraints and assumptions
- Static hosting only for MVP (ADR-002). Hackathon time-box (Nov 14-15, 2026).
- Coordinates, tile URLs and dataset product names are unverified until T-001/T-002.
- Suit walking speed, slope limits and EVA duration are assumptions (ADR-007).

## 6. Traceability (challenge idea -> requirements)

| Challenge idea | Requirements |
|---|---|
| layered | FR-02, FR-03 |
| integrated | FR-06, FR-03 |
| multiple NASA missions | FR-03, FR-10 |
| routes (details) | FR-04, FR-05 |
| destinations | FR-06 |
| current conditions | FR-07 |
| quickly and safely | FR-04 (profiles), FR-08 |
| plan and carry out a Marswalk | FR-08, FR-12, FR-09 |
| new and exciting science | FR-04 (science profile), FR-06 |
| human explorer | whole UX, FR-08 |

## 7. Out of scope
Whole-planet map, Earth data, multiplayer, accounts, live telemetry, orbital mechanics, validated suit engineering.
