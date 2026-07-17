import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, RoundedBox, ContactShadows, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

export type Mode = 'robot' | 'tricavity' | 'merged';

interface PartLabelProps {
  position: [number, number, number];
  label: string;
}
function PartLabel({ position, label }: PartLabelProps) {
  const [hover, setHover] = useState(false);
  return (
    <group position={position}>
      <mesh
        visible={false}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[0.6, 0.6, 0.6]} />
      </mesh>
      {hover && (
        <Html distanceFactor={8} position={[0, 0.3, 0]} center>
          <div className="whitespace-nowrap rounded-md border border-teal/40 bg-ink-900/95 px-2.5 py-1 text-xs font-medium text-teal shadow-glow">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

const STEEL = '#4a5a78';
const DARK = '#1a2536';
const TEAL = '#2dd4bf';
const AMBER = '#f59e0b';

function mat(color: string, opts?: Partial<THREE.MeshStandardMaterialParameters>) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.7, roughness: 0.35, ...opts });
}

/* ---------- shared sub-parts ---------- */

function HeatingBlock({ x, hot }: { x: number; hot?: boolean }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh material={mat(STEEL)}>
        <boxGeometry args={[0.55, 1.1, 0.45]} />
      </mesh>
      <mesh material={mat(AMBER, { emissive: '#b45309', emissiveIntensity: hot ? 0.6 : 0.2 })} position={[0, 0, 0.23]}>
        <boxGeometry args={[0.4, 0.85, 0.02]} />
      </mesh>
    </group>
  );
}

function ClampCylinder({ x }: { x: number }) {
  return (
    <group position={[x, 0.75, 0]}>
      <mesh material={mat(STEEL)}>
        <cylinderGeometry args={[0.09, 0.09, 0.5, 16]} />
      </mesh>
      <mesh material={mat(DARK)} position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
      </mesh>
    </group>
  );
}

function Cavity({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh material={mat('#33425c')}>
        <boxGeometry args={[0.5, 0.9, 0.4]} />
      </mesh>
      {/* mold channel */}
      <mesh material={mat('#0b1119', { metalness: 0.2, roughness: 0.8 })} position={[0, 0, 0.21]}>
        <boxGeometry args={[0.12, 0.7, 0.05]} />
      </mesh>
    </group>
  );
}

function Magazine({ x }: { x: number }) {
  const tubes = useMemo(() => Array.from({ length: 6 }), []);
  return (
    <group position={[x, 0, 0]}>
      <mesh material={mat(DARK)}>
        <boxGeometry args={[0.4, 1.8, 0.5]} />
      </mesh>
      {tubes.map((_, i) => (
        <mesh key={i} material={mat(STEEL, { metalness: 0.9 })} position={[0, -0.7 + i * 0.26, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.42, 8]} />
        </mesh>
      ))}
    </group>
  );
}

function Tray({ x }: { x: number }) {
  return (
    <group position={[x, -0.7, 0]}>
      <mesh material={mat(DARK)}>
        <boxGeometry args={[0.7, 0.1, 0.45]} />
      </mesh>
      <mesh material={mat(TEAL, { emissive: '#0f766e', emissiveIntensity: 0.2 })} position={[0, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.05, 0.25, 6, 12]} />
      </mesh>
    </group>
  );
}

function HMI({ x }: { x: number }) {
  return (
    <group position={[x, -0.6, 0.3]} rotation={[0, -0.4, 0]}>
      <mesh material={mat(STEEL)}>
        <boxGeometry args={[0.3, 0.45, 0.05]} />
      </mesh>
      <mesh material={mat(TEAL, { emissive: '#0f766e', emissiveIntensity: 0.4 })} position={[0, 0, 0.03]}>
        <planeGeometry args={[0.22, 0.32]} />
      </mesh>
    </group>
  );
}

/* ---------- robot arm ---------- */

interface ArmProps {
  tri?: boolean;
  cavityXs: number[];
  magazineX: number;
  trayX: number;
}

