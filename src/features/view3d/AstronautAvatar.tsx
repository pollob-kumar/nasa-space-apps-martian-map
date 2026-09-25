import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Vector3 } from 'three';

/**
 * Procedural astronaut so the project works with NO external asset (ADR-010).
 * To use a real model: drop public/models/astronaut.glb and swap the body for drei's useGLTF (see docs/SDD.md 6.4).
 * The avatar is NOT to scale (exaggerated for visibility) - the UI must say so.
 */
export function AstronautAvatar({ path, speed = 6, height = 3 }: { path: Vector3[]; speed?: number; height?: number }) {
  const root = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const t = useRef(0); // distance travelled along path (world units)

  useFrame((_, dt) => {
    const g = root.current;
    if (!g || path.length < 2) return;
    t.current += speed * dt;
    let remaining = t.current;
    let i = 0;
    for (; i < path.length - 1; i++) {
      const seg = path[i]!.distanceTo(path[i + 1]!);
      if (remaining <= seg) break;
      remaining -= seg;
    }
    if (i >= path.length - 1) {
      t.current = 0; // loop the Marswalk preview
      return;
    }
    const a = path[i]!;
    const b = path[i + 1]!;
    const f = remaining / Math.max(1e-6, a.distanceTo(b));
    g.position.lerpVectors(a, b, f);
    g.lookAt(b.x, g.position.y, b.z);
    const swing = Math.sin(t.current * 3) * 0.6;
    if (legL.current && legR.current && armL.current && armR.current) {
      legL.current.rotation.x = swing;
      legR.current.rotation.x = -swing;
      armL.current.rotation.x = -swing * 0.7;
      armR.current.rotation.x = swing * 0.7;
    }
  });

  const suit = <meshStandardMaterial color="#ececec" roughness={0.8} />;
  return (
    <group ref={root} scale={height / 1.9}>
      <mesh position={[0, 1.05, 0]}>
        <capsuleGeometry args={[0.3, 0.5, 4, 10]} />
        {suit}
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        {suit}
      </mesh>
      <mesh position={[0, 1.7, 0.16]} scale={[1, 0.8, 0.7]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#c9a24b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.15, -0.35]}>
        <boxGeometry args={[0.5, 0.7, 0.28]} />
        <meshStandardMaterial color="#bdbdbd" />
      </mesh>
      <group ref={legL} position={[-0.14, 0.7, 0]}>
        <mesh position={[0, -0.35, 0]}><capsuleGeometry args={[0.12, 0.5, 4, 8]} />{suit}</mesh>
      </group>
      <group ref={legR} position={[0.14, 0.7, 0]}>
        <mesh position={[0, -0.35, 0]}><capsuleGeometry args={[0.12, 0.5, 4, 8]} />{suit}</mesh>
      </group>
      <group ref={armL} position={[-0.42, 1.4, 0]}>
        <mesh position={[0, -0.3, 0]}><capsuleGeometry args={[0.09, 0.45, 4, 8]} />{suit}</mesh>
      </group>
      <group ref={armR} position={[0.42, 1.4, 0]}>
        <mesh position={[0, -0.3, 0]}><capsuleGeometry args={[0.09, 0.45, 4, 8]} />{suit}</mesh>
      </group>
    </group>
  );
}
