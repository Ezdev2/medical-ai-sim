import { formatNumber } from '../utils/format.js';

export default function ParisonVisual({ parisonCutMm = 0, balloonLengthMm = 0, diameterMm = 0 }) {
  const safeCut = Number(parisonCutMm) || 0;
  return (
    <div className="parison-card">
      <div className="parison-svg-wrap">
        <svg viewBox="0 0 720 180" role="img" aria-label="Visualisation parison cut">
          <defs>
            <linearGradient id="tubeGradient" x1="0" x2="1">
              <stop offset="0" stopColor="#d8f3ff" />
              <stop offset="0.5" stopColor="#89dcff" />
              <stop offset="1" stopColor="#d8f3ff" />
            </linearGradient>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#2563eb" />
            </marker>
          </defs>
          <line x1="80" y1="92" x2="640" y2="92" stroke="#102a43" strokeWidth="14" strokeLinecap="round" />
          <line x1="90" y1="92" x2="630" y2="92" stroke="url(#tubeGradient)" strokeWidth="10" strokeLinecap="round" />
          <rect x="72" y="52" width="18" height="80" rx="5" fill="#0f766e" />
          <rect x="630" y="52" width="18" height="80" rx="5" fill="#0f766e" />
          <line x1="82" y1="145" x2="638" y2="145" stroke="#2563eb" strokeWidth="3" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
          <path d="M82 139 v12 M638 139 v12" stroke="#2563eb" strokeWidth="3" />
          <text x="360" y="168" textAnchor="middle" fill="#1d4ed8" fontSize="20" fontWeight="700">
            PARISON CUT: {formatNumber(safeCut, 1)} mm
          </text>
          <text x="360" y="42" textAnchor="middle" fill="#0f172a" fontSize="16">
            Balloon target: Ø{formatNumber(diameterMm, 1)} mm · Length {formatNumber(balloonLengthMm, 1)} mm
          </text>
        </svg>
      </div>
      <div className="operator-hint">
        <strong>Instruction opérateur :</strong> couper le parison à {formatNumber(safeCut, 1)} mm, confirmer grippers,
        puis lancer le cycle validé sans feuille papier.
      </div>
    </div>
  );
}
