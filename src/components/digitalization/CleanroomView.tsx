import type { Store } from '../../store';
import { STATIONS, OPERATORS, fmtTime } from '../../data';
import { ArrowRightLeft, UserMinus, UserPlus, Users } from 'lucide-react';

export default function CleanroomView({ store }: { store: Store }) {
  const occupied = store.stations.filter((s) => s.operatorName).length;
  const freeOperators = OPERATORS.filter(
    (name) => !store.stations.some((s) => s.operatorName === name)
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* floor plan */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Cleanroom floor plan</h3>
            <p className="text-xs text-slate-500">Live workstation occupancy based on badge check-ins.</p>
          </div>
          <span className="chip bg-ink-700 text-slate-300">
            <Users className="h-3.5 w-3.5" /> {occupied}/{STATIONS.length} occupied
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-xl border border-ink-700 bg-ink-900/40 p-4">
          {STATIONS.map((s) => {
            const state = store.stations.find((st) => st.stationId === s.id)!;
            const occupied = !!state.operatorName;
            return (
              <div
                key={s.id}
                className={`relative flex flex-col items-center justify-center rounded-lg border p-4 text-center transition-all ${
                  occupied
                    ? 'border-green-500/40 bg-green-500/10'
                    : 'border-ink-600 bg-ink-800/40'
                }`}
                style={{ gridColumn: `${s.x + 1}`, gridRow: `${s.y + 1}` }}
              >
                <span
                  className={`mb-2 flex h-8 w-8 items-center justify-center rounded-full ${
                    occupied ? 'bg-green-500/20 text-green-400' : 'bg-ink-700 text-slate-500'
                  }`}
                >
                  {occupied ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                </span>
                <div className="text-xs font-semibold text-slate-200">{s.id}</div>
                <div className="text-[10px] text-slate-500">{s.name}</div>
                {occupied ? (
                  <div className="mt-1 text-[10px] text-green-400">{state.operatorName}</div>
                ) : (
                  <div className="mt-1 text-[10px] text-slate-600">Empty</div>
                )}
              </div>
            );
          })}
        </div>

        {/* shift switch */}
        <div className="mt-6">
          <h4 className="mb-2 text-sm font-semibold text-slate-300">Simulate shift switch</h4>
          <p className="mb-3 text-xs text-slate-500">
            Move an operator from an occupied station to an empty one.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {store.stations
              .filter((s) => s.operatorName)
              .map((s) => (
                <div key={s.stationId} className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-900/50 p-2">
                  <span className="text-xs text-slate-300">{s.operatorName}</span>
                  <ArrowRightLeft className="h-3.5 w-3.5 text-slate-500" />
                  <select
                    className="input w-auto py-1 text-xs"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) store.moveOperator(s.stationId, e.target.value);
                      e.target.value = '';
                    }}
                  >
                    <option value="" disabled>Move to…</option>
                    {store.stations
                      .filter((st) => !st.operatorName && st.stationId !== s.stationId)
                      .map((st) => (
                        <option key={st.stationId} value={st.stationId}>{st.stationId}</option>
                      ))}
                  </select>
                  <button
                    onClick={() => store.badgeOut(s.stationId)}
                    className="btn-ghost px-2 py-1 text-xs"
                  >
                    Badge out
                  </button>
                </div>
              ))}
            {store.stations.filter((s) => s.operatorName).length === 0 && (
              <span className="text-xs text-slate-600">No operators badged in. Use the Operator role to badge in.</span>
            )}
          </div>
        </div>
      </div>

      {/* side panel */}
      <div className="space-y-4">
        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-300">Available operators</h3>
          <div className="space-y-2">
            {freeOperators.length === 0 ? (
              <span className="text-xs text-slate-600">All operators assigned.</span>
            ) : (
              freeOperators.map((name) => (
                <div key={name} className="flex items-center justify-between rounded-lg border border-ink-700 bg-ink-900/50 p-2.5">
                  <span className="text-sm text-slate-200">{name}</span>
                  <select
                    className="input w-auto py-1 text-xs"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) store.badgeIn(e.target.value, name);
                      e.target.value = '';
                    }}
                  >
                    <option value="" disabled>Badge in at…</option>
                    {store.stations
                      .filter((s) => !s.operatorName)
                      .map((s) => (
                        <option key={s.stationId} value={s.stationId}>{s.stationId}</option>
                      ))}
                  </select>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-300">Station log</h3>
          <div className="space-y-1.5 text-xs">
            {store.stations
              .filter((s) => s.badgeInAt)
              .sort((a, b) => (b.badgeInAt! - a.badgeInAt!))
              .map((s) => (
                <div key={s.stationId} className="flex justify-between text-slate-400">
                  <span className="text-slate-300">{s.operatorName}</span>
                  <span>{s.stationId} · {fmtTime(s.badgeInAt)}</span>
                </div>
              ))}
            {store.stations.filter((s) => s.badgeInAt).length === 0 && (
              <span className="text-slate-600">No badge events yet.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
