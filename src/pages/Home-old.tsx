import { Link } from 'react-router-dom';
import { Database, Bot, LayoutGrid, Gauge, ArrowRight, Cpu } from 'lucide-react';
import LayerSimulator from '../components/LayerSimulator';

const solutions = [
  {
    to: '/solutions/digitalization',
    n: '01',
    icon: Database,
    title: 'Digitalization',
    tag: 'Full interactive demo',
    desc: 'Replace paper forms & manual orders with a digital workflow across client, engineer and operator roles.',
    accent: 'teal' as const,
  },
  {
    to: '/solutions/machine',
    n: '02 · 03',
    icon: Bot,
    title: 'Robot Arm & Tri-Cavity Mold',
    tag: '3D centerpiece',
    desc: 'Automated load/unload robot arm merged with a 3-cavity mold — modelled on real NATEC forming machines.',
    accent: 'teal' as const,
  },
  {
    to: '/solutions/layout',
    n: '04',
    icon: LayoutGrid,
    title: 'Cleanroom Layout Optimization',
    tag: 'Presentation',
    desc: 'Before/after floor-plan comparison showing improved material flow and reduced operator travel.',
    accent: 'amber' as const,
  },
  {
    to: '/solutions/cycle-time',
    n: '05',
    icon: Gauge,
    title: 'Cycle Time Reduction',
    tag: 'Interactive chart',
    desc: 'Stack the levers — thinner wall, pre-heating, nucleating agent, conformal cooling — and watch cycle time drop.',
    accent: 'amber' as const,
  },
];

export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col justify-center animate-fade-up">
            <span className="chip mb-5 w-fit border border-teal/30 bg-teal/10 text-teal">
              <Cpu className="h-3.5 w-3.5" /> Natec Innovation Cup
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Quadracure <span className="text-teal">Innovators</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-400">
              Five proposed improvements to the PTA balloon catheter stretch-blow molding line —
              ranked, simulated, and ready to pitch.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/solutions/machine" className="btn-primary">
                Explore the 3D centerpiece <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/solutions/digitalization" className="btn-ghost">
                Try the digitalization demo
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 text-center">
              {[
                { v: '5', l: 'Solutions' },
                { v: '3', l: 'Roles simulated' },
                { v: '~50%', l: 'Cycle time cut' },
              ].map((s) => (
                <div key={s.l} className="card px-3 py-4">
                  <div className="text-2xl font-bold text-teal">{s.v}</div>
                  <div className="mt-1 text-xs text-slate-500">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex h-[360px] items-center justify-center lg:h-[480px]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal/10 to-transparent" />
            <img
              src="/logo-natec.png"
              alt="Hero"
              className="relative mx-auto h-full max-h-full w-auto object-contain"
            />
          </div>
        </div>
      </section>

      {/* SOLUTION CARDS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="section-title">The five solutions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ranked by a weighted priority matrix (impact × feasibility × cost).
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((s) => {
            const Icon = s.icon;
            const accent = s.accent === 'teal' ? 'teal' : 'amber';
            return (
              <Link
                key={s.to}
                to={s.to}
                className={`card card-hover group relative flex flex-col p-5 ${
                  accent === 'amber' ? 'hover:shadow-glow-amber hover:border-amber/60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      accent === 'amber'
                        ? 'bg-amber/15 text-amber ring-1 ring-amber/30'
                        : 'bg-teal/15 text-teal ring-1 ring-teal/30'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-slate-600">{s.n}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{s.title}</h3>
                <span
                  className={`chip mt-2 w-fit ${
                    accent === 'amber'
                      ? 'bg-amber/10 text-amber'
                      : 'bg-teal/10 text-teal'
                  }`}
                >
                  {s.tag}
                </span>
                <p className="mt-3 flex-1 text-sm text-slate-400">{s.desc}</p>
                <span
                  className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${
                    accent === 'amber' ? 'text-amber' : 'text-teal'
                  }`}
                >
                  Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* INVESTMENT vs PRODUCTION SIMULATOR */}
      <LayerSimulator />
    </div>
  );
}