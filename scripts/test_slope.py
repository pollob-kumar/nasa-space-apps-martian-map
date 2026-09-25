import numpy as np
import pytest

# Adjust path to import from 03_derive_terrain
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from importlib.util import spec_from_file_location, module_from_spec

spec = spec_from_file_location("derive_terrain", Path(__file__).parent / "03_derive_terrain.py")
derive = module_from_spec(spec)
spec.loader.exec_module(derive)

def test_slope_degrees():
    # Matching tests/unit/slope.test.ts
    width = 10
    height = 10
    bbox = {"west": 0, "east": 0.1, "south": 0, "north": 0.1}
    
    dx, dy = derive.cell_size_m(bbox, width, height)
    
    elev_data = np.zeros((height, width), dtype=np.float32)
    for y in range(height):
        for x in range(width):
            elev_data[y, x] = x * dx
            
    s = derive.slope_degrees(elev_data, bbox)
    
    # Check center value at (5, 5) -> index [5, 5]
    val = s[5, 5]
    
    assert 44.5 < val < 45.5, f"Expected slope around 45 degrees, got {val}"

def test_slope_degrees_matches_ts_edges():
    # The central difference in TS uses Math.max(0, x-1) for out-of-bounds, effectively repeating edge values.
    # Our python code uses np.pad with mode='edge'. Let's verify an edge value.
    width = 10
    height = 10
    bbox = {"west": 0, "east": 0.1, "south": 0, "north": 0.1}
    dx, dy = derive.cell_size_m(bbox, width, height)
    
    elev_data = np.zeros((height, width), dtype=np.float32)
    for y in range(height):
        for x in range(width):
            elev_data[y, x] = x * dx
            
    s = derive.slope_degrees(elev_data, bbox)
    
    # Left edge (x=0). TS at(x-1, y) evaluates to at(0, y) because Math.max(0, -1) == 0.
    # So dzdx = (at(1, y) - at(0, y)) / (2*dx) = (dx - 0) / 2dx = 0.5
    # Then slope is atan(0.5) instead of atan(1)
    # Let's check python output:
    expected_edge_slope = np.arctan(0.5) * (180.0 / np.pi)
    assert np.isclose(s[5, 0], expected_edge_slope), f"Edge slope mismatch. Expected {expected_edge_slope}, got {s[5, 0]}"
