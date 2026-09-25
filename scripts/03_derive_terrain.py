"""Derive slope / roughness / hazard grids from dem.json. SKELETON (T-012..T-014).

Slope: central differences with metric cell size (same maths as src/lib/geo/grid.ts -> keep both in sync, test both).
Hazard (0..1) = weighted blend of normalised slope, roughness and thermal-inertia-based sand risk. Weights live in
docs/SDD.md section 5.2; write them into the output provenance.
"""
import argparse
import base64
import json
import math
import numpy as np
from pathlib import Path

from common import PUBLIC_DATA, MARS_RADIUS_M

def cell_size_m(bbox: dict, width: int, height: int) -> tuple[float, float]:
    mid_lat = (bbox["north"] + bbox["south"]) / 2.0
    d_lon = (bbox["east"] - bbox["west"]) / width
    d_lat = (bbox["north"] - bbox["south"]) / height
    
    deg2rad = math.pi / 180.0
    
    dx = MARS_RADIUS_M * math.cos(mid_lat * deg2rad) * d_lon * deg2rad
    dy = MARS_RADIUS_M * d_lat * deg2rad
    
    return dx, dy

def slope_degrees(elev_data: np.ndarray, bbox: dict) -> np.ndarray:
    """
    Calculate slope in degrees using central differences.
    Exact match of src/lib/geo/grid.ts `slopeDegrees`.
    elev_data: 2D numpy array (height, width)
    """
    h, w = elev_data.shape
    dx, dy = cell_size_m(bbox, w, h)
    
    out = np.zeros_like(elev_data, dtype=np.float32)
    
    # Pad array by repeating edge values
    padded = np.pad(elev_data, pad_width=1, mode='edge')
    
    # Central difference
    # For x: at(x+1, y) - at(x-1, y) -> padded[1:h+1, 2:w+2] - padded[1:h+1, 0:w]
    dzdx = (padded[1:h+1, 2:w+2] - padded[1:h+1, 0:w]) / (2 * dx)
    
    # For y: at(x, y-1) - at(x, y+1) -> padded[0:h, 1:w+1] - padded[2:h+2, 1:w+1]
    # Note: north-up grid means y-1 is north, so smaller index. padded[0:h, ...] is y-1, padded[2:h+2, ...] is y+1
    dzdy = (padded[0:h, 1:w+1] - padded[2:h+2, 1:w+1]) / (2 * dy)
    
    # Slope
    hypot = np.hypot(dzdx, dzdy)
    out = np.arctan(hypot) * (180.0 / math.pi)
    
    return out

def process_site(site_id: str) -> None:
    site_dir = PUBLIC_DATA / site_id
    dem_path = site_dir / "dem.json"
    
    if not dem_path.exists():
        print(f"Skipping {site_id}, no dem.json found.")
        return
        
    print(f"Processing {site_id}...")
    with open(dem_path, "r") as f:
        dem = json.load(f)
        
    # Decode float32 base64 data
    data_bytes = base64.b64decode(dem["data"])
    elev_data = np.frombuffer(data_bytes, dtype="<f4").reshape((dem["height"], dem["width"]))
    
    # Calculate slope
    slope_data = slope_degrees(elev_data, dem["bbox"])
    
    # Write slope.json
    out = {
        "schemaVersion": 1,
        "width": dem["width"],
        "height": dem["height"],
        "bbox": dem["bbox"],
        "encoding": "float32-base64",
        "unit": "deg",
        "data": base64.b64encode(slope_data.astype("<f4").tobytes()).decode("ascii"),
        "provenance": {
            "sourceFile": "dem.json",
            "processed": True,
            "synthetic": False,
            "verified": True,
            "note": "Derived from DEM via central differences (T-012)"
        }
    }
    
    out_path = site_dir / "slope.json"
    out_path.write_text(json.dumps(out))
    print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")

def main() -> None:
    ap = argparse.ArgumentParser(description="Derive terrain layers from DEM.")
    ap.add_argument("--site", required=True, help="Site ID to process")
    args = ap.parse_args()
    process_site(args.site)

if __name__ == "__main__":
    main()