function RobotArm({ tri, cavityXs, magazineX, trayX }: ArmProps) {
  const arm = useRef<THREE.Group>(null);
  const gripper = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const holding = useRef(false);

  const targets = [magazineX, ...cavityXs, trayX];
  const phaseCount = targets.length * 2; // go + return per target

  useFrame((_, delta) => {
    if (!arm.current || !gripper.current) return;
    phase.current += delta * 0.5;
    const t = (phase.current % phaseCount) / phaseCount;
    const seg = Math.floor(t * phaseCount);
    const segT = (t * phaseCount) % 1;
    const eased = segT < 0.5 ? 2 * segT * segT : 1 - Math.pow(-2 * segT + 2, 2) / 2;

    // alternate between targets
    const idx = Math.floor(seg / 2);
    const target = targets[idx % targets.length];
    const returning = seg % 2 === 1;

    arm.current.position.x = returning ? arm.current.position.x : THREE.MathUtils.lerp(arm.current.position.x, target, eased * 0.1);
    if (!returning) arm.current.position.x = THREE.MathUtils.lerp(arm.current.position.x, target, 0.08);

    // gripper up/down
    const targetY = target === magazineX ? -0.3 : target === trayX ? -0.45 : 0.1;
    gripper.current.position.y = THREE.MathUtils.lerp(gripper.current.position.y, targetY, 0.06);

    // grip state
    holding.current = target !== magazineX && target !== trayX;
    const grip = holding.current ? 0.04 : 0.08;
    gripper.current.children.forEach((c, i) => {
      if (i > 0 && i < 3) {
        c.position.x = THREE.MathUtils.lerp(c.position.x, (i === 1 ? -grip : grip), 0.1);
      }
    });
  });

  const fingerCount = tri ? 3 : 1;
  const fingerSpacing = tri ? 0.6 : 0;

  return (
    <group ref={arm} position={[magazineX, 1.4, 0]}>
      {/* rail */}
      <mesh material={mat('#243248')} position={[0, 0, 0]}>
        <boxGeometry args={[3.5, 0.12, 0.2]} />
      </mesh>
      {/* carriage */}
      <mesh material={mat(STEEL)} position={[0, -0.2, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
      </mesh>
      {/* vertical arm */}
      <group ref={gripper} position={[0, -0.8, 0]}>
        <mesh material={mat(STEEL)}>
          <cylinderGeometry args={[0.05, 0.05, 0.6, 12]} />
        </mesh>
        {/* gripper head */}
        <mesh material={mat(DARK)} position={[0, -0.35, 0]}>
          <boxGeometry args={[tri ? 1.6 : 0.2, 0.1, 0.2]} />
        </mesh>
        {Array.from({ length: fingerCount }).map((_, i) => {
          const fx = tri ? (i - 1) * fingerSpacing : 0;
          return (
            <group key={i} position={[fx, -0.45, 0]}>
              <mesh material={mat(STEEL)} position={[-0.08, 0, 0]}>
                <boxGeometry args={[0.04, 0.18, 0.08]} />
              </mesh>
              <mesh material={mat(STEEL)} position={[0.08, 0, 0]}>
                <boxGeometry args={[0.04, 0.18, 0.08]} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}

/* ---------- scene assembly ---------- */

function Scene({ mode }: { mode: Mode }) {
  const showArm = mode === 'robot' || mode === 'merged';
  const tri = mode === 'merged';
  const cavityCount = mode === 'robot' ? 1 : 3;
  const cavitySpacing = 0.7;
  const cavityXs = Array.from({ length: cavityCount }).map((_, i) =>
    (i - (cavityCount - 1) / 2) * cavitySpacing
  );
  const magazineX = -2.2;
  const trayX = 2.2;

  return (
    <group position={[0, -0.2, 0]}>
      {/* tilted table */}
      <RoundedBox args={[5, 0.12, 1.6]} radius={0.04} smoothness={2} material={mat(DARK, { roughness: 0.7 })} position={[0, -0.95, 0]} rotation={[0.08, 0, 0]} />

      {/* base cabinet */}
      <mesh material={mat(DARK)} position={[0, -1.2, 0]}>
        <boxGeometry args={[4.5, 0.4, 1.3]} />
      </mesh>

      {/* cavities + clamps + heating blocks */}
      {cavityXs.map((x, i) => (
        <group key={i}>
          <Cavity x={x} />
          <HeatingBlock x={x} hot />
          <ClampCylinder x={x} />
          <PartLabel position={[x, 1.1, 0]} label={mode === 'robot' ? 'Mold cavity' : `Mold cavity ${i + 1}`} />
          <PartLabel position={[x, 0.55, 0.3]} label={`Heating block ${i + 1}`} />
          <PartLabel position={[x, 1.4, 0]} label={`Clamp cylinder ${i + 1}`} />
        </group>
      ))}

      {/* magazine */}
      <Magazine x={magazineX} />
      <PartLabel position={[magazineX, 1.1, 0]} label="Tube magazine (200+)" />

      {/* tray */}
      <Tray x={trayX} />
      <PartLabel position={[trayX, -0.3, 0]} label="Collection tray" />

      {/* HMI */}
      <HMI x={2.6} />
      <PartLabel position={[2.6, -0.2, 0.6]} label="HMI / PLC panel" />

      {/* robot arm */}
      {showArm && (
        <RobotArm tri={tri} cavityXs={cavityXs} magazineX={magazineX} trayX={trayX} />
      )}
      {showArm && <PartLabel position={[0, 2, 0]} label={tri ? 'Tri-gripper robot arm' : 'Robotic picking unit'} />}

      {/* spec labels */}
      <Text position={[0, -1.7, 0.8]} fontSize={0.13} color="#4a5a78" anchorX="center">
        {mode === 'robot' ? 'BW-TEC 2774 · Auto Balloon Forming' : mode === 'tricavity' ? 'BW-TEC 2530 layout · Tri-cavity' : 'Merged hybrid · Tri-gripper + 3 cavities'}
      </Text>
    </group>
  );
}

export default function MachineScene({ mode }: { mode: Mode }) {
  return (
    <Canvas camera={{ position: [4.5, 2.5, 5], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 4]} intensity={1.1} castShadow />
      <pointLight position={[-4, 3, -3]} intensity={0.5} color={TEAL} />
      <pointLight position={[3, -1, 4]} intensity={0.3} color={AMBER} />

      <Scene mode={mode} />

      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} color="#000000" />
      <OrbitControls enablePan={false} minDistance={4} maxDistance={12} maxPolarAngle={Math.PI / 2.05} />
      <Environment preset="city" />
    </Canvas>
  );
}
