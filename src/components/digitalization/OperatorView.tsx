import { useState } from 'react';
import type { Store } from '../../store';
import { fmtTime, STATIONS } from '../../data';
import { Fingerprint, Thermometer, Gauge, Clock, Layers, Snowflake, Ruler, Weight } from 'lucide-react';
import { Clock as ClockIcon } from 'lucide-react';

export default function OperatorView({ store }: { store: Store }) {
  const active = store.orders.find((o) => o.status === 'in-production') ?? null;
  const [badged, setBadged] = useState(false);
  const [station, setStation] = useState(STATIONS[0].id);

  const doBadge = () => {
    setBadged(true);
    store.badgeIn(station, 'L. Haddad');
  };

  if (!active) {
    return (
      <div className="card flex h-64 flex-col items-center justify-center text-slate-500">
        <ClockIcon className="mb-3 h-10 w-10" />
        <p className="text-sm">No active production order.</p>
        <p className="mt-1 text-xs text-slate-600">
          Switch to Engineer role, approve an order and send it to the operator.
        </p>
      </div>
    );
  }

  const p = active.params!;

  const cards = [
    { icon: Ruler, label: 'Parison cut length', value: `${p.parisonCutLength} mm` },
    { icon: Thermometer, label: 'Heating temperature', value: `${p.heatingTemp} °C`, hot: true },
    { icon: Gauge, label: 'Forming pressure', value: `${p.formingPressure} bar` },
    { icon: Clock, label: 'Cycle time', value: `${p.cycleTime} s` },
    { icon: Layers, label: 'Mold ID', value: p.moldId },
    { icon: Snowflake, label: 'Cooling time', value: `${p.coolingTime} s` },
  ];

  return (
    <div className="space-y-6">
      {/* badge check-in */}
      <div className="card flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${badged ? 'bg-green-500/20 text-green-400' : 'bg-teal/15 text-teal'}`}>
            <Fingerprint className="h-6 w-6" />
          </span>
          <div>
            <div className="text-sm font-semibold text-white">Badge check-in</div>
            <div className="text-xs text-slate-500">
              {badged ? `L. Haddad — present at ${fmtTime(Date.now())}` : 'Tap to simulate badge scan & assign to workstation'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select className="input w-auto" value={station} onChange={(e) => setStation(e.target.value)} disabled={badged}>
            {STATIONS.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.name}</option>)}
          </select>
          <button onClick={doBadge} disabled={badged} className={badged ? 'btn-ghost' : 'btn-primary'}>
            {badged ? 'Checked in' : 'Badge in'}
          </button>
        </div>
      </div>

      {/* order header */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">Now producing</div>
            <h3 className="text-lg font-semibold text-white">{active.customer} — Ø{active.diameter}mm × {active.length}mm</h3>
          </div>
          <span className="chip bg-amber/15 text-amber">In production</span>
        </div>
      </div>

      {/* parameter cards — big touch-friendly */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-6">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.hot ? 'bg-amber/15 text-amber' : 'bg-teal/15 text-teal'}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-500">{c.label}</span>
              </div>
              <div className="mt-4 text-3xl font-bold text-white">{c.value}</div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button onClick={() => store.completeOrder(active.id)} className="btn-ghost">
          <Weight className="h-4 w-4" /> Mark order complete
        </button>
      </div>
    </div>
  );
}
