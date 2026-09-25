# PROJECT_CONTEXT

> Read this first. It explains WHAT we are building and WHY. Rules for AI agents are in `../AGENTS.md`.

## 1. The challenge (official text, NASA Space Apps 2026)

**Interplanetary Survival Guide: Martian Map** - Intermediate. Subjects: Human Exploration, Mars, Planets & Moons, Software, Space Exploration.

> NASA has explored Mars robotically for decades, studying its extreme environment, mapping its surface, and collecting many types of data. Far from home, the first astronauts to set foot on Mars will want the best map possible, with information on the details of their routes and destinations, updates on current conditions, and the data needed to complete their mission quickly and safely. Your challenge is to create a layered, integrated view of a location or route on the Martian surface that pulls together data from multiple NASA science missions and could help a human explorer plan and carry out a successful Marswalk while conducting new and exciting science along the way.

Line-by-line meaning and the mistakes to avoid: `CHALLENGE_ANALYSIS.md`.

## 2. One-sentence product

A layered, integrated Mars surface map for ONE location/route that combines data from several NASA missions so a future astronaut can **plan** a Marswalk (route, destination, conditions, science stops) and **carry it out** (go/no-go, time budget, hazards).

## 3. North-star question (every feature must answer it)

"If I were an astronaut preparing for a Marswalk, which data from multiple NASA missions would I need to understand my **route**, **destination**, **current conditions** and **scientific opportunities**?"

## 4. Users and scenario

- **Primary user:** a human Mars explorer / EVA planner (NOT a general public "Mars facts" audience).
- **Secondary user:** hackathon judges (they need to grasp the value in ~3 minutes -> guided demo, FR-11).
- **Scenario:** Crew lands near Jezero delta. Before EVA-1 the planner opens the app, sees layers (imagery, elevation, slope, mineralogy, rover traverse, hazards), picks a science target, compares "fastest / safest / science-rich" routes, checks the latest available conditions and the EVA time budget, previews the walk in 3D with an astronaut avatar, and exports the plan.

## 5. Scope decision (proposed - confirm as ADR-001)

| Item | Decision |
|---|---|
| Location | **Jezero Crater western delta** (Perseverance area). Backup: Gale / Mount Sharp. |
| Why Jezero | Rich multi-mission data (MOLA, CTX, HiRISE, CRISM, THEMIS, Perseverance traverse, MEDA weather/dust/radiation) and a clear science story (ancient delta, carbonates). Conditions data exists AT the rover site, so "current conditions" is defensible there. |
| Product | Location + one demonstrable route (start -> science stops -> destination -> return). |
| Not building | Whole-planet map, Earth features, generic Mars encyclopedia, chatbot-first app, real-time weather claims. |
| 3D | Companion view: terrain + astronaut walking the planned route. Supports the map, never replaces it. |
| AI | Optional phase 2 explainer. Not the core. |

## 6. Multi-mission data map (what "multiple NASA missions" means here)

| Need | Mission / instrument | Layer |
|---|---|---|
| Elevation | MGS / MOLA (+ ESA MEX / HRSC blend distributed by USGS) | elevation, slope |
| Surface imagery | MRO / CTX, HiRISE | basemap |
| Mineralogy | MRO / CRISM | mineralogy, science value |
| Sand vs rock | Mars Odyssey / THEMIS | thermal inertia, hazard |
| Rover traverse | Mars 2020 Perseverance | traverse |
| Local conditions | Perseverance / MEDA (backup: Curiosity REMS, RAD) | conditions |

Target: **>= 3 distinct NASA missions visibly integrated** (MGS, MRO, ODY, M2020 = 4). Exact products and URLs: `DATA_SOURCES.md` (all UNVERIFIED until T-001 is done).

## 7. Constraints and facts to plan around

- Hackathon: **Nov 14-15, 2026** (submission window opens Sat Nov 14 09:00, closes Sun Nov 15 23:59 local, per the official Space Apps site - re-check). Teams: max 6 people.
- Real DEM/imagery are large -> pre-process offline, ship small static files (ADR-002, ADR-012).
- We cannot claim "live Mars weather". Show **latest available observation + timestamp + age** (ADR-008).
- Human EVA limits (suit consumables, walking speed on slopes) are **assumptions**, not NASA-validated numbers. Label them.

## 8. Glossary

| Term | Meaning |
|---|---|
| Marswalk / EVA | Extravehicular activity: astronaut walking on the Martian surface |
| DEM / DTM | Digital elevation / terrain model (height grid) |
| Layer | One toggleable data overlay with provenance |
| Integrated view | Selecting a place shows all related layer data in one panel |
| Sol | Martian solar day (88,775.244 s) |
| MOLA / HRSC | Laser altimeter (MGS) / stereo camera (ESA Mars Express) |
| CTX / HiRISE / CRISM | MRO context camera / high-res camera / mineral spectrometer |
| THEMIS | Mars Odyssey thermal imager (thermal inertia -> sand vs rock) |
| MEDA / REMS / RAD | Weather station on Perseverance / on Curiosity / radiation detector on Curiosity |
| Provenance | Mission, instrument, product, resolution, date, URL, processed?, synthetic?, verified? |

## 9. Open questions for the team (answer before coding starts)

1. Confirm Jezero (ADR-001)? 2. Team size and skills (front-end / data / 3D / design)? 3. Deployment target (Vercel/Netlify/GitHub Pages)? 4. Do we want the optional AI explainer? 5. Any extra rules in the official "Details/Resources/Submission" tabs we have not seen? (The screenshots only show the summary.)
