# DATABASE

## 1. Decision
**No database in the MVP** (ADR-002). Data is pre-processed into versioned static files under `public/data/`. This keeps hosting trivial, the demo offline-capable, and every value traceable to a file with provenance.
If a database is needed later (multi-user saved plans, big vector sets), use SQLite/PostGIS with the DDL in section 5.

## 2. Storage layout
| Location | Content | In git? |
|---|---|---|
| `data/raw/` | downloaded NASA/USGS products | no (large) |
| `data/interim/` | temporary intermediates | no |
| `public/data/manifest.json` | index of available assets per site | yes |
| `public/data/<site>/dem.json` | elevation grid | yes if < ~5 MB, else Git LFS/release asset |
| `public/data/<site>/{slope,hazard,thermal_inertia}.json` | derived grids | yes |
| `public/data/<site>/{targets,mineralogy,traverse}.geojson` | vectors | yes |
| `public/data/<site>/conditions.json` | latest conditions snapshot | yes |

## 3. Entities (logical model)
| Entity | Key fields |
|---|---|
| Site | id, name, center(lon,lat), bbox, verified |
| Layer | id, title, group, kind, tileUrl/dataPath, provenance, defaults |
| Provenance | mission, instrument, product, resolution, acquired, sourceUrl, processed, synthetic, verified |
| Grid | width, height, bbox, encoding, unit, data, provenance |
| ScienceTarget | id, name, position, kind, scienceValue, rationale, provenance[] |
| ConditionsSnapshot | siteId, observedAt, sol, measurements, source |
| RoutePlan (export) | id, siteId, profile, path[], elevations[], stats, stops[], assumptions, createdAt |

Relations: Site 1-N Layer data files; Site 1-N ScienceTarget; Site 1-1 latest ConditionsSnapshot; RoutePlan N-1 Site.

## 4. Conventions
- CRS: planetocentric lon/lat, east-positive; bbox = `{west,south,east,north}`.
- Units: metres, degrees, Pa, deg C, m/s; unit named in the field or file.
- Grid: row-major, **row 0 = north**, little-endian float32, base64 in JSON. NaN = no data.
- IDs: kebab-case ASCII. Timestamps: ISO 8601 UTC.
- Every file has `schemaVersion`. Breaking change -> bump + note in `DECISIONS.md`.
- Never zero-fill missing data. Omit the field or use `null`.

## 5. Optional SQL (phase 2 only)
```sql
CREATE TABLE site (id TEXT PRIMARY KEY, name TEXT NOT NULL, center_lon REAL, center_lat REAL,
  west REAL, south REAL, east REAL, north REAL, verified INTEGER NOT NULL DEFAULT 0);
CREATE TABLE provenance (id INTEGER PRIMARY KEY, mission TEXT, instrument TEXT, product TEXT, resolution TEXT,
  acquired TEXT, source_url TEXT, processed INTEGER, synthetic INTEGER, verified INTEGER);
CREATE TABLE science_target (id TEXT PRIMARY KEY, site_id TEXT REFERENCES site(id), name TEXT, lon REAL, lat REAL,
  kind TEXT, science_value REAL CHECK (science_value BETWEEN 0 AND 1), rationale TEXT);
CREATE TABLE target_provenance (target_id TEXT REFERENCES science_target(id), provenance_id INTEGER REFERENCES provenance(id));
CREATE TABLE conditions_snapshot (id INTEGER PRIMARY KEY, site_id TEXT REFERENCES site(id), observed_at TEXT NOT NULL,
  sol INTEGER, air_temp_c REAL, ground_temp_c REAL, pressure_pa REAL, wind_ms REAL, dust_opacity REAL,
  uv_index REAL, radiation_usv_day REAL, provenance_id INTEGER REFERENCES provenance(id));
CREATE TABLE route_plan (id TEXT PRIMARY KEY, site_id TEXT REFERENCES site(id), profile TEXT, geometry_geojson TEXT,
  distance_m REAL, est_time_min REAL, max_slope_deg REAL, assumptions_json TEXT, created_at TEXT);
```
