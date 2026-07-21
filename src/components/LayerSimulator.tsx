import { useMemo, useState } from 'react';
import { LayoutGrid, Cpu, Gauge, Bot, Layers } from 'lucide-react';

type LayerId = 'clean' | 'dig' | 'cycle' | 'robot' | 'tri';

interface Layer {
  id: LayerId;
  name: string;
  note: string;
  icon: typeof LayoutGrid;
  color: string; // tailwind color name already used in the palette (teal / amber / rose)
  hex: string; // for the inline bar segment
  mult: number;
  invK: number; // CHF, thousands
  weeks: number;
}

const LAYERS: Layer[] = [
  { id: 'clean', name: 'Cleanroom layout', note: 'No investment', icon: LayoutGrid, color: 'teal', hex: '#2dd4bf', mult: 1.02, invK: 0, weeks: 3 },
  { id: 'dig', name: 'Digitalization + AI', note: 'Low investment', icon: Cpu, color: 'teal', hex: '#14b8a6', mult: 1.08, invK: 20, weeks: 6 },
  { id: 'cycle', name: 'Cycle time reduction', note: 'Medium investment', icon: Gauge, color: 'amber', hex: '#f59e0b', mult: 1.18, invK: 60, weeks: 10 },
  { id: 'robot', name: 'Robot arm', note: 'High investment', icon: Bot, color: 'amber', hex: '#fb923c', mult: 1.3, invK: 250, weeks: 14 },
  { id: 'tri', name: 'Tri-cavity mold', note: 'High investment', icon: Layers, color: 'amber', hex: '#f43f5e', mult: 3.0, invK: 150, weeks: 12 },
];

const BASE = 150_000;
const TARGET = 750_000;
const SCALE_MAX = 900_000;

export default function LayerSimulator() {
  const [checked, setChecked] = useState<Record<LayerId, boolean>>({
    clean: true, dig: true, cycle: true, robot: true, tri: true,
  });

  const toggle = (id: LayerId) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  const { production, multiplier, investment, weeks, segments } = useMemo(() => {
    let cumulative = BASE;
    let inv = 0;
    let maxWeeks = 0;
    const segs: { hex: string; widthPct: number }[] = [
      { hex: '#64748b', widthPct: (BASE / SCALE_MAX) * 100 },
    ];
    for (const layer of LAYERS) {
      if (!checked[layer.id]) continue;
      const before = cumulative;
      cumulative *= layer.mult;
      inv += layer.invK;
      maxWeeks = Math.max(maxWeeks, layer.weeks);
      segs.push({ hex: layer.hex, widthPct: ((cumulative - before) / SCALE_MAX) * 100 });
    }
    return {
      production: Math.round(cumulative),
      multiplier: cumulative / BASE,
      investment: inv,
      weeks: maxWeeks,
      segments: segs,
    };
  }, [checked]);

  const gain = production - BASE;
  const roiLabel = investment > 0 ? `+${Math.round(gain / investment)} balloons / k CHF` : gain > 0 ? 'gain at no cost' : '—';

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="mb-8">
        <h2 className="section-title">Investment vs. production</h2>
        <p className="mt-1 text-sm text-slate-500">
          Toggle each layer to see production, investment and implementation time recalculate live.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="card px-4 py-4">
          <div className="text-xs text-slate-500">Production / year</div>
          <div className="mt-1 text-2xl font-bold text-white">{production.toLocaleString('en-US')}</div>
          <div className="mt-0.5 text-xs text-teal">x{multiplier.toFixed(2)}</div>
        </div>
        <div className="card px-4 py-4">
          <div className="text-xs text-slate-500">Investment</div>
          <div className="mt-1 text-2xl font-bold text-white">{investment}k CHF</div>
          <div className="mt-0.5 text-xs text-slate-400">{roiLabel}</div>
        </div>
        <div className="card px-4 py-4">
          <div className="text-xs text-slate-500">Implementation</div>
          <div className="mt-1 text-2xl font-bold text-white">{weeks} wks</div>
          <div className="mt-0.5 text-xs text-slate-400">critical path</div>
        </div>
      </div>

      <div className="relative h-8 w-full overflow-hidden rounded-lg bg-slate-900">
        <div className="absolute inset-0 flex">
          {segments.map((s, i) => (
            <div key={i} style={{ width: `${s.widthPct}%`, background: s.hex }} />
          ))}
        </div>
        <div
          className="absolute -top-1.5 -bottom-1.5 w-0.5 bg-rose-500"
          style={{ left: `${(TARGET / SCALE_MAX) * 100}%` }}
        />
      </div>
      <div className="mb-6 mt-1 text-right text-xs text-slate-500">Target 5x — 750,000</div>

      <div className="grid gap-3 sm:grid-cols-2">
        {LAYERS.map((l) => {
          const Icon = l.icon;
          const accent = l.color === 'amber' ? 'amber' : 'teal';
          return (
            <label
              key={l.id}
              className={`card flex cursor-pointer items-center gap-3 px-4 py-3 ${
                checked[l.id] ? (accent === 'amber' ? 'border-amber/60' : 'border-teal/60') : ''
              }`}
            >
              <input
                type="checkbox"
                checked={checked[l.id]}
                onChange={() => toggle(l.id)}
                className="h-4 w-4 flex-shrink-0"
              />
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  accent === 'amber' ? 'bg-amber/15 text-amber ring-1 ring-amber/30' : 'bg-teal/15 text-teal ring-1 ring-teal/30'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-medium text-white">{l.name}</span>
                <span className="block text-xs text-slate-500">{l.note}</span>
              </span>
              <span className="font-mono text-xs text-slate-500">
                x{l.mult.toFixed(2)} · {l.invK}k · {l.weeks}w
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}