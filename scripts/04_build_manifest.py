"""Rebuild public/data/manifest.json by scanning public/data/<site>/ for known files (T-015). SKELETON."""
import json
from common import PUBLIC_DATA, SITES

FILES = {"dem": "dem.json", "slope": "slope.json", "traverse": "traverse.geojson",
         "targets": "targets.geojson", "conditions": "conditions.json"}

def main() -> None:
    sites = []
    for sid in SITES:
        d = PUBLIC_DATA / sid
        assets = {k: (f"{sid}/{fn}" if (d / fn).exists() else None) for k, fn in FILES.items()}
        sites.append({"id": sid, "assets": assets})
    (PUBLIC_DATA / "manifest.json").write_text(json.dumps({"schemaVersion": 1, "generatedBy": "scripts/04_build_manifest.py", "sites": sites}, indent=2))

if __name__ == "__main__":
    main()
