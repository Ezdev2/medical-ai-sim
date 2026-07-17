import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Activity } from 'lucide-react';

const links = [
  { to: '/solutions/digitalization', label: '01 · Digitalization' },
  { to: '/solutions/machine', label: '02 · Robot & Tri-Cavity' },
  { to: '/solutions/layout', label: '04 · Cleanroom Layout' },
  { to: '/solutions/cycle-time', label: '05 · Cycle Time' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-700/60 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal/15 text-teal ring-1 ring-teal/30 transition group-hover:bg-teal/25">
            <Activity className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-white">Quadracure Innovators</span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-500">Natec Innovation Cup</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive ? 'text-teal' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="rounded-lg p-2 text-slate-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-700 bg-ink-900 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-teal/10 text-teal' : 'text-slate-300'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
