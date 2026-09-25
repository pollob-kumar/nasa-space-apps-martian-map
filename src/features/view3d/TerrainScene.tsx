import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls, Sky } from '@react-three/drei';
import { useTerrainGrid } from '@/hooks/useTerrainGrid';
import { useApp } from '@/state/store';
import { AstronautAvatar } from './AstronautAvatar';
import { Terrain } from './Terrain';
import { SCENE_SIZE, V_EXAGGERATION, toWorld } from './coords3d';

/** 3D companion view. It SUPPORTS the map; it must not replace the layered 2D planning view. */
export function TerrainScene() {
  const { siteId, route } = useApp();
  const { grid, synthetic } = useTerrainGrid(siteId);
  const pts = useMemo(
    () => (grid && route ? route.path.map((p, i) => toWorld(grid, p, route.elevationsM[i]!)) : []),
    [grid, route],
  );

  return (
    <div>
      <Canvas camera={{ position: [0, SCENE_SIZE * 0.6, SCENE_SIZE * 0.9], fov: 45, far: 2000 }}>
        <color attach="background" args={['#141b25']} />
        <Sky sunPosition={[50, 8, 20]} turbidity={9} rayleigh={0.2} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[60, 40, 20]} intensity={2} />
        {grid && <Terrain grid={grid} />}
        {pts.length > 1 && <Line points={pts} color="#5cc8d7" lineWidth={3} />}
        <AstronautAvatar path={pts} />
        <OrbitControls makeDefault maxPolarAngle={Math.PI * 0.49} />
      </Canvas>
      <div className="notice" style={{ position: 'absolute', left: 8, bottom: 8, inset: 'auto auto 8px 8px' }}>
        Vertical exaggeration x{V_EXAGGERATION}. Astronaut not to scale.{synthetic && ' SYNTHETIC terrain.'}
      </div>
    </div>
  );
}
