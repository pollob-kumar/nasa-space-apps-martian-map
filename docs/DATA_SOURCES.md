# DATA_SOURCES

Status checked 2026-09-25 from this environment. Public NASA/USGS/PDS endpoints below respond without a paid key or login where reached. Product-specific terms/licence pages were not always reachable in this session, so items without a direct rights statement remain "not yet verified" rather than being marked as fully verified.

## 1. Datasets
| Need | Mission / instrument | Typical product | Resolution (approx.) | Where to look | Status |
|---|---|---|---|---|---|
| Global elevation | MGS / MOLA | MEGDR DEM | ~463 m/px (equator) | PDS Geosciences, USGS Astropedia | public endpoint reachable; no paid key; exact product licence page not yet checked |
| Better global DEM | MOLA + ESA Mars Express HRSC (blend) | MOLA-HRSC blended DEM | ~200 m/px | USGS Astrogeology | public endpoint reachable; no paid key; Mars Trek tile endpoint for the 463 m MOLA shaded-relief product does respond |
| Local elevation | MRO / CTX, HiRISE | stereo DTMs (Jezero exists) | ~20 m / ~1 m | HiRISE site, PDS | public endpoints reachable; exact local Jezero DTM landing page not yet checked |
| Imagery | MRO / CTX, HiRISE | mosaics / tiles | ~6 m / ~0.3 m | Mars Trek, HiRISE, JMARS | public endpoints reachable; Mars Trek tile endpoint responds; exact basemap product choice not yet locked to a published layer |
| Mineralogy | MRO / CRISM | targeted / map-projected mineral products | ~18 m (targeted) | PDS Geosciences | public archive reachable; no paid key; product-specific rights/credit page not yet checked |
| Sand vs rock | Mars Odyssey / THEMIS | thermal inertia, day/night IR | ~100 m | ASU THEMIS | public site reachable; no paid key; exact THEMIS thermal-inertia product page not yet checked |
| Rover path | Mars 2020 Perseverance | traverse / waypoints | n/a | mission site, PDS | public mission pages reachable; no paid key; exact traverse file/source metadata not yet checked |
| Weather / dust | Perseverance / MEDA | pressure, temperature, wind, humidity, dust, radiation | per-sol | PDS Atmospheres Node | public archive reachable; no paid key; exact MEDA data set and licence page not yet checked |
| Backup weather/rad | Curiosity / REMS, RAD | temperature, pressure, radiation dose | per-sol | PDS Atmospheres Node | public archive reachable; no paid key; exact file landing page not yet checked |
| Regional dust/climate | MRO / MCS (optional) | dust opacity, temperature profiles | coarse | PDS Atmospheres Node | public archive reachable; no paid key; exact product-specific terms page not yet checked |

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

## 7. Candidate tile endpoint (checked from this environment; licence not yet confirmed)
```
https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg
```
- **Status check:** HTTP 200, `Content-Type: image/jpeg`, and `Access-Control-Allow-Origin: *` on the tile endpoint. This is public and reachable without a paid key.
- **What it is:** MGS/MOLA colourised shaded relief at 463 m/px - an **elevation-style** product, so it belongs on the `elevation` layer (`VITE_TILE_ELEVATION_URL`), not on the imagery basemap. The previous scaffold's basemap attribution was incorrect for this product.
- **Tile scheme:** The working Mars Trek URL follows the WMTS-style row order used by the service, with row 0 at the north. In Leaflet this means `tms: false` (ADR-016); a TMS endpoint would be `y`-south and require `tms: true`.
- **Licence and terms:** we did not find a definitive rights statement for this exact tile product in this session. Do not mark the product as licence-verified until the product/catalogue page is checked directly.
- **Fit for our site:** the Jezero bbox is ~14.0 x 11.8 km, i.e. only ~30 x 26 px at 463 m/px - fine for regional context, useless for walking-scale planning. Route, slope and the 3D view need a local DEM (CTX/HiRISE stereo DTM, T-010/T-011). A 512 x 512 grid over this bbox has ~27 x 23 m cells.
- **Open gap:** use the Mars Trek catalogue to identify a CTX/HiRISE basemap layer; no public basemap product is confirmed here yet.
