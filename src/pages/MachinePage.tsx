import { Suspense, lazy, useState } from 'react';
import type { Mode } from '../components/MachineScene';
import { Bot, Layers, Combine, Clock, Info } from 'lucide-react';

const MachineScene = lazy(() => import('../components/MachineScene'));

const modes: { id: Mode; label: string; icon: typeof Bot; desc: string; cycle: string }[] = [
  { id: 'robot', label: 'Robot arm only', icon: Bot, desc: 'Single-cavity mold + single-gripper robotic arm. Full auto load/unload cycle.', cycle: '~95 sec/cycle' },
  { id: 'tricavity', label: 'Tri-cavity only', icon: Layers, desc: '3 cavities side-by-side on one linear slide, tilted table. Manual loading.', cycle: '~140 sec/cycle (manual)' },
  { id: 'merged', label: 'Merged (hybrid)', icon: Combine, desc: 'Tri-gripper arm services all 3 cavities together — the combined solution.', cycle: '~52 sec/cycle' },
];

const specs: Record<Mode, { label: string; items: string[] }[]> = {
  robot: [
    { label: 'Base', items: ['NATEC 2774 Auto Balloon Forming', 'Footprint 1050×720×2240mm', '~315 kg'] },
    { label: 'Range', items: ['Balloon Ø 4–34mm', 'Length 2–110mm', 'Temp 20–250°C', 'Pressure 0–50 bar'] },
  ],
  tricavity: [
    { label: 'Base', items: ['NATEC 2530 "4up" layout (3 cavities)', 'Footprint 1550×990×1640mm', '~400 kg'] },
    { label: 'Range', items: ['Up to 600 balloons/shift', 'Mold Ø 1–14mm', 'Mold length 8–60mm', 'Temp 20–250°C'] },
  ],
  merged: [
    { label: 'Combined', items: ['2774 robot arm + 2530 tri-cavity', 'Tri-gripper end effector', 'Simultaneous 3-cavity service'] },
    { label: 'Gain', items: ['~45% cycle time vs robot-only', '3× throughput per arm swing', 'Full automation retained'] },
  ],
};

export default function MachinePage() {
  const [mode, setMode] = useState<Mode>('merged');

  const active = modes.find((m) => m.id === mode)!;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <span className="chip mb-3 border border-teal/30 bg-teal/10 text-teal">
          <Bot className="h-3.5 w-3.5" /> Solutions 02 + 03
        </span>
        <h1 className="text-3xl font-bold text-white">Robot Arm & Tri-Cavity Mold</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          The centerpiece — modelled on real NATEC forming machines. Toggle between the single-cavity
          robotic arm (2774), the tri-cavity mold (2530 layout), and the merged hybrid where a tri-gripper
          services all three cavities. Drag to orbit, scroll to zoom, hover parts for labels.
        </p>
      </div>

      {/* toggle buttons */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`card flex items-start gap-3 p-4 text-left transition-all ${
                isActive ? 'border-teal bg-teal/10 shadow-glow' : 'card-hover'
              }`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isActive ? 'bg-teal text-ink-950' : 'bg-ink-700 text-slate-300'}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <div className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-200'}`}>{m.label}</div>
                <div className="mt-0.5 text-xs text-slate-500">{m.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3D canvas + side panel */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="relative h-[420px] overflow-hidden rounded-2xl border border-ink-700 bg-gradient-to-br from-ink-900 to-ink-950 sm:h-[520px]">
          <div className="grid-bg absolute inset-0 opacity-30" />
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-slate-500">
                <span className="animate-pulse-soft">Loading 3D scene…</span>
              </div>
            }
          >
            <MachineScene mode={mode} />
          </Suspense>
          <div className="pointer-events-none absolute bottom-3 left-3 text-[10px] text-slate-600">
            Drag to orbit · Scroll to zoom · Hover parts for labels
          </div>
        </div>

        {/* side panel */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
              <Clock className="h-3.5 w-3.5" /> Simulated cycle time
            </div>
            <div className="mt-2 text-3xl font-bold text-teal">{active.cycle}</div>
            <p className="mt-1 text-[11px] text-slate-500">
              Illustrative only — not measured from the real machine.
            </p>
          </div>

          <div className="card p-5">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
              <Info className="h-3.5 w-3.5" /> Reference specs
            </div>
            <div className="space-y-3">
              {specs[mode].map((g) => (
                <div key={g.label}>
                  <div className="mb-1 text-xs font-semibold text-slate-300">{g.label}</div>
                  <ul className="space-y-0.5">
                    {g.items.map((it) => (
                      <li key={it} className="text-xs text-slate-500">· {it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
