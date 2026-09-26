"""Rebuild public/data/manifest.json by scanning public/data/<site>/ for known files (T-015)."""
import json
import sys
from pathlib import Path
from common import PUBLIC_DATA, SITES

FILES = {
    "dem": "dem.json", 
    "slope": "slope.json", 
    "roughness": "roughness.json",
    "sand_risk": "sand_risk.json",
    "hazard": "hazard.json",
    "traverse": "traverse.geojson",
    "targets": "targets.geojson", 
    "conditions": "conditions.json"
}

def validate_bbox(bbox) -> bool:
    if isinstance(bbox, dict):
        required = ["west", "south", "east", "north"]
        if not all(k in bbox for k in required):
            return False
        return bbox["west"] <= bbox["east"] and bbox["south"] <= bbox["north"]
    elif isinstance(bbox, list):
        if len(bbox) != 4:
            return False
        return bbox[0] <= bbox[2] and bbox[1] <= bbox[3]
    return False

def main() -> None:
    sites_out = []
    has_errors = False
    
    for sid, site_bbox in SITES.items():
        d = PUBLIC_DATA / sid
        if not d.exists():
            continue
            
        assets = {}
        files_metadata = []
        
        for p in d.glob("*.*"):
            if p.suffix not in [".json", ".geojson"] or p.name == "manifest.json":
                continue
                
            try:
                with open(p, "r", encoding="utf-8") as f:
                    content = json.load(f)
            except Exception as e:
                print(f"ERROR: Could not parse {p.relative_to(PUBLIC_DATA)}: {e}")
                has_errors = True
                continue
                
            # Validation pass
            if "provenance" not in content and "source" not in content:
                print(f"ERROR: Missing provenance in {p.relative_to(PUBLIC_DATA)}")
                has_errors = True
            
            provenance_data = content.get("provenance") or content.get("source")
            if "bbox" in content:
                if not validate_bbox(content["bbox"]):
                    print(f"ERROR: Invalid bbox in {p.relative_to(PUBLIC_DATA)}: {content['bbox']}")
                    has_errors = True
                    
            files_metadata.append({
                "path": f"{sid}/{p.name}",
                "schemaVersion": content.get("schemaVersion"),
                "provenance": provenance_data
            })
            
        for k, fn in FILES.items():
            assets[k] = f"{sid}/{fn}" if (d / fn).exists() else None
            
        sites_out.append({
            "id": sid, 
            "assets": assets,
            "files": files_metadata
        })
        
    if has_errors:
        print("Validation failed: One or more files are missing provenance or have an invalid bbox.")
        sys.exit(1)
        
    out_path = PUBLIC_DATA / "manifest.json"
    out_path.write_text(json.dumps({
        "schemaVersion": 1, 
        "generatedBy": "scripts/04_build_manifest.py", 
        "sites": sites_out
    }, indent=2))
    print(f"Wrote {out_path}")

if __name__ == "__main__":
    main()
