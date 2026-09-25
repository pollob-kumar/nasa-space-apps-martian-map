# MERGE_NOTES

Two scaffolds were generated for the same challenge. This repo is the first one ("A": static React + TypeScript, client-side A* planner, provenance system) with selected parts of the second ("B": FastAPI backend + React/JS frontend) merged in. Decision record: `DECISIONS.md` ADR-014 to ADR-016.

## Taken from B (and how)
| From B | Now here | Changed how |
|---|---|---|
| "Click a point, get one integrated summary" (`/locations/{lat}/{lon}/summary`) | `src/features/inspector/`, `data/loaders/vectors.ts`, `hooks/useSiteVectors.ts` (ADR-015) | Client-side, from static data; no invented values (B's version returned fabricated elevation and a fixed slope) |
| Mermaid diagram + layer table | `ARCHITECTURE.md` 1a, 1b | Redrawn for this architecture; table lists what `MapView` really draws today |
| ADR "Alternatives considered" field | `DECISIONS.md` template + ADR-014..016 | Added to the template; ADR-001..013 not rewritten |
| Mars Trek tile URL | `DATA_SOURCES.md` section 7, commented line in `.env.example` | Re-labelled as an unverified **elevation** candidate (B used it as basemap with a wrong credit); not enabled by default |
| Offline-demo requirement | SRS NFR-10, TODO T-064, checklist | New wording |
| "Runs from the README alone" acceptance check | `SUBMISSION_CHECKLIST.md` | New wording |

## Deliberately not taken
FastAPI backend, Docker Compose (B's referenced a `frontend/Dockerfile` that did not exist), per-source Python services, `source: live|sample` response flag (A's `synthetic` / `verified` provenance flags cover it), B's placeholder sample fixtures (fake tile URLs, invented terrain), B's straight-line route service, JS-only frontend, `example-tiles.invalid` URLs.

## Also changed in A
- `LayerDef.tms` (ADR-016): `MapView` used to force `tms: true`; the only candidate source we know is WMTS, which needs `false`.
- `ScienceTargetPanel targets={[]}` left as it was: nothing sets `selectedTargetId` yet (part of T-024).

## Known limits of this merge
- No real data exists yet, so the inspector shows synthetic terrain (badged) and "no data" rows.
- Nearest-traverse distance is to the nearest recorded vertex, not to the line.
- Map clicks are mouse/touch only; a keyboard route to select a point is not built (NFR-02 gap).
- Verification level: see README "Status (honest)".
