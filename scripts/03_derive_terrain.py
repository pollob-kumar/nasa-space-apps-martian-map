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

def roughness_variance(elev_data: np.ndarray) -> np.ndarray:
    """
    Calculate local elevation variance (roughness) using a 3x3 window.
    elev_data: 2D numpy array
    """
    padded = np.pad(elev_data, pad_width=1, mode='edge')
    windows = np.lib.stride_tricks.sliding_window_view(padded, (3, 3))
    variance = np.var(windows, axis=(2, 3))
    return variance

def compute_hazard(slope_data: np.ndarray, roughness_data: np.ndarray, sand_risk_data: np.ndarray) -> np.ndarray:
    """Compute hazard grid based on SDD model and accepted ADR thresholds."""
    # Weights
    w_slope = 0.4
    w_roughness = 0.4
    w_sand = 0.2
    
    # Normalise slope (max 20 degrees based on assumptions)
    slope_norm = np.clip(slope_data / 20.0, 0, 1)
    
    # Normalise roughness (max risk at variance >= 0.5 m^2)
    roughness_norm = np.clip(roughness_data / 0.5, 0, 1)
    
    # Sand risk is already 0..1
    sand_norm = np.clip(sand_risk_data, 0, 1)
    
    hazard = w_slope * slope_norm + w_roughness * roughness_norm + w_sand * sand_norm
    return np.clip(hazard, 0, 1)

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
    
    # Calculate roughness (T-013)
    roughness_data = roughness_variance(elev_data)
    
    # Calculate sand risk (synthetic placeholder as THEMIS data is missing) (T-013)
    sand_risk_data = np.zeros_like(elev_data, dtype=np.float32)
    
    # Calculate hazard (T-014)
    hazard_data = compute_hazard(slope_data, roughness_data, sand_risk_data)
    
    def write_grid(name, data, unit, note, synthetic=False):
        out = {
            "schemaVersion": 1,
            "width": dem["width"],
            "height": dem["height"],
            "bbox": dem["bbox"],
            "encoding": "float32-base64",
            "unit": unit,
            "data": base64.b64encode(data.astype("<f4").tobytes()).decode("ascii"),
            "provenance": {
                "sourceFile": "dem.json",
                "processed": True,
                "synthetic": synthetic,
                "verified": not synthetic,
                "note": note
            }
        }
        out_path = site_dir / f"{name}.json"
        out_path.write_text(json.dumps(out))
        print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")

    # Write all grids
    write_grid("slope", slope_data, "deg", "Derived from DEM via central differences (T-012)")
    write_grid("roughness", roughness_data, "m^2", "3x3 local elevation variance (T-013)")
    write_grid("sand_risk", sand_risk_data, "score", "Placeholder synthetic data (THEMIS TI missing) (T-013)", synthetic=True)
    write_grid("hazard", hazard_data, "score", "Hazard model: 0.4*(slope/20) + 0.4*(roughness/0.5) + 0.2*sand_risk (T-014)", synthetic=True)

def main() -> None:
    ap = argparse.ArgumentParser(description="Derive terrain layers from DEM.")
    ap.add_argument("--site", required=True, help="Site ID to process")
    args = ap.parse_args()
    process_site(args.site)

if __name__ == "__main__":
    main()
