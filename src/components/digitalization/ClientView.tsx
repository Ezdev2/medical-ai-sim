import { useState } from 'react';
import type { Store } from '../../store';
import { MATERIALS } from '../../data';
import { Send, Plus, CheckCircle2, Clock, Wrench } from 'lucide-react';

export default function ClientView({ store }: { store: Store }) {
  const [form, setForm] = useState({
    customer: '',
    orderRef: '',
    diameter: 6,
    length: 40,
    material: MATERIALS[1],
    quantity: 100,
  });
  const [submitted, setSubmitted] = useState(false);

  const myOrders = store.orders.filter((o) => o.customer === form.customer || true).slice(0, 6);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addOrder(form);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
    setForm((f) => ({ ...f, orderRef: '', quantity: 100 }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* order form */}
      <div className="card p-6">
        <h3 className="mb-1 text-lg font-semibold text-white">New balloon order</h3>
        <p className="mb-5 text-xs text-slate-500">
          Specify the balloon geometry and target customer. The engineer will receive suggested parameters automatically.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Customer</label>
              <input
                className="input"
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
                placeholder="e.g. MedDevice SA"
                required
              />
            </div>
            <div>
              <label className="label">Order reference</label>
              <input
                className="input"
                value={form.orderRef}
                onChange={(e) => setForm({ ...form, orderRef: e.target.value })}
                placeholder="PO-2026-0142"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Balloon Ø (mm)</label>
              <input
                type="number"
                min={4}
                max={34}
                className="input"
                value={form.diameter}
                onChange={(e) => setForm({ ...form, diameter: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">Length (mm)</label>
              <input
                type="number"
                min={2}
                max={110}
                className="input"
                value={form.length}
                onChange={(e) => setForm({ ...form, length: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Material</label>
              <select
                className="input"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              >
                {MATERIALS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                min={1}
                className="input"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            {submitted ? <><CheckCircle2 className="h-4 w-4" /> Order sent to engineering</> : <><Send className="h-4 w-4" /> Submit order</>}
          </button>
        </form>
      </div>

      {/* recent orders */}
      <div className="card p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Recent orders</h3>
        {myOrders.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-slate-500">
            <Plus className="mb-2 h-8 w-8" />
            <span className="text-sm">No orders yet — submit one to get started.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {myOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-900/50 p-3">
                <div>
                  <div className="text-sm font-medium text-slate-200">{o.customer}</div>
                  <div className="text-xs text-slate-500">
                    Ø{o.diameter}mm · {o.length}mm · {o.material} · {o.quantity} pcs
                  </div>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { c: string; icon: typeof Clock; t: string }> = {
    new: { c: 'bg-slate-500/15 text-slate-300', icon: Clock, t: 'New' },
    approved: { c: 'bg-teal/15 text-teal', icon: CheckCircle2, t: 'Approved' },
    'in-production': { c: 'bg-amber/15 text-amber', icon: Wrench, t: 'In production' },
    done: { c: 'bg-green-500/15 text-green-400', icon: CheckCircle2, t: 'Done' },
  };
  const m = map[status] ?? map.new;
  const Icon = m.icon;
  return (
    <span className={`chip ${m.c}`}>
      <Icon className="h-3 w-3" /> {m.t}
    </span>
  );
}
