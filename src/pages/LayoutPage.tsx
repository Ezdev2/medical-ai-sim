import { LayoutGrid, ArrowRight, ArrowLeft, Play } from 'lucide-react';

const BEFORE = [
  { id: 'pillar-1', label: 'Pillar', x: 20, y: 30, w: 70, h: 60, kind: 'pillar' },
  { id: 'pillar-2', label: 'Pillar', x: 350, y: 210, w: 70, h: 60, kind: 'pillar' },
  { id: 'sup', label: 'Sup Desk', x: 350, y: 155, w: 70, h: 45, kind: 'desk' },
  { id: 'launching', label: 'Launching', x: 350, y: 95, w: 70, h: 45, kind: 'desk' },
  
  // Linear / traditional block layout matching old schematic
  { id: 'm1', label: '1', x: 20, y: 110, w: 32, h: 25, kind: 'machine' },
  { id: 'm2', label: '2', x: 58, y: 110, w: 32, h: 25, kind: 'machine' },
  { id: 'm3', label: '3', x: 20, y: 140, w: 32, h: 25, kind: 'machine' },
  { id: 'm4', label: '4', x: 58, y: 140, w: 32, h: 25, kind: 'machine' },
  { id: 'm5', label: '5', x: 20, y: 170, w: 32, h: 25, kind: 'machine' },
  { id: 'm6', label: '6', x: 58, y: 170, w: 32, h: 25, kind: 'machine' },
  { id: 'eng-1', label: 'Eng', x: 20, y: 205, w: 70, h: 30, kind: 'desk' },

  { id: 'm7', label: '7', x: 110, y: 50, w: 35, h: 25, kind: 'machine' },
  { id: 'm8', label: '8', x: 150, y: 50, w: 35, h: 25, kind: 'machine' },
  { id: 'm9', label: '9', x: 110, y: 80, w: 35, h: 25, kind: 'machine' },
  { id: 'm10', label: '10', x: 150, y: 80, w: 35, h: 25, kind: 'machine' },
  { id: 'm11', label: '11', x: 110, y: 110, w: 35, h: 25, kind: 'machine' },
  { id: 'm12', label: '12', x: 150, y: 110, w: 35, h: 25, kind: 'machine' },
  { id: 'm13', label: '13', x: 110, y: 140, w: 35, h: 25, kind: 'machine' },
  { id: 'm14', label: '14', x: 150, y: 140, w: 35, h: 25, kind: 'machine' },
  { id: 'vi-1', label: 'VI Zone', x: 110, y: 175, w: 75, h: 30, kind: 'lab' },

  { id: 'm15', label: '15', x: 210, y: 40, w: 35, h: 22, kind: 'machine' },
  { id: 'm16', label: '16', x: 250, y: 40, w: 35, h: 22, kind: 'machine' },
  { id: 'm17', label: '17', x: 210, y: 67, w: 35, h: 22, kind: 'machine' },
  { id: 'm18', label: '18', x: 250, y: 67, w: 35, h: 22, kind: 'machine' },
  { id: 'm19', label: '19', x: 210, y: 94, w: 35, h: 22, kind: 'machine' },
  { id: 'm20', label: '20', x: 250, y: 94, w: 35, h: 22, kind: 'machine' },
  { id: 'vi-2', label: 'VI', x: 290, y: 40, w: 25, h: 155, kind: 'lab' },
  { id: 'tl', label: 'TL', x: 210, y: 210, w: 105, h: 30, kind: 'desk' },
];

