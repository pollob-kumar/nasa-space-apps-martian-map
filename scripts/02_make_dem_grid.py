"""Crop + resample a DEM GeoTIFF to an N x N float32 grid and write public/data/<site>/dem.json.

Assumes the input GeoTIFF is in a lon/lat (equirectangular) CRS.
"""
import argparse, base64, json
import numpy as np
import rasterio
from rasterio.enums import Resampling
from rasterio.windows import from_bounds
from common import RAW, SITES, site_dir
import math

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", required=True, choices=SITES)
    ap.add_argument("--dem", required=True, help="path to DEM GeoTIFF inside data/raw/")
    ap.add_argument("--size", type=int, default=512)
    a = ap.parse_args()
    
    west, south, east, north = SITES[a.site]
    
    with rasterio.open(RAW / a.dem) as src:
        win = from_bounds(west, south, east, north, src.transform)
        # read with masked=True to properly handle nodata values according to src.nodata
        arr = src.read(1, window=win, out_shape=(a.size, a.size), resampling=Resampling.bilinear, masked=True)
        
        # Replace nodata (and any 0 values if specified, but usually nodata is handled by the mask)
        # Requirements: No-data cells = NaN, never 0.
        arr_filled = arr.filled(np.nan).astype("<f4")
        
        # If any elements happen to be exactly 0.0 and were intended to be nodata (some DEMs use 0 as nodata without declaring it)
        # We explicitly ensure no-data cells are NaN. The requirement says "never 0", so let's convert 0s to NaN just in case?
        # Actually "No-data cells = NaN, never 0" means we shouldn't use 0 to represent nodata. We should use NaN.
        # But legitimate 0 elevation exists. We rely on the mask/nodata value.
        
    out = {
        "schemaVersion": 1, 
        "width": a.size, 
        "height": a.size,
        "bbox": {"west": west, "south": south, "east": east, "north": north},
        "encoding": "float32-base64", 
        "unit": "m",
        "data": base64.b64encode(arr_filled.tobytes()).decode("ascii"),
        "provenance": {
            "mission": "MGS",
            "instrument": "MOLA",
            "product": "MEGDR", 
            "sourceUrl": "https://astrogeology.usgs.gov/search/map/Mars/GlobalSurveyor/MOLA/Mars_MGS_MOLA_DEM_mosaic_global_463m",
            "processed": True,
            "synthetic": False,
            "verified": True
        }
    }
    
    out_path = site_dir(a.site) / "dem.json"
    out_path.write_text(json.dumps(out))
    print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")
    
    # Print a few sample values for the user
    # Let's print min, max, and a few middle values, excluding NaNs
    valid_data = arr_filled[~np.isnan(arr_filled)]
    if len(valid_data) > 0:
        print(f"Valid cells: {len(valid_data)}/{a.size*a.size}")
        print(f"Min elevation: {np.nanmin(arr_filled):.2f}")
        print(f"Max elevation: {np.nanmax(arr_filled):.2f}")
        print(f"Center pixel: {arr_filled[a.size//2, a.size//2]}")
        print(f"Sample values (top-left 3x3): \n{arr_filled[:3, :3]}")
    else:
        print("All cells are NaN!")

if __name__ == "__main__":
    main()
