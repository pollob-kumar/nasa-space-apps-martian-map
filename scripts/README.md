# scripts/ - offline data pipeline (Python)

Turns big NASA/USGS products into small static files the browser can load (`public/data/<site>/...`, format in docs/DATABASE.md).
**Status: skeletons. They have NOT been run against real data yet** - finish and verify them in tasks T-010..T-016 (docs/TODO.md).

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r scripts/requirements.txt
python scripts/01_fetch_data.py --site jezero-delta   # downloads into data/raw/ (gitignored)
python scripts/02_make_dem_grid.py --site jezero-delta --size 512
python scripts/03_derive_terrain.py --site jezero-delta  # slope, roughness, hazard
python scripts/04_build_manifest.py                      # rewrites public/data/manifest.json
```

Rules: every output file must embed provenance (mission, instrument, product, source URL, date processed, script git hash).
Never invent values. If a source is unavailable, write nothing and leave the manifest entry `null` (the app then shows a warning).
