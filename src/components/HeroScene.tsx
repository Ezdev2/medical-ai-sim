import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Stylised low-poly balloon catheter forming machine for the hero.
 * Vertical heating block + tilted clamp + a finished balloon + a tube magazine.
 */
function HeroMachine() {
  const arm = useRef<THREE.Group>(null);
  const balloon = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (arm.current) {
      arm.current.rotation.y = Math.sin(t * 0.5) * 0.25;
      arm.current.position.y = 0.4 + Math.sin(t * 0.8) * 0.05;
    }
    if (balloon.current) {
      const s = 1 + Math.sin(t * 1.5) * 0.04;
      balloon.current.scale.set(s, 1, s);
    }
  });

  const teal = useMemo(() => new THREE.MeshStandardMaterial({ color: '#2dd4bf', metalness: 0.6, roughness: 0.3 }), []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4a5a78', metalness: 0.8, roughness: 0.35 }), []);
  const dark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a2536', metalness: 0.5, roughness: 0.6 }), []);
  const amber = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#b45309', emissiveIntensity: 0.4, metalness: 0.3, roughness: 0.4 }), []);

  return (
    <group rotation={[0.1, 0.4, 0]} position={[0, -0.3, 0]}>
      {/* base cabinet */}
      <mesh material={dark} position={[0, -0.9, 0]}>
        <boxGeometry args={[2.2, 0.5, 1.4]} />
      </mesh>
      {/* HMI panel */}
      <mesh material={steel} position={[1.1, -0.5, 0]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.05]} />
      </mesh>
      <mesh material={teal} position={[1.1, -0.5, 0.03]} rotation={[0, -0.3, 0]}>
        <planeGeometry args={[0.22, 0.3]} />
      </mesh>

      {/* heating block (vertical) */}
      <mesh material={steel} position={[0, 0.1, 0]}>
        <boxGeometry args={[0.7, 1.4, 0.5]} />
      </mesh>
      {/* glowing heat indicator */}
      <mesh material={amber} position={[0, 0.1, 0.26]}>
        <boxGeometry args={[0.5, 1.1, 0.02]} />
      </mesh>

      {/* clamp arms */}
      <mesh material={steel} position={[-0.45, 0.6, 0]}>
        <boxGeometry args={[0.12, 0.6, 0.3]} />
      </mesh>
      <mesh material={steel} position={[-0.45, -0.4, 0]}>
        <boxGeometry args={[0.12, 0.6, 0.3]} />
      </mesh>

      {/* finished balloon (the product) */}
      <group ref={arm} position={[0.7, 0.5, 0]}>
        <mesh ref={balloon} material={teal}>
          <capsuleGeometry args={[0.18, 0.5, 8, 16]} />
        </mesh>
        {/* catheter shaft */}
        <mesh material={steel} position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 12]} />
        </mesh>
      </group>

      {/* tube magazine */}
      <mesh material={dark} position={[-0.95, 0.2, 0]}>
        <boxGeometry args={[0.4, 1.6, 0.5]} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} material={steel} position={[-0.95, -0.5 + i * 0.25, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        </mesh>
      ))}

      {/* collection tray */}
      <mesh material={dark} position={[0.7, -0.55, 0]}>
        <boxGeometry args={[0.6, 0.12, 0.4]} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [3.5, 2, 4.5], fov: 38 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 6, 4]} intensity={1.2} castShadow />
      <pointLight position={[-3, 2, -2]} intensity={0.6} color="#2dd4bf" />
      <pointLight position={[2, -1, 3]} intensity={0.4} color="#f59e0b" />

      <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.4}>
        <HeroMachine />
      </Float>

      <ContactShadows position={[0, -1.3, 0]} opacity={0.45} scale={8} blur={2.5} far={3} color="#000000" />
      <Environment preset="city" />
    </Canvas>
  );
}
