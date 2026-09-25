"""Derive slope / roughness / hazard grids from dem.json. SKELETON (T-012..T-014).

Slope: central differences with metric cell size (same maths as src/lib/geo/grid.ts -> keep both in sync, test both).
Hazard (0..1) = weighted blend of normalised slope, roughness and thermal-inertia-based sand risk. Weights live in
docs/SDD.md section 5.2; write them into the output provenance.
"""
raise SystemExit("Not implemented yet - see docs/TODO.md T-012..T-014")
