import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Html,
  RoundedBox,
  ContactShadows,
  Environment,
  Text,
  Line,
} from '@react-three/drei';
import * as THREE from 'three';

/* ============================================================================
   NATEC style balloon-forming cell:
   - Full cabinet (hood, control panel, light tower, legs, casters, monitor)
   - Tri-cavity heating block / mold (reduced-cycle-time layout)
   - 6-axis white/black collaborative robot arm doing pick & place
   - Click a cavity to zoom into a labelled cutaway of the heating block
   ========================================================================= */

export type Mode = 'robot' | 'tricavity' | 'merged';

/* ---------------------------------- palette ---------------------------------- */
const ALU = '#c7ccd3';
const ALU_DARK = '#9aa4b2';
const ALU_LIGHT = '#e4e7ec';
const PANEL = '#1c2432';
const PANEL_LIGHT = '#2a3444';
const STEEL = '#5b6572';
const TEAL = '#2dd4bf';
const AMBER = '#f59e0b';
const RED = '#ef4444';
const GREEN = '#22c55e';
const ISO = '#93a8c9';
const ISO_DARK = '#5b6f92';
const COOL = '#7b828c';
const HEAT = '#c2410c';
const MOLD = '#caa46b';
const CAVITY = '#7dd3fc';
const CONE = '#b08968';
const ARM_WHITE = '#f2f4f6';
const ARM_BLACK = '#1a1d22';
const ARM_BLUE = '#3b82c4';

function mat(color: string, opts?: Partial<THREE.MeshStandardMaterialParameters>) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.35, ...opts });
}

