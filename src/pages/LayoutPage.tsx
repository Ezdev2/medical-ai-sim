import { LayoutGrid, ArrowRight, ArrowLeft, Play } from 'lucide-react';

const BEFORE = [
  { id: 'entry', label: 'Entry / Gowning', x: 10, y: 220, w: 80, h: 50, kind: 'entry' },
  { id: 'forming-a', label: 'Forming A', x: 120, y: 40, w: 90, h: 70, kind: 'machine' },
  { id: 'forming-b', label: 'Forming B', x: 230, y: 40, w: 90, h: 70, kind: 'machine' },
  { id: 'qc', label: 'QC Lab', x: 340, y: 40, w: 80, h: 70, kind: 'lab' },
  { id: 'inspect', label: 'Inspection', x: 120, y: 150, w: 90, h: 60, kind: 'inspect' },
  { id: 'pack', label: 'Packaging', x: 230, y: 150, w: 90, h: 60, kind: 'pack' },
  { id: 'store', label: 'Storage', x: 340, y: 150, w: 80, h: 60, kind: 'store' },
  { id: 'materials', label: 'Materials', x: 340, y: 220, w: 80, h: 50, kind: 'store' },
];

const AFTER = [
  { id: 'entry', label: 'Entry / Gowning', x: 10, y: 220, w: 80, h: 50, kind: 'entry' },
  { id: 'materials', label: 'Materials', x: 10, y: 40, w: 80, h: 70, kind: 'store' },
  { id: 'forming-a', label: 'Forming A', x: 120, y: 40, w: 90, h: 70, kind: 'machine' },
  { id: 'forming-b', label: 'Forming B', x: 120, y: 150, w: 90, h: 60, kind: 'machine' },
  { id: 'inspect', label: 'Inspection', x: 230, y: 40, w: 90, h: 70, kind: 'inspect' },
  { id: 'qc', label: 'QC Lab', x: 230, y: 150, w: 90, h: 60, kind: 'lab' },
  { id: 'pack', label: 'Packaging', x: 340, y: 40, w: 80, h: 70, kind: 'pack' },
  { id: 'store', label: 'Storage', x: 340, y: 150, w: 80, h: 60, kind: 'store' },
];

const COLORS: Record<string, string> = {
  entry: '#33425c',
  machine: '#2dd4bf',
  lab: '#f59e0b',
  inspect: '#5eead4',
  pack: '#0f766e',
  store: '#4a5a78',
};

function FloorPlan({ items, flow }: { items: typeof BEFORE; flow: string[] }) {
  return (
    <svg viewBox="0 0 440 300" className="h-full w-full">
      <rect x="0" y="0" width="440" height="300" rx="8" fill="#0b1119" stroke="#1a2536" />
      {/* flow arrows */}
      {flow.slice(0, -1).map((_, i) => {
        const a = items.find((it) => it.id === flow[i])!;
        const b = items.find((it) => it.id === flow[i + 1])!;
        const x1 = a.x + a.w / 2, y1 = a.y + a.h / 2;
        const x2 = b.x + b.w / 2, y2 = b.y + b.h / 2;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
        );
      })}
      {items.map((it) => (
        <g key={it.id}>
          <rect x={it.x} y={it.y} width={it.w} height={it.h} rx="6" fill={COLORS[it.kind]} opacity={0.85} stroke="#0b1119" strokeWidth="1.5" />
          <text x={it.x + it.w / 2} y={it.y + it.h / 2 + 4} textAnchor="middle" fontSize="10" fill="#0b1119" fontWeight="600">
            {it.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function LayoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <span className="chip mb-3 border border-amber/30 bg-amber/10 text-amber">
          <LayoutGrid className="h-3.5 w-3.5" /> Solution 04
        </span>
        <h1 className="text-3xl font-bold text-white">Cleanroom Layout Optimization</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Reorganize the cleanroom floor to follow the material flow — from materials storage through forming,
          inspection, QC and packaging — reducing operator travel and cross-traffic.
        </p>
      </div>

      {/* before / after */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="chip bg-ink-700 text-slate-400"><ArrowLeft className="h-3 w-3" /> Before</span>
            <span className="text-xs text-slate-500">Scattered stations, cross-traffic</span>
          </div>
          <div className="h-[300px]">
            <FloorPlan items={BEFORE} flow={['entry', 'materials', 'forming-a', 'inspect', 'qc', 'pack', 'store']} />
          </div>
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="chip bg-teal/15 text-teal">After <ArrowRight className="h-3 w-3" /></span>
            <span className="text-xs text-slate-500">Linear flow, minimal backtracking</span>
          </div>
          <div className="h-[300px]">
            <FloorPlan items={AFTER} flow={['entry', 'materials', 'forming-a', 'inspect', 'qc', 'pack', 'store']} />
          </div>
        </div>
      </div>

      {/* video placeholder */}
      <div className="card mt-6 overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-ink-700 px-5 py-3">
          <Play className="h-4 w-4 text-teal" />
          <span className="text-sm font-semibold text-slate-200">Layout optimization walkthrough</span>
        </div>
        <div className="flex h-64 items-center justify-center bg-ink-900/50">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal/15 text-teal ring-1 ring-teal/30">
              <Play className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">Video placeholder — drop in the walkthrough recording here.</p>
            <code className="mt-2 inline-block rounded bg-ink-800 px-2 py-1 text-xs text-slate-400">&lt;video src="walkthrough.mp4" /&gt;</code>
          </div>
        </div>
      </div>

      {/* benefits */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { t: 'Less travel', d: 'Stations arranged along the material flow path — operators stay in zone.' },
          { t: 'Less cross-traffic', d: 'Materials and finished goods no longer cross paths in the aisle.' },
          { t: 'Faster changeover', d: 'Grouped forming + inspection cells reduce move time between batches.' },
        ].map((b) => (
          <div key={b.t} className="card p-5">
            <h3 className="text-sm font-semibold text-white">{b.t}</h3>
            <p className="mt-1 text-xs text-slate-500">{b.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
