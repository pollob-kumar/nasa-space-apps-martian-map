# AGENTS.md - rules for AI coding agents (and humans)

You are helping build **Marswalk Planner** for the NASA Space Apps 2026 challenge *Interplanetary Survival Guide: Martian Map*. Follow this file exactly. If something here conflicts with your instinct, this file wins. If two docs conflict, stop and ask.

## 1. Read order (before writing any code)
1. `docs/PROJECT_CONTEXT.md` (what/why) -> 2. `docs/SRS.md` (requirements) -> 3. `docs/ARCHITECTURE.md` + `docs/SDD.md` (how) -> 4. the specific doc for your task (`API_SPEC`, `DATABASE`, `DATA_SOURCES`) -> 5. `docs/DECISIONS.md` -> 6. `docs/TODO.md` (pick the task).

## 2. North star and the project test
Every change must help a **human astronaut plan and carry out a Marswalk** using **layered, integrated data from multiple NASA missions**. Before adding a feature ask: Mars surface? real NASA data? several layers integrated? useful to an explorer? helps route/destination/conditions/science? real decision value? If the answers are "no", do not build it; note it in TODO under "Could".

## 3. Non-negotiables
1. **Data honesty.** Never invent data, coordinates, science targets, or measurements. Placeholder/test data must have `synthetic: true` and be visibly labelled in the UI. Unchecked sources/values have `verified: false`.
2. **Provenance everywhere.** Every layer and every displayed value carries mission, instrument, product, resolution/date, source URL, processed?, synthetic?, verified? (`Provenance` in `src/types`).
3. **No "live" claims.** Conditions are "latest available" with observation time and age.
4. **EVA numbers are assumptions.** Speeds, slope limits, EVA duration live in `costModel.ts` / `marswalkPlan.ts`, are shown in the UI, and change only with a cited source + ADR.
5. **Mars only.** Planetocentric, east-positive longitude, Mars radius 3,389,500 m (ADR-006). Grid row 0 = north.
6. **Multiple missions.** Keep `missionsInUse().length >= 3` true; never remove a mission's layer without telling the human.
7. **2D map is the product; 3D and AI support it.** Do not let 3D/AI work delay core map/route/conditions.
8. **Missing data is a state, not an error.** Loaders return `null`; the UI shows an explicit empty state. Never crash, never fake.

## 4. Hard stops - ask the human first
- Adding a dependency, changing the stack, or changing folder structure (needs an ADR, ADR-013).
- Changing an *Accepted* ADR, a requirement ID, or the scope (Jezero, ADR-001).
- Anything needing secrets, paid services, or licences you cannot verify.
- Downloading large data, or using a 3D model/texture/font with unknown licence.
- Deleting files you did not create.

## 5. Where things go
| You are adding... | Put it in |
|---|---|
| a map layer | one entry in `src/config/layers.config.ts` (+ data file in `public/data/<site>/`) |
| a site | `src/config/sites.config.ts`, `scripts/common.py`, manifest |
| a route profile / cost weights | `src/features/routing/costModel.ts` |
| pure math (geo, units) | `src/lib/**` (no React, no fetch, no three.js) |
| any `fetch` | `src/data/loaders/**` only |
| three.js code | `src/features/view3d/**` only |
| global UI state | `src/state/store.ts` |
| colours / spacing | `src/styles/tokens.css` (no hard-coded hex in components) |
| a data-prep step | `scripts/NN_name.py` |
| a per-point question ("what do we know here?") | `src/features/inspector/locationSummary.ts` (pure) |
| parsing a data file into domain types | `src/data/loaders/vectors.ts` |
| a decision | new ADR in `docs/DECISIONS.md` (with "Alternatives considered") |

## 6. Code conventions
- TypeScript strict; **no `any`**, no `@ts-ignore`; prefer small pure functions; JSDoc units on every numeric parameter.
- Import with `@/` alias. Feature folders do not import each other's internals; share via `types/` or `state/`.
- Components: function components + hooks; no HTML `<form>` submit reliance; keyboard-accessible controls; visible focus; do not convey meaning by colour alone.
- Naming: files `camelCase.ts` / `PascalCase.tsx`; ids kebab-case; constants UPPER_SNAKE.
- Comments explain *why* and cite sources for numbers.
- No `localStorage` of user data unless documented in DATABASE.md.

## 7. Workflow per task
1. Pick ONE task from `docs/TODO.md` (top-most unchecked in the current phase). State which requirement ID it serves.
2. Plan in <= 5 lines. Make the smallest change that satisfies the acceptance criteria in `SRS.md`.
3. Add/adjust tests in `tests/unit` for logic you touch.
4. Run `npm run check` (typecheck + tests) and `npm run build`. Fix everything you broke. Do not weaken tests to pass.
5. Update `docs/TODO.md` (tick) and any doc that your change made wrong (SRS/SDD/API_SPEC/DATABASE/DECISIONS).
6. Report: what changed, files touched, how verified, what is still unverified.

## 8. Definition of done
Requirement met - types + tests + build green - provenance shown - empty/error states handled - no synthetic data left unlabelled - docs updated - no new warnings.

## 9. When unsure
Prefer asking one precise question over guessing. Say "unverified" out loud. Never present an assumption as a fact, in code, UI or docs.

## 10. Commands
`npm install` - `npm run dev` - `npm run check` - `npm run build` - `npm run format`. Data: see `scripts/README.md`.
