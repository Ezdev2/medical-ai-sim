import { useMemo, useState } from 'react';
import { useStore } from '../store';
import type { Role } from '../data';
import ClientView from '../components/digitalization/ClientView';
import EngineerView from '../components/digitalization/EngineerView';
import OperatorView from '../components/digitalization/OperatorView';
import CleanroomView from '../components/digitalization/CleanroomView';
import { Database, User, Wrench, Tablet, LayoutGrid, RotateCcw } from 'lucide-react';

const roleMeta: { id: Role; label: string; icon: typeof User; desc: string }[] = [
  { id: 'client', label: 'Client', icon: User, desc: 'Place a balloon order' },
  { id: 'engineer', label: 'Engineer / Admin', icon: Wrench, desc: 'Approve parameter sheets' },
  { id: 'operator', label: 'Operator', icon: Tablet, desc: 'View active production sheet' },
];

export default function DigitalizationPage() {
  const store = useStore();
  const [tab, setTab] = useState<'workflow' | 'cleanroom'>('workflow');

  const counts = useMemo(
    () => ({
      new: store.orders.filter((o) => o.status === 'new').length,
      approved: store.orders.filter((o) => o.status === 'approved').length,
      prod: store.orders.filter((o) => o.status === 'in-production').length,
    }),
    [store.orders]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="chip mb-3 border border-teal/30 bg-teal/10 text-teal">
            <Database className="h-3.5 w-3.5" /> Solution 01
          </span>
          <h1 className="text-3xl font-bold text-white">Digitalization</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Replace paper parameter forms and manual client orders with a digital workflow.
            Switch roles to see the same data flow from order entry → engineer approval → operator execution.
          </p>
        </div>
        <button onClick={store.resetAll} className="btn-ghost self-start">
          <RotateCcw className="h-4 w-4" /> Reset demo data
        </button>
      </div>

      {/* view tabs */}
      <div className="mb-6 flex gap-2 rounded-xl border border-ink-700 bg-ink-800/50 p-1">
        <button
          onClick={() => setTab('workflow')}
          className={`btn flex-1 ${tab === 'workflow' ? 'bg-teal text-ink-950' : 'text-slate-300 hover:bg-ink-700'}`}
        >
          <Database className="h-4 w-4" /> Order Workflow
        </button>
        <button
          onClick={() => setTab('cleanroom')}
          className={`btn flex-1 ${tab === 'cleanroom' ? 'bg-teal text-ink-950' : 'text-slate-300 hover:bg-ink-700'}`}
        >
          <LayoutGrid className="h-4 w-4" /> Cleanroom Presence
        </button>
      </div>

      {tab === 'workflow' ? (
        <>
          {/* role switcher */}
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {roleMeta.map((r) => {
              const Icon = r.icon;
              const active = store.role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => store.setRole(r.id)}
                  className={`card flex items-center gap-3 p-4 text-left transition-all ${
                    active
                      ? 'border-teal bg-teal/10 shadow-glow'
                      : 'card-hover'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      active ? 'bg-teal text-ink-950' : 'bg-ink-700 text-slate-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-200'}`}>
                      {r.label}
                    </div>
                    <div className="text-xs text-slate-500">{r.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* status strip */}
          <div className="mb-6 grid grid-cols-3 gap-3">
            <div className="card p-3 text-center">
              <div className="text-2xl font-bold text-slate-200">{counts.new}</div>
              <div className="text-xs text-slate-500">New orders</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-2xl font-bold text-teal">{counts.approved}</div>
              <div className="text-xs text-slate-500">Approved</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-2xl font-bold text-amber">{counts.prod}</div>
              <div className="text-xs text-slate-500">In production</div>
            </div>
          </div>

          {/* role views */}
          {store.role === 'client' && <ClientView store={store} />}
          {store.role === 'engineer' && <EngineerView store={store} />}
          {store.role === 'operator' && <OperatorView store={store} />}
        </>
      ) : (
        <CleanroomView store={store} />
      )}
    </div>
  );
}
