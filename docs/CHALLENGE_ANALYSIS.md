# CHALLENGE_ANALYSIS

Condensed from `challenge_understand.odt` (the word-by-word analysis) plus the challenge page screenshot, with additions marked **(added)**.
The official page could not be fetched by tooling (robots.txt), so any extra sections (Resources, Considerations, Judging) are **not** covered - copy them here when you open the page.

## 1. Phrase -> requirement

| Phrase in the challenge                                 | What it demands of our project                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------- |
| Interplanetary Survival Guide                           | Decision support for staying safe + productive on Mars; not just "oxygen".  |
| Martian Map                                             | Interactive map of the **Mars surface** (not Earth, not solar-system view). |
| studying its extreme environment                        | Environment data (temperature, dust, radiation, terrain) is in scope.       |
| mapping its surface / collecting many types of data     | Many data TYPES -> many layers.                                             |
| Far from home                                           | Wrong decisions are costly -> risk-aware information, no fake certainty.    |
| first astronauts ... best map possible                  | "Best" = most useful for decisions, not prettiest.                          |
| details of their routes                                 | Distance, elevation profile, slope, terrain, hazards, time.                 |
| and destinations                                        | What/why/where of the target + which NASA data covers it.                   |
| updates on current conditions                           | Latest available conditions with timestamp (never claim live).              |
| quickly and safely                                      | Efficiency AND risk trade-off (route profiles).                             |
| create                                                  | We must BUILD software, not write a report.                                 |
| layered                                                 | Multiple toggleable layers.                                                 |
| integrated                                              | Layers connected: click a place -> all related info together.               |
| view                                                    | Visual + interactive.                                                       |
| a location or route                                     | Choose ONE (we do location + one route). Keep scope small.                  |
| pulls together data from multiple NASA science missions | >= 3 missions, visible in the UI with provenance.                           |
| could help a human explorer                             | Target user is the explorer; prototype level is acceptable.                 |
| plan and carry out a successful Marswalk                | Planning + execution support (time budget, go/no-go).                       |
| new and exciting science along the way                  | Science targets/value must influence the route.                             |

## 2. Wrong directions (avoid)

Pretty map only - weather app only - rover tracker only - shortest-path planner only - chatbot-first - educational Mars website. Each is a _part_ of a good answer, none is the answer.

## 3. Project test - ask for every feature

1. Mars surface? 2. Uses relevant NASA mission data? 3. Integrates several layers/sources? 4. Useful to a human explorer? 5. Explains route or location? 6. Informs destination/conditions/science? 7. Helps plan the Marswalk? 8. Real decision value or just decoration? Repeated "no" = cut or postpone.

## 4. Additions (added)

- **Conditions are only measured where landers/rovers are.** So "current conditions" at a site is tied to a rover station (MEDA at Jezero, REMS/RAD at Gale). Another reason to pick a rover area.
- **Coverage matrix** (challenge idea -> feature -> requirement ID) lives in `SRS.md` section 6; keep it updated - it is our judging cheat-sheet.
- **Data honesty is a feature.** Provenance badges, "latest available", synthetic/unverified flags. It is what separates a credible tool from a demo.
- **3D astronaut** = communication aid (shows scale, terrain, walk time), not the product (ADR-005).
- **Quick Bangla summary:** Mars-er ekta jayga/route nao -> NASA-r onek mission-er data layer hisebe ekshathe dekhao -> astronaut route, destination, condition, science bujhe Marswalk plan korte pare.

## 5. Details from Challenge Page (added via T-003)

- **Theme and Event Date:** 2026 NASA Space Apps Challenge "The Next Frontier" on **November 14-15, 2026**. (Confirms the date in `TODO.md`).
- **Difficulty Level:** Intermediate.
- **Skills involved:** AI/machine learning, data visualization, UI/UX design, software development, planetary science, and spatial mapping.
- **Core task:** Develop an interactive or integrated mapping solution using NASA open data from rovers and orbital missions to help astronauts plan routes, check conditions, and identify high-value science destinations. (Perfectly aligns with `docs/SRS.md` and `docs/DECISIONS.md`).
