import { useMemo } from 'react';
import { BufferAttribute, PlaneGeometry } from 'three';
import type { Grid } from '@/lib/geo/grid';
import { SCENE_SIZE, V_EXAGGERATION, worldScale } from './coords3d';

export function Terrain({ grid }: { grid: Grid }) {
  const geometry = useMemo(() => {
    const depth = SCENE_SIZE * (grid.height / grid.width);
    const g = new PlaneGeometry(SCENE_SIZE, depth, grid.width - 1, grid.height - 1);
    g.rotateX(-Math.PI / 2); // plane now lies in XZ, +y up, row 0 at -z (north)
    const pos = g.getAttribute('position') as BufferAttribute;
    const s = worldScale(grid) * V_EXAGGERATION;
    for (let i = 0; i < pos.count; i++) pos.setY(i, grid.data[i]! * s);
    g.computeVertexNormals();
    return g;
  }, [grid]);
  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#a4583a" roughness={1} flatShading />
    </mesh>
  );
}