const AFTER = [
  { id: 'pillar-1', label: 'Pillar', x: 20, y: 30, w: 70, h: 60, kind: 'pillar' },
  { id: 'pillar-2', label: 'Pillar', x: 350, y: 210, w: 70, h: 60, kind: 'pillar' },
  { id: 'sup', label: 'Sup Desk', x: 350, y: 155, w: 70, h: 45, kind: 'desk' },
  { id: 'launching', label: 'Launching', x: 350, y: 95, w: 70, h: 45, kind: 'desk' },

  // U-Shaped Cell 1 (Left Cluster)
  { id: 'uc1-top', label: 'MAC', x: 25, y: 110, w: 60, h: 25, kind: 'machine' },
  { id: 'uc1-left', label: 'MAC', x: 20, y: 140, w: 25, h: 50, kind: 'machine' },
  { id: 'uc1-right', label: 'MAC', x: 65, y: 140, w: 25, h: 50, kind: 'machine' },

  // U-Shaped Cell 2 (Middle Cluster)
  { id: 'uc2-top', label: 'MAC', x: 130, y: 50, w: 60, h: 25, kind: 'machine' },
  { id: 'uc2-left', label: 'MAC', x: 125, y: 80, w: 25, h: 50, kind: 'machine' },
  { id: 'uc2-right', label: 'MAC', x: 170, y: 80, w: 25, h: 50, kind: 'machine' },

  // U-Shaped Cell 3 (Right Cluster)
  { id: 'uc3-top', label: 'MAC', x: 235, y: 50, w: 60, h: 25, kind: 'machine' },
  { id: 'uc3-left', label: 'MAC', x: 230, y: 80, w: 25, h: 50, kind: 'machine' },
  { id: 'uc3-right', label: 'MAC', x: 275, y: 80, w: 25, h: 50, kind: 'machine' },

  // Inspection & Support Zones integrated near cells
  { id: 'vi-cell', label: 'Inline VI', x: 230, y: 145, w: 70, h: 35, kind: 'lab' },
  { id: 'eng-after', label: 'Eng / Control', x: 130, y: 210, w: 175, h: 30, kind: 'desk' },
];

const COLORS: Record<string, string> = {
  pillar: '#94a3b8',
  desk: '#38bdf8',
  machine: '#f472b6',
  lab: '#fb923c',
};

function FloorPlan({ items, flow }: { items: typeof BEFORE; flow: string[] }) {
  return (
    <svg viewBox="0 0 440 280" className="h-full w-full">
      <rect x="0" y="0" width="440" height="280" rx="8" fill="#0b1119" stroke="#1a2536" />
      
      {/* Flow paths / guidelines */}
      {flow.length > 1 && flow.slice(0, -1).map((_, i) => {
        const a = items.find((it) => it.id === flow[i]);
        const b = items.find((it) => it.id === flow[i + 1]);
        if (!a || !b) return null;
        const x1 = a.x + a.w / 2, y1 = a.y + a.h / 2;
        const x2 = b.x + b.w / 2, y2 = b.y + b.h / 2;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5" />
        );
      })}

      {items.map((it) => (
        <g key={it.id}>
          <rect x={it.x} y={it.y} width={it.w} height={it.h} rx="4" fill={COLORS[it.kind]} opacity={0.85} stroke="#0b1119" strokeWidth="1" />
          <text x={it.x + it.w / 2} y={it.y + it.h / 2 + 3} textAnchor="middle" fontSize="9" fill="#0b1119" fontWeight="700">
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
          Transitioning balloon forming lines from linear rows with heavy operator movement to ergonomic U-shaped production cells.
        </p>
      </div>

      {/* before / after */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="chip bg-ink-700 text-slate-400"><ArrowLeft className="h-3 w-3" /> Before (Linear Layout)</span>
            <span className="text-xs text-slate-500">Long rows, high lateral walking & cross-traffic</span>
          </div>
          <div className="h-[280px]">
            <FloorPlan items={BEFORE} flow={['m1', 'm7', 'm15']} />
          </div>
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="chip bg-teal/15 text-teal">After (U-Cell Layout) <ArrowRight className="h-3 w-3" /></span>
            <span className="text-xs text-slate-500">3 machines facing operator, minimal travel</span>
          </div>
          <div className="h-[280px]">
            <FloorPlan items={AFTER} flow={['uc1-top', 'uc2-top', 'uc3-top', 'vi-cell']} />
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
          { t: 'Ergonomic U-Cells', d: '3 machines wrap around the operator, requiring little to no walking—just simple turns.' },
          { t: 'Reduced Operator Fatigue', d: 'Eliminates repetitive lateral pacing along long linear equipment rows.' },
          { t: 'Optimized Workflow', d: 'Clustered forming stations and integrated inspection streamline batch handling.' },
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