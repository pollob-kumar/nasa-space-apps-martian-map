# DATA_SOURCES

**Everything here is UNVERIFIED** until T-001. The list reflects widely known NASA/USGS/PDS products and how other Mars mapping projects describe them; the official challenge "Resources" section was not accessible to our tooling, so compare with it. Update Status after checking.

## 1. Datasets
| Need | Mission / instrument | Typical product | Resolution (approx.) | Where to look | Status |
|---|---|---|---|---|---|
| Global elevation | MGS / MOLA | MEGDR DEM | ~463 m/px (equator) | PDS Geosciences, USGS Astropedia | unverified |
| Better global DEM | MOLA + ESA Mars Express HRSC (blend) | MOLA-HRSC blended DEM | ~200 m/px | USGS Astrogeology | unverified (note: HRSC is ESA) |
| Local elevation | MRO / CTX, HiRISE | stereo DTMs (Jezero exists) | ~20 m / ~1 m | HiRISE site, PDS | unverified |
| Imagery | MRO / CTX, HiRISE | mosaics / tiles | ~6 m / ~0.3 m | Mars Trek, HiRISE, JMARS | unverified |
| Mineralogy | MRO / CRISM | targeted / map-projected mineral products | ~18 m (targeted) | PDS Geosciences | unverified |
| Sand vs rock | Mars Odyssey / THEMIS | thermal inertia, day/night IR | ~100 m | ASU THEMIS | unverified |
| Rover path | Mars 2020 Perseverance | traverse / waypoints | n/a | mission site, PDS | unverified |
| Weather / dust | Perseverance / MEDA | pressure, temperature, wind, humidity, dust, radiation | per-sol | PDS Atmospheres Node | unverified |
| Backup weather/rad | Curiosity / REMS, RAD | temperature, pressure, radiation dose | per-sol | PDS Atmospheres Node | unverified |
| Regional dust/climate | MRO / MCS (optional) | dust opacity, temperature profiles | coarse | PDS Atmospheres Node | unverified |

## 2. Portals
NASA Mars Trek https://trek.nasa.gov/mars/ - USGS Astrogeology https://astrogeology.usgs.gov/ - PDS Geosciences https://pds-geosciences.wustl.edu/ - PDS Atmospheres https://pds-atmospheres.nmsu.edu/ - HiRISE https://www.uahirise.org/ - THEMIS https://themis.asu.edu/ - JMARS https://jmars.asu.edu/ (desktop tool for exploring/exporting).

## 3. Verification checklist per source (fill for each)
```
Source: ...            URL: ...            Checked by/date: ...
Licence/terms: ...     CORS ok?: ...       Tile template (if any): ...
CRS + lon convention: ...   Units: ...     Date range: ...     Notes: ...
```

## 4. Site coordinates (approximate, unverified)
Jezero delta bbox ~ W 77.30 S 18.35 E 77.55 N 18.55; Gale foothills ~ W 137.30 S -4.90 E 137.60 N -4.50. Fix in T-002.

## 5. Assets (3D/images/fonts)
| Asset | Source | Licence | Used where |
|---|---|---|---|
| procedural astronaut | own code | project licence | `AstronautAvatar.tsx` |
| (add GLB / textures / fonts here) | | | |

## 6. Credits text (draft for the app footer)
"Data: NASA/JPL, USGS, PDS, University of Arizona (HiRISE), ASU (THEMIS). Products are processed by this project; see layer provenance." - refine once sources are verified.

## 7. Candidate tile endpoint (carried over from the second scaffold, UNVERIFIED)
```
https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg
```
- **What it is:** MGS/MOLA colourised shaded relief at 463 m/px - an **elevation-style** product, so it belongs on the `elevation` layer (`VITE_TILE_ELEVATION_URL`), not on the imagery basemap. The other scaffold used it as a basemap and credited "MSSS" (the CTX camera maker); that attribution was wrong for this product.
- **Tile scheme:** Mars Trek documents an OGC RESTful WMTS pattern `.../{TileMatrix}/{TileRow}/{TileCol}` (row 0 at the north), so Leaflet needs `tms: false` (ADR-016). The template order `{z}/{y}/{x}` above is that pattern.
- **Evidence and gaps:** the exact URL appears in a public 2022 forum thread and the pattern matches Trek's WMTS documentation (catalogue: https://api.nasa.gov/mars-wmts/catalog). It was **not requested from the build sandbox**, so it may be dead or CORS-restricted today. Check in T-001 before enabling. Also check terms of use/credit text.
- **Fit for our site:** the Jezero bbox is ~14.0 x 11.8 km, i.e. only ~30 x 26 px at 463 m/px - fine for regional context, useless for walking-scale planning. Route, slope and the 3D view need a local DEM (CTX/HiRISE stereo DTM, T-010/T-011). A 512 x 512 grid over this bbox has ~27 x 23 m cells.
- Use the WMTS catalogue to look for a CTX/HiRISE imagery layer for the basemap; none is verified yet.
