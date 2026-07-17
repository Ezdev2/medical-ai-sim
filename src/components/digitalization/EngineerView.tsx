import { useState } from 'react';
import type { Store } from '../../store';
import type { BalloonOrder, ParameterSheet } from '../../data';
import { suggestParams, MOLD_IDS, fmtTime } from '../../data';
import { CheckCircle2, Send, ArrowLeft, Clock, CheckCircle, Wrench } from 'lucide-react';

export default function EngineerView({ store }: { store: Store }) {
  const [selected, setSelected] = useState<BalloonOrder | null>(null);
  const current = selected ? store.orders.find((o) => o.id === selected.id) ?? null : null;

  if (current) return <Detail order={current} store={store} onBack={() => setSelected(null)} />;

  const queue = store.orders;
  return (
    <div className="card p-6">
      <h3 className="mb-1 text-lg font-semibold text-white">Order queue</h3>
      <p className="mb-5 text-xs text-slate-500">
        Open an order to review the auto-suggested parameter sheet, edit any field, then approve and send to the operator.
      </p>
      {queue.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-slate-500">
          <Clock className="mb-2 h-8 w-8" />
          <span className="text-sm">No orders in the queue. Switch to the Client role to submit one.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {queue.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelected(o)}
              className="flex w-full items-center justify-between rounded-lg border border-ink-700 bg-ink-900/50 p-4 text-left transition-colors hover:border-teal/50 hover:bg-ink-700/40"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-slate-600">#{o.id}</span>
                <div>
                  <div className="text-sm font-medium text-slate-200">{o.customer} — {o.orderRef || 'no ref'}</div>
                  <div className="text-xs text-slate-500">
                    Ø{o.diameter}mm · L{o.length}mm · {o.material} · {o.quantity} pcs · {fmtTime(o.createdAt)}
                  </div>
                </div>
              </div>
              <StatusBadge status={o.status} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ order, store, onBack }: { order: BalloonOrder; store: Store; onBack: () => void }) {
  const [params, setParams] = useState<ParameterSheet>(
    order.params ?? suggestParams(order)
  );
  const [edited, setEdited] = useState(false);

  const set = (k: keyof ParameterSheet, v: string | number) => {
    setParams((p) => ({ ...p, [k]: v }));
    setEdited(true);
  };

  const approve = () => {
    store.approveOrder(order.id, params);
  };
  const send = () => {
    store.sendToOperator(order.id);
    onBack();
  };

  return (
    <div className="card p-6">
      <button onClick={onBack} className="btn-ghost mb-5">
        <ArrowLeft className="h-4 w-4" /> Back to queue
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{order.customer} — {order.orderRef || '#' + order.id}</h3>
          <p className="text-xs text-slate-500">
            Ø{order.diameter}mm · L{order.length}mm · {order.material} · {order.quantity} pcs
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-300">Parameter sheet</h4>
        <span className="text-xs text-slate-500">
          {edited ? 'Edited' : 'Auto-suggested defaults'} — all fields editable
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Parison cut length (mm)" value={params.parisonCutLength} onChange={(v) => set('parisonCutLength', v)} />
        <Field label="Heating temp (°C)" value={params.heatingTemp} min={20} max={250} onChange={(v) => set('heatingTemp', v)} />
        <Field label="Forming pressure (bar)" value={params.formingPressure} min={0} max={50} step={0.1} onChange={(v) => set('formingPressure', v)} />
        <Field label="Cycle time (sec)" value={params.cycleTime} onChange={(v) => set('cycleTime', v)} />
        <div>
          <label className="label">Mold ID</label>
          <select className="input" value={params.moldId} onChange={(e) => set('moldId', e.target.value)}>
            {MOLD_IDS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <Field label="Cooling time (sec)" value={params.coolingTime} onChange={(v) => set('coolingTime', v)} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {order.status === 'new' && (
          <button onClick={approve} className="btn-primary">
            <CheckCircle2 className="h-4 w-4" /> Approve parameters
          </button>
        )}
        {order.status === 'approved' && (
          <button onClick={send} className="btn-primary">
            <Send className="h-4 w-4" /> Send to operator
          </button>
        )}
        {order.status === 'in-production' && (
          <span className="chip bg-amber/15 text-amber"><Wrench className="h-3.5 w-3.5" /> With operator — in production</span>
        )}
        {order.status === 'done' && (
          <span className="chip bg-green-500/15 text-green-400"><CheckCircle className="h-3.5 w-3.5" /> Completed</span>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, min, max, step }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="number"
        className="input"
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { c: string; t: string }> = {
    new: { c: 'bg-slate-500/15 text-slate-300', t: 'New' },
    approved: { c: 'bg-teal/15 text-teal', t: 'Approved' },
    'in-production': { c: 'bg-amber/15 text-amber', t: 'In production' },
    done: { c: 'bg-green-500/15 text-green-400', t: 'Done' },
  };
  const m = map[status] ?? map.new;
  return <span className={`chip ${m.c}`}>{m.t}</span>;
}
