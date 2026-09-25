# Marswalk Planner (working title)

Layered, integrated Mars surface map that combines data from multiple NASA missions to help a future astronaut plan and carry out a Marswalk.
NASA Space Apps 2026 - challenge **Interplanetary Survival Guide: Martian Map**.

## Quick start

```bash
npm ci
npm run dev          # http://localhost:5173
npm run check        # typecheck + unit tests
npm run build        # production build -> dist/
```

Without real data the app runs with **synthetic terrain** (clearly labelled) and layers that have no tile URL or data file show a notice.
To get real layers: follow `docs/TODO.md` Phase 0-1 (verify sources, set `VITE_TILE_*` in `.env.local`, run `scripts/`).

## What is in the toolkit

| Path        | Purpose                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md` | rules that keep AI agents (and people) on track - read first                                                                                      |
| `docs/`     | PROJECT_CONTEXT, CHALLENGE_ANALYSIS, SRS, SDD, ARCHITECTURE, API_SPEC, DATABASE, DECISIONS, TODO, DATA_SOURCES, SUBMISSION_CHECKLIST, MERGE_NOTES |
| `src/`      | React + TypeScript app: 2D Leaflet map (click a point -> inspector), 3D scene with astronaut avatar, routing, conditions, plan                    |
| `scripts/`  | Python data pipeline skeleton (NASA products -> small static files)                                                                               |
| `public/`   | static files: `data/` (processed), `models/` (optional astronaut GLB), `textures/`                                                                |
| `tests/`    | vitest unit tests (haversine, slope, A* planner)                                                                                                  |
| `data/`     | raw/interim downloads (gitignored)                                                                                                                |
| `server/`   | optional phase-2 backend (not needed for MVP)                                                                                                     |

## Status (honest)

- The original scaffold reported a passing typecheck, unit tests and production build; **re-run `npm ci && npm run check && npm run build` on your machine first** - the merge below was made in a sandbox with no npm registry access.
- Checked in the merge sandbox: `tsc` under this repo's strict flags over `src/` and `tests/` (React, Leaflet, zustand and three types were replaced by loose stubs, so those call sites were only lightly checked) and all 19 unit tests (5 original + 14 new) run under Node type-stripping with a small vitest stand-in.
- **Not verified:** `npm ci`, real vitest, `vite build`, browser behaviour (including the new click-to-inspect and marker), all data-source URLs/tile templates, site coordinates, Python scripts against real data, EVA assumptions.
- No real data files exist yet: the app runs on labelled synthetic terrain, and layers without a URL/file show a notice. See `docs/TODO.md` Phase 0-1.
- What was merged from the second scaffold and why: `docs/MERGE_NOTES.md`.

## Docs map

Start with `docs/PROJECT_CONTEXT.md`, then `docs/TODO.md`. Data credits: `docs/DATA_SOURCES.md`.
