import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-ink-700/60 bg-ink-950/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-teal" />
          <span>Quadracure Innovators — PTA Balloon Catheter Production Pitch</span>
        </Link>
        <span className="text-slate-600">Natec Innovation Cup · Interactive Demo</span>
      </div>
    </footer>
  );
}
