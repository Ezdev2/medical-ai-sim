import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Gauge, Check } from 'lucide-react';

interface Lever {
  id: string;
  label: string;
  desc: string;
  heatingCut: number; // fraction of heating removed
  coolingCut: number; // fraction of cooling removed
}

const LEVERS: Lever[] = [
  { id: 'wall', label: 'Thinner tube wall', desc: 'Less polymer mass to heat through — faster heat-up.', heatingCut: 0.15, coolingCut: 0.1 },
  { id: 'preheat', label: 'External pre-heating', desc: 'Pre-condition tube before entering the mold block.', heatingCut: 0.25, coolingCut: 0.0 },
  { id: 'nucleating', label: 'Nucleating agent', desc: 'Faster crystallization — shorter cooling window.', heatingCut: 0.0, coolingCut: 0.3 },
  { id: 'conformal', label: 'Conformal cooling channels', desc: 'Channels follow mold contour — uniform heat extraction.', heatingCut: 0.05, coolingCut: 0.35 },
];

const BASE_HEATING = 6.5; // min
const BASE_COOLING = 3.0; // min

export default function CycleTimePage() {
  const [active, setActive] = useState<Record<string, boolean>>({
    wall: true,
    preheat: true,
    nucleating: true,
    conformal: true,
  });

  const { heating, cooling, total, baselineTotal } = useMemo(() => {
    let h = BASE_HEATING;
    let c = BASE_COOLING;
    LEVERS.forEach((l) => {
      if (active[l.id]) {
        h *= 1 - l.heatingCut;
        c *= 1 - l.coolingCut;
      }
    });
    return {
      heating: Math.round(h * 10) / 10,
      cooling: Math.round(c * 10) / 10,
      total: Math.round((h + c) * 10) / 10,
      baselineTotal: BASE_HEATING + BASE_COOLING,
    };
  }, [active]);

  const reduction = Math.round((1 - total / baselineTotal) * 100);

  const data = [
    { name: 'Baseline', heating: BASE_HEATING, cooling: BASE_COOLING, optimized: false },
    { name: 'Optimized', heating, cooling, optimized: true },
  ];

  const toggle = (id: string) => setActive((a) => ({ ...a, [id]: !a[id] }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <span className="chip mb-3 border border-amber/30 bg-amber/10 text-amber">
          <Gauge className="h-3.5 w-3.5" /> Solution 05
        </span>
        <h1 className="text-3xl font-bold text-white">Cycle Time Reduction</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Stack the four levers and watch the cycle time drop. Baseline heating (~6.5 min) + cooling (~3 min)
          becomes a combined ~{total} min — a {reduction}% reduction.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* chart */}
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-300">Cycle time: heating + cooling (min)</h3>
            <span className={`chip ${reduction >= 40 ? 'bg-teal/15 text-teal' : 'bg-amber/15 text-amber'}`}>
              {reduction}% reduction
            </span>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2536" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{ background: '#0b1119', border: '1px solid #243248', borderRadius: 8, color: '#e2e8f0' }}
                  formatter={(v) => `${v} min`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="heating" name="Heating" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} animationDuration={600} />
                <Bar dataKey="cooling" name="Cooling" stackId="a" fill="#2dd4bf" radius={[6, 6, 0, 0]} animationDuration={600}>
                  {data.map((d, i) => (
                    <Cell key={i} opacity={d.optimized ? 1 : 0.5} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex justify-around text-center text-xs text-slate-500">
            <div><span className="font-bold text-amber">{BASE_HEATING}</span> + <span className="font-bold text-teal">{BASE_COOLING}</span> = {baselineTotal} min baseline</div>
            <div><span className="font-bold text-amber">{heating}</span> + <span className="font-bold text-teal">{cooling}</span> = <span className="font-bold text-white">{total}</span> min optimized</div>
          </div>
        </div>

        {/* levers */}
        <div className="card p-6">
          <h3 className="mb-1 text-sm font-semibold text-slate-300">Levers</h3>
          <p className="mb-4 text-xs text-slate-500">Toggle each lever to recompute the cycle time live.</p>
          <div className="space-y-3">
            {LEVERS.map((l) => {
              const on = active[l.id];
              return (
                <button
                  key={l.id}
                  onClick={() => toggle(l.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    on ? 'border-teal/50 bg-teal/10' : 'border-ink-700 bg-ink-900/40 opacity-60'
                  }`}
                >
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${on ? 'bg-teal text-ink-950' : 'bg-ink-700 text-slate-500'}`}>
                    {on && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{l.label}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{l.desc}</div>
                    <div className="mt-1 flex gap-3 text-[10px]">
                      {l.heatingCut > 0 && <span className="text-amber">−{Math.round(l.heatingCut * 100)}% heating</span>}
                      {l.coolingCut > 0 && <span className="text-teal">−{Math.round(l.coolingCut * 100)}% cooling</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