/* ---------------------------------- labels ---------------------------------- */
interface LabelProps {
  position: [number, number, number];
  label: string;
  sub?: string;
  always?: boolean;
  accent?: string;
}
function PartLabel({ position, label, sub, always, accent = TEAL }: LabelProps) {
  const [hover, setHover] = useState(false);
  const show = always || hover;
  return (
    <group position={position}>
      {!always && (
        <mesh
          visible={false}
          onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
          onPointerOut={() => setHover(false)}
        >
          <boxGeometry args={[0.6, 0.6, 0.6]} />
        </mesh>
      )}
      {show && (
        <Html distanceFactor={8} position={[0, 0.3, 0]} center>
          <div
            className="whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium shadow-glow"
            style={{
              borderColor: `${accent}66`,
              background: 'rgba(10,14,20,0.95)',
              color: accent,
            }}
          >
            {label}
            {sub && <div className="text-[10px] font-normal text-slate-400">{sub}</div>}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ==========================================================================
   HEATING BLOCK CUTAWAY — cross-section layered exactly like the reference
   diagram: Isolation -> Cooling Body -> Heating Jacket -> Balloon Mold -> Cone
   ========================================================================== */
function HeatingBlockCutaway({
  x,
  hot,
  onSelect,
  scale = 1,
}: {
  x: number;
  hot?: boolean;
  onSelect?: () => void;
  scale?: number;
}) {
  const thetaStart = -0.3;
  const thetaLength = Math.PI * 1.7;
  const H = 1.05;

  const layers = [
    { r: 0.26, color: ISO, h: H, key: 'isolation' },
    { r: 0.205, color: COOL, h: H, key: 'cooling' },
    { r: 0.15, color: HEAT, h: H, hotGlow: true, key: 'heating' },
    { r: 0.09, color: MOLD, h: H * 0.92, key: 'mold' },
  ];

  return (
    <group
      position={[x, 0, 0]}
      scale={scale}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={(e) => { if (onSelect) document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {layers.map((l, i) => (
        <mesh key={i} material={mat(l.color, l.hotGlow ? { emissive: '#7c2d12', emissiveIntensity: hot ? 0.55 : 0.15 } : {})}>
          <cylinderGeometry args={[l.r, l.r, l.h, 24, 1, true, thetaStart, thetaLength]} />
        </mesh>
      ))}
      <mesh material={mat(CAVITY, { emissive: '#0e7490', emissiveIntensity: 0.35, roughness: 0.15 })}>
        <cylinderGeometry args={[0.022, 0.022, H * 0.86, 12]} />
      </mesh>
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh material={mat(CONE)} position={[0, s * (H / 2 + 0.06), 0]} rotation={[s > 0 ? Math.PI : 0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.11, 0.12, 16]} />
          </mesh>
          <mesh material={mat(ISO_DARK)} position={[0, s * (H / 2 + 0.16), 0]}>
            <boxGeometry args={[0.22, 0.1, 0.22]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* Legend shared between the 3D leader lines and the 2D HUD card, so colors,
   names and order always stay in sync. */
const MOLD_LEGEND: { key: string; label: string; color: string; desc: string }[] = [
  { key: 'isolation', label: 'Isolation', color: ISO, desc: 'Shields heat from the frame' },
  { key: 'cooling', label: 'Cooling body', color: COOL, desc: 'Draws heat out fast after forming' },
  { key: 'heating', label: 'Heating jacket', color: HEAT, desc: 'Heats the tube to forming temp' },
  { key: 'mold', label: 'Balloon mold', color: MOLD, desc: 'Shapes the balloon profile' },
  { key: 'cone', label: 'Cone', color: CONE, desc: 'Centers & feeds the tube in/out' },
];

/* Exploded, labelled heating block for the zoom view: layers pull apart
   radially and the cut-away opens wider so every ring reads clearly, with
   leader lines running out to a legend-matched label. */
function ExplodedMold({ x = 0 }: { x?: number }) {
  const group = useRef<THREE.Group>(null);
  const H = 1.05;
  const thetaStart = -0.55;
  const thetaLength = Math.PI * 1.35; // wider notch than the overview cutaway

  const layers = [
    { key: 'isolation', r: 0.3, color: ISO, h: H },
    { key: 'cooling', r: 0.22, color: COOL, h: H },
    { key: 'heating', r: 0.15, color: HEAT, h: H, hotGlow: true },
    { key: 'mold', r: 0.085, color: MOLD, h: H * 0.92 },
  ];

  // anchor point on the visible cut face of each layer, mid-height
  const anchor = (r: number, yFrac: number) => {
    const mid = thetaStart + 0.02;
    return new THREE.Vector3(Math.cos(mid) * r, H * yFrac, Math.sin(mid) * r);
  };

  const labelPos: Record<string, THREE.Vector3> = {
    isolation: new THREE.Vector3(-1.15, 0.62, 0.55),
    cooling: new THREE.Vector3(-1.15, 0.1, 0.55),
    heating: new THREE.Vector3(-1.15, -0.42, 0.55),
    mold: new THREE.Vector3(0, -0.95, 0.7),
    cone: new THREE.Vector3(1.15, 0.55, 0.3),
  };

  return (
    <group position={[x, 0, 0]}>
      <group ref={group}>
        {layers.map((l, i) => (
          <ExplodedLayer key={l.key} r={l.r} h={l.h} color={l.color} hotGlow={l.hotGlow} index={i} thetaStart={thetaStart} thetaLength={thetaLength} />
        ))}
        <mesh material={mat(CAVITY, { emissive: '#0e7490', emissiveIntensity: 0.35, roughness: 0.15 })}>
          <cylinderGeometry args={[0.022, 0.022, H * 0.86, 12]} />
        </mesh>
        {[1, -1].map((s) => (
          <group key={s}>
            <mesh material={mat(CONE)} position={[0, s * (H / 2 + 0.06), 0]} rotation={[s > 0 ? Math.PI : 0, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.11, 0.12, 16]} />
            </mesh>
            <mesh material={mat(ISO_DARK)} position={[0, s * (H / 2 + 0.16), 0]}>
              <boxGeometry args={[0.22, 0.1, 0.22]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* leader lines + labels, colour-matched to the legend */}
      <Leader from={anchor(0.3, 0.3)} to={labelPos.isolation} color={ISO} />
      <PartLabel position={labelPos.isolation.toArray() as [number, number, number]} label="Isolation" accent={ISO} always />

      <Leader from={anchor(0.22, 0.05)} to={labelPos.cooling} color={COOL} />
      <PartLabel position={labelPos.cooling.toArray() as [number, number, number]} label="Cooling body" accent={COOL} always />

      <Leader from={anchor(0.15, -0.2)} to={labelPos.heating} color={HEAT} />
      <PartLabel position={labelPos.heating.toArray() as [number, number, number]} label="Heating jacket" accent={HEAT} always />

      <Leader from={new THREE.Vector3(0, -H * 0.42, 0.09)} to={labelPos.mold} color={MOLD} />
      <PartLabel position={labelPos.mold.toArray() as [number, number, number]} label="Balloon mold" accent={MOLD} always />

      <Leader from={new THREE.Vector3(0.11, H / 2 + 0.06, 0)} to={labelPos.cone} color={CONE} />
      <PartLabel position={labelPos.cone.toArray() as [number, number, number]} label="Cone" accent={CONE} always />
    </group>
  );
}

/* A single exploded ring: eases its own radius outward on mount so the
   layers visibly separate instead of the viewer having to infer nesting. */
function ExplodedLayer({
  r,
  h,
  color,
  hotGlow,
  index,
  thetaStart,
  thetaLength,
}: {
  r: number;
  h: number;
  color: string;
  hotGlow?: boolean;
  index: number;
  thetaStart: number;
  thetaLength: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame(() => {
    t.current = THREE.MathUtils.lerp(t.current, 1, 0.05);
    if (ref.current) {
      const gap = 0.06 * index * t.current; // pull each successive layer out a bit more
      ref.current.scale.setScalar(1 + gap / r);
    }
  });
  return (
    <group ref={ref}>
      <mesh material={mat(color, hotGlow ? { emissive: '#7c2d12', emissiveIntensity: 0.5 } : {})}>
        <cylinderGeometry args={[r, r, h, 28, 1, true, thetaStart, thetaLength]} />
      </mesh>
    </group>
  );
}

/* thin leader line from a part on the mold out to its floating label */
function Leader({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: string }) {
  const mid = from.clone().lerp(to, 0.55).add(new THREE.Vector3(0, 0.02, 0));
  return <Line points={[from, mid, to]} color={color} lineWidth={1.5} transparent opacity={0.7} dashed={false} />;
}

function ClampCylinder({ x }: { x: number }) {
  return (
    <group position={[x, 0.78, 0]}>
      <mesh material={mat(ALU_DARK)}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
      </mesh>
      <mesh material={mat(PANEL)} position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.08, 16]} />
      </mesh>
    </group>
  );
}

function Cavity({ x, onSelect }: { x: number; onSelect?: () => void }) {
  return (
    <group
      position={[x, -0.35, 0]}
      onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <mesh material={mat(STEEL)}>
        <boxGeometry args={[0.42, 0.24, 0.34]} />
      </mesh>
      <mesh material={mat(PANEL, { roughness: 0.7 })} position={[0, 0.1, 0.18]}>
        <boxGeometry args={[0.1, 0.06, 0.04]} />
      </mesh>
    </group>
  );
}

function Magazine({ x }: { x: number }) {
  const tubes = useMemo(() => Array.from({ length: 6 }), []);
  return (
    <group position={[x, 0, 0]}>
      <mesh material={mat(PANEL)}>
        <boxGeometry args={[0.4, 1.8, 0.5]} />
      </mesh>
      {tubes.map((_, i) => (
        <mesh key={i} material={mat('#f3f5f7', { metalness: 0.05, roughness: 0.4 })} position={[0, -0.7 + i * 0.26, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.42, 8]} />
        </mesh>
      ))}
    </group>
  );
}

function Tray({ x }: { x: number }) {
  return (
    <group position={[x, -0.7, 0]}>
      <mesh material={mat(PANEL)}>
        <boxGeometry args={[0.7, 0.1, 0.45]} />
      </mesh>
      <mesh material={mat(TEAL, { emissive: '#0f766e', emissiveIntensity: 0.25 })} position={[0, 0.06, 0]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.05, 0.25, 6, 12]} />
      </mesh>
    </group>
  );
}

/* ---------------------------------- HMI / monitor on a swing arm ---------------------------------- */
function makeChartLine(points: number[], color: string) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const material = new THREE.LineBasicMaterial({ color });
  return new THREE.Line(geometry, material);
}

function Monitor({ x, y }: { x: number; y: number }) {
  const traces = useMemo(
    () => [
      makeChartLine([-0.22, 0.09, 0, -0.12, 0.14, 0, -0.02, 0.06, 0, 0.08, 0.12, 0, 0.2, 0.08, 0], TEAL),
      makeChartLine([-0.22, -0.02, 0, -0.12, -0.06, 0, -0.02, 0.02, 0, 0.08, -0.04, 0, 0.2, -0.01, 0], AMBER),
      makeChartLine([-0.22, -0.14, 0, -0.12, -0.16, 0, -0.02, -0.11, 0, 0.08, -0.15, 0, 0.2, -0.12, 0], '#a78bfa'),
    ],
    []
  );
  return (
    <group position={[x, y, 0]}>
      {/* swing arm */}
      <mesh material={mat(ALU_DARK)} position={[-0.35, -0.25, 0]} rotation={[0, 0, 0.9]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
      </mesh>
      <mesh material={mat(ALU_DARK)}>
        <boxGeometry args={[0.62, 0.42, 0.04]} />
      </mesh>
      <mesh material={mat('#eef2f6', { metalness: 0.1, roughness: 0.2 })} position={[0, 0, 0.025]}>
        <planeGeometry args={[0.54, 0.32]} />
      </mesh>
      {traces.map((t, i) => (
        <primitive key={i} object={t} position={[0, 0.02, 0.03]} />
      ))}
    </group>
  );
}

/* ---------------------------------- cabinet: hood / panel / light tower / legs ---------------------------------- */
function LightTower({ x, z }: { x: number; z: number }) {
  const stack = [RED, AMBER, GREEN];
  return (
    <group position={[x, 0.5, z]}>
      <mesh material={mat(ALU_DARK)} position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.1, 8]} />
      </mesh>
      {stack.map((c, i) => (
        <mesh key={c} material={mat(c, { emissive: c, emissiveIntensity: 0.55, transparent: true, opacity: 0.9 })} position={[0, 0.32 - i * 0.13, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.11, 16]} />
        </mesh>
      ))}
    </group>
  );
}

function EStop({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, -0.55, z]}>
      <mesh material={mat(ALU_DARK)}>
        <cylinderGeometry args={[0.055, 0.055, 0.03, 16]} />
      </mesh>
      <mesh material={mat(RED, { emissive: RED, emissiveIntensity: 0.3 })} position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
      </mesh>
      <mesh material={mat(AMBER)} position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.07, 0.008, 8, 20]} />
      </mesh>
    </group>
  );
}

function ControlPanel({ width }: { width: number }) {
  const buttonCols = useMemo(() => Array.from({ length: 10 }), []);
  return (
    <group position={[0, -0.6, 0.55]} rotation={[-0.15, 0, 0]}>
      <mesh material={mat(PANEL_LIGHT, { roughness: 0.6, metalness: 0.2 })}>
        <boxGeometry args={[width, 0.03, 0.42]} />
      </mesh>
      {buttonCols.map((_, i) => (
        <mesh
          key={i}
          material={mat(i % 3 === 0 ? TEAL : ALU_DARK, { emissive: i % 3 === 0 ? TEAL : '#000000', emissiveIntensity: i % 3 === 0 ? 0.3 : 0 })}
          position={[-width / 2 + 0.5 + i * (width - 1) / buttonCols.length, 0.02, 0]}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
        </mesh>
      ))}
      <EStop x={-width / 2 + 0.25} z={0.15} />
      <EStop x={width / 2 - 0.25} z={0.15} />
    </group>
  );
}

function Hood({ width }: { width: number }) {
  return (
    <group>
      {/* angled canopy over the back of the work area, like the NATEC hood */}
      <mesh material={mat(ALU_LIGHT, { roughness: 0.45 })} position={[0, 0.55, -0.55]} rotation={[0.55, 0, 0]}>
        <boxGeometry args={[width, 0.04, 1.1]} />
      </mesh>
      <mesh material={mat(ALU, { roughness: 0.5 })} position={[0, 0.05, -0.85]}>
        <boxGeometry args={[width, 1.0, 0.05]} />
      </mesh>
      {/* branding strip */}
      <Text position={[0, 0.85, -0.53]} rotation={[0.55, 0, 0]} fontSize={0.11} color="#2f6fb3" anchorX="center" anchorY="middle">
        NATEC
      </Text>
      {/* side wings of the hood */}
      {[-1, 1].map((s) => (
        <mesh key={s} material={mat(ALU_LIGHT, { roughness: 0.45 })} position={[s * (width / 2 - 0.02), 0.4, -0.55]} rotation={[0, 0, s * 0.5]}>
          <boxGeometry args={[0.04, 0.9, 1.1]} />
        </mesh>
      ))}
    </group>
  );
}

function LegsAndCasters({ width, depth }: { width: number; depth: number }) {
  const legX = width / 2 - 0.18;
  const legZ = depth / 2 - 0.15;
  const corners: [number, number][] = [
    [-legX, -legZ],
    [legX, -legZ],
    [-legX, legZ],
    [legX, legZ],
  ];
  return (
    <group position={[0, -1.9, 0]}>
      {corners.map(([lx, lz], i) => (
        <group key={i} position={[lx, 0, lz]}>
          <mesh material={mat(ALU_DARK)} position={[0, 0.45, 0]}>
            <boxGeometry args={[0.07, 0.9, 0.07]} />
          </mesh>
          {/* pneumatic valve block hanging on the two front legs */}
          {lz < 0 && (
            <mesh material={mat(PANEL)} position={[0, 0.65, 0.06]}>
              <boxGeometry args={[0.14, 0.18, 0.1]} />
            </mesh>
          )}
          {/* caster wheel */}
          <mesh material={mat('#141821', { roughness: 0.8 })} position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
          </mesh>
          <mesh material={mat(ALU_DARK)} position={[0, 0.06, 0]}>
            <boxGeometry args={[0.1, 0.05, 0.1]} />
          </mesh>
        </group>
      ))}
      {/* diagonal cross braces, front */}
      <mesh material={mat(ALU_DARK, { transparent: true, opacity: 0.9 })} position={[0, 0.45, -legZ]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[width - 0.3, 0.03, 0.03]} />
      </mesh>
    </group>
  );
}

function BaseCabinet({ width, depth }: { width: number; depth: number }) {
  return (
    <group>
      <mesh material={mat(PANEL, { roughness: 0.55 })} position={[0, -1.35, 0]}>
        <boxGeometry args={[width, 1.0, depth]} />
      </mesh>
      {/* cable duct box, bottom-left, echoing the reference photo */}
      <mesh material={mat(PANEL_LIGHT)} position={[-width / 2 + 0.15, -0.85, depth / 2 - 0.1]}>
        <boxGeometry args={[0.22, 0.5, 0.16]} />
      </mesh>
    </group>
  );
}

/* ==========================================================================
   ROBOT ARM — 6-axis white/black collaborative arm on a round base,
   picking tube stock from the magazine and placing it into each cavity.
   ========================================================================== */
interface ArmProps {
  cavityXs: number[];
  magazineX: number;
  trayX: number;
  baseY: number;
}

function JointSphere({ radius = 0.075 }: { radius?: number }) {
  return (
    <mesh material={mat(ARM_BLACK, { metalness: 0.3, roughness: 0.4 })}>
      <sphereGeometry args={[radius, 20, 20]} />
    </mesh>
  );
}
function ArmLink({ length, radius = 0.055 }: { length: number; radius?: number }) {
  return (
    <mesh material={mat(ARM_WHITE, { metalness: 0.15, roughness: 0.3 })} position={[0, -length / 2, 0]}>
      <cylinderGeometry args={[radius, radius * 0.92, length, 20]} />
    </mesh>
  );
}
function AccentRing({ radius }: { radius: number }) {
  return (
    <mesh material={mat(ARM_BLUE, { emissive: ARM_BLUE, emissiveIntensity: 0.4 })} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 8, 24]} />
    </mesh>
  );
}

function RobotArm({ cavityXs, magazineX, trayX, baseY }: ArmProps) {
  const shoulder = useRef<THREE.Group>(null);
  const upperArm = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const wrist = useRef<THREE.Group>(null);
  const gripL = useRef<THREE.Mesh>(null);
  const gripR = useRef<THREE.Mesh>(null);

  const targets = useMemo(() => [magazineX, ...cavityXs, trayX], [magazineX, cavityXs, trayX]);
  const phase = useRef(0);

  useFrame((_, delta) => {
    if (!shoulder.current || !upperArm.current || !elbow.current || !wrist.current) return;
    const cycle = targets.length * 2;
    phase.current += delta * 0.45;
    const t = (phase.current % cycle) / cycle;
    const segF = t * cycle;
    const seg = Math.floor(segF);
    const segT = segF - seg;
    const eased = segT < 0.5 ? 2 * segT * segT : 1 - Math.pow(-2 * segT + 2, 2) / 2;

    const idx = Math.floor(seg / 2) % targets.length;
    const nextIdx = (idx + 1) % targets.length;
    const from = targets[idx];
    const to = targets[nextIdx];
    const returning = seg % 2 === 1;
    const targetX = returning ? THREE.MathUtils.lerp(from, to, eased) : from;

    // base rotates to aim the whole arm at the current target
    const dx = targetX - 0; // base mounted at world x = 0
    const yaw = Math.atan2(dx, 2.1);
    shoulder.current.rotation.y = THREE.MathUtils.lerp(shoulder.current.rotation.y, yaw, 0.08);

    // reach down to pick/place, then lift while transiting
    const reaching = !returning && segT > 0.35;
    const pitchTarget = reaching ? 0.95 : 0.35;
    upperArm.current.rotation.x = THREE.MathUtils.lerp(upperArm.current.rotation.x, pitchTarget, 0.1);
    elbow.current.rotation.x = THREE.MathUtils.lerp(elbow.current.rotation.x, reaching ? 0.9 : 0.5, 0.1);
    wrist.current.rotation.x = THREE.MathUtils.lerp(wrist.current.rotation.x, reaching ? -0.6 : -0.2, 0.1);

    const holding = (target: number) => target !== magazineX && target !== trayX;
    const grip = holding(from) && !reaching ? 0.012 : 0.03;
    if (gripL.current && gripR.current) {
      gripL.current.position.x = THREE.MathUtils.lerp(gripL.current.position.x, -grip, 0.15);
      gripR.current.position.x = THREE.MathUtils.lerp(gripR.current.position.x, grip, 0.15);
    }
  });

  return (
    <group position={[0, baseY, -0.3]}>
      {/* round base plate */}
      <mesh material={mat(ARM_BLACK, { metalness: 0.4, roughness: 0.4 })} position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.06, 24]} />
      </mesh>
      <group ref={shoulder}>
        <JointSphere radius={0.09} />
        <AccentRing radius={0.095} />
        <group ref={upperArm} rotation={[0.35, 0, 0]}>
          <ArmLink length={0.55} radius={0.05} />
          <group position={[0, -0.55, 0]}>
            <JointSphere radius={0.07} />
            <AccentRing radius={0.075} />
            <group ref={elbow} rotation={[0.5, 0, 0]}>
              <ArmLink length={0.48} radius={0.045} />
              <group position={[0, -0.48, 0]}>
                <JointSphere radius={0.06} />
                <group ref={wrist} rotation={[-0.2, 0, 0]}>
                  <ArmLink length={0.24} radius={0.035} />
                  {/* gripper */}
                  <group position={[0, -0.26, 0]}>
                    <mesh material={mat(ARM_BLACK)}>
                      <boxGeometry args={[0.16, 0.05, 0.09]} />
                    </mesh>
                    <mesh ref={gripL} material={mat(ARM_WHITE)} position={[-0.03, -0.06, 0]}>
                      <boxGeometry args={[0.025, 0.11, 0.05]} />
                    </mesh>
                    <mesh ref={gripR} material={mat(ARM_WHITE)} position={[0.03, -0.06, 0]}>
                      <boxGeometry args={[0.025, 0.11, 0.05]} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/* ==========================================================================
   CAMERA RIG — smoothly moves between the overview pose and a mold zoom pose
   ========================================================================== */
function CameraRig({
  target,
  distance,
  controlsRef,
}: {
  target: THREE.Vector3;
  distance: number;
  controlsRef: React.RefObject<any>;
}) {
  const { camera } = useThree();
  const key = `${target.x.toFixed(2)},${target.y.toFixed(2)},${target.z.toFixed(2)},${distance}`;
  const prevKey = useRef('');
  const animating = useRef(true);

  useEffect(() => {
    if (key !== prevKey.current) {
      animating.current = true; // (re)start the fly-to whenever the target/distance changes
      prevKey.current = key;
    }
  }, [key]);

  useFrame(() => {
    if (!animating.current) return; // let OrbitControls own the camera the rest of the time
    const dir = new THREE.Vector3(0.55, 0.35, 1).normalize();
    const desired = target.clone().add(dir.multiplyScalar(distance));
    camera.position.lerp(desired, 0.08);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(target, 0.1);
      controlsRef.current.update();
    } else {
      camera.lookAt(target);
    }
    if (camera.position.distanceTo(desired) < 0.03) {
      animating.current = false; // transition finished, stop touching the camera
    }
  });
  return null;
}

/* ---------------------------------- scene assembly ---------------------------------- */
function Scene({
  mode,
  selected,
  setSelected,
}: {
  mode: Mode;
  selected: number | null;
  setSelected: (i: number | null) => void;
}) {
  const showArm = mode !== 'tricavity';
  const cavityCount = 3; // reduced-cycle tri-cavity layout
  const cavitySpacing = 0.7;
  const cavityXs = Array.from({ length: cavityCount }).map((_, i) => (i - (cavityCount - 1) / 2) * cavitySpacing);
  const magazineX = -2.2;
  const trayX = 2.2;
  const cabinetWidth = 5.0;
  const cabinetDepth = 1.5;

  return (
    <group position={[0, -0.2, 0]} visible={selected === null}>
      {/* tilted work surface */}
      <RoundedBox args={[cabinetWidth, 0.12, 1.6]} radius={0.04} smoothness={2} material={mat(ALU, { roughness: 0.5 })} position={[0, -0.95, 0]} rotation={[0.08, 0, 0]} />
      <Hood width={cabinetWidth} />
      <ControlPanel width={cabinetWidth - 0.6} />
      <BaseCabinet width={cabinetWidth} depth={cabinetDepth} />
      <LegsAndCasters width={cabinetWidth} depth={cabinetDepth} />
      <LightTower x={-cabinetWidth / 2 + 0.15} z={-0.3} />

      {[-2.15, 2.15].map((fx) => (
        <mesh key={fx} material={mat(ALU_DARK)} position={[fx, -0.5, -0.7]}>
          <boxGeometry args={[0.05, 1.4, 0.05]} />
        </mesh>
      ))}

      {cavityXs.map((x, i) => (
        <group key={i}>
          <Cavity x={x} onSelect={() => setSelected(i)} />
          <HeatingBlockCutaway x={x} hot onSelect={() => setSelected(i)} />
          <ClampCylinder x={x} />
          <PartLabel position={[x, 1.1, 0]} label={`Cavity ${i + 1} — heating block`} sub="Click to inspect" />
          <PartLabel position={[x, 1.4, 0]} label={`Clamp cylinder ${i + 1}`} />
        </group>
      ))}

      <Magazine x={magazineX} />
      <PartLabel position={[magazineX, 1.1, 0]} label="Tube magazine (200+)" />

      <Tray x={trayX} />
      <PartLabel position={[trayX, -0.3, 0]} label="Collection tray" />

      <Monitor x={1.9} y={1.55} />
      <PartLabel position={[1.9, 1.85, 0]} label="HMI / process monitor" />

      {showArm && (
        <RobotArm cavityXs={cavityXs} magazineX={magazineX} trayX={trayX} baseY={1.05} />
      )}
      {showArm && <PartLabel position={[0, 2.05, -0.3]} label="6-axis pick & place arm" />}

      <Text position={[0, -1.72, 0.85]} fontSize={0.12} color="#8a8f98" anchorX="center">
        Tri-cavity heating block · robot-fed · reduced cycle time
      </Text>
    </group>
  );
}

/* Zoomed inspection of a single cavity's heating block, matching the
   reference cutaway diagram with persistent callouts. */
function ZoomScene({ index }: { index: number }) {
  return (
    <group position={[0, 0.15, 0]} rotation={[0, -0.35, 0]} scale={1.35}>
      <ExplodedMold />
      <Text position={[0, 1.05, 0]} fontSize={0.13} color={TEAL} anchorX="center">
        {`Cavity ${index + 1} — heating block, exploded`}
      </Text>
      <Text position={[0, -1.5, 0]} fontSize={0.08} color="#8a8f98" anchorX="center" maxWidth={2.4}>
        Layers pulled apart for clarity — in the real block they nest tightly
        around the tube, isolation outermost, mold innermost.
      </Text>
    </group>
  );
}

export default function MachineScene({ mode = 'merged' }: { mode?: Mode }) {
  const [selected, setSelected] = useState<number | null>(null);
  const controlsRef = useRef<any>(null);
  const cavitySpacing = 0.7;
  const cavityCount = 3;
  const cavityXs = Array.from({ length: cavityCount }).map((_, i) => (i - (cavityCount - 1) / 2) * cavitySpacing);

  const target = useMemo(() => {
    if (selected === null) return new THREE.Vector3(0, 0.1, 0);
    return new THREE.Vector3(0, 0.1, 0);
  }, [selected]);
  const distance = selected === null ? 7 : 3.4;

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [4.5, 2.5, 5], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[6, 8, 4]} intensity={1.2} castShadow />
        <pointLight position={[-4, 3, -3]} intensity={0.4} color={TEAL} />
        <pointLight position={[3, -1, 4]} intensity={0.25} color={AMBER} />

        <Scene mode={mode} selected={selected} setSelected={setSelected} />
        {selected !== null && <ZoomScene index={selected} />}

        <CameraRig target={target} distance={distance} controlsRef={controlsRef} />

        <ContactShadows position={[0, -1.5, 0]} opacity={0.35} scale={10} blur={2.5} far={4} color="#000000" />
        <OrbitControls ref={controlsRef} enablePan={false} minDistance={1.2} maxDistance={12} maxPolarAngle={Math.PI / 2.05} />
        <Environment preset="city" />
      </Canvas>

      {/* Back button when zoomed into a cavity */}
      {selected !== null && (
        <button
          onClick={() => setSelected(null)}
          className="absolute left-4 top-4 rounded-md border border-teal/40 bg-ink-900/90 px-3 py-1.5 text-sm font-medium text-teal shadow-glow transition hover:bg-ink-900"
        >
          ← Back to machine
        </button>
      )}

      {/* Mold layer legend, shown while zoomed in */}
      {selected !== null && (
        <div className="absolute right-4 top-4 w-56 rounded-lg border border-teal/30 bg-ink-900/90 p-3 shadow-glow">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal">
            Heating block layers
          </div>
          <div className="space-y-1.5">
            {MOLD_LEGEND.map((l) => (
              <div key={l.key} className="flex items-start gap-2">
                <span
                  className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ background: l.color }}
                />
                <div className="leading-tight">
                  <div className="text-[11px] font-medium text-slate-200">{l.label}</div>
                  <div className="text-[10px] text-slate-400">{l.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cycle-time explainer HUD */}
      {selected === null && (
        <div className="absolute bottom-4 right-4 w-64 rounded-lg border border-teal/30 bg-ink-900/90 p-3 shadow-glow">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal">
            Parallel tri-cavity forming
          </div>
          <div className="space-y-1.5">
            {cavityXs.map((_, i) => (
              <CycleBar key={i} label={`Cavity ${i + 1}`} offset={i * 0.28} />
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-slate-400">
            Three cavities heat and form simultaneously off a single robot feed —
            cycle time drops vs. a single-cavity machine at the same throughput.
          </p>
        </div>
      )}
    </div>
  );
}

/* small animated progress indicator for the cycle-time HUD */
function CycleBar({ label, offset }: { label: string; offset: number }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now() - offset * 1000;
    const loop = (now: number) => {
      const t = ((now - start) / 3200) % 1;
      setPct(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [offset]);
  return (
    <div className="flex items-center gap-2 text-[11px] text-slate-300">
      <span className="w-14 shrink-0">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct * 100}%`, background: pct > 0.85 ? AMBER : TEAL }}
        />
      </div>
    </div>
  );
}