import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Maximize, Minimize, ChevronLeft, ChevronRight } from "lucide-react";

// ==========================================
// DATA STRUCTURE (Dynamic & Configurable)
// ==========================================
const BASE_PRODUCTION = 100_000;
const TARGET_PRODUCTION = 500_000;
const SCALE_MAX = 900_000;

const SOLUTIONS_DATA = [
  {
    id: "clean",
    name: "Layout Optimization",
    note: "No investment",
    mult: 1.15, // Updated multiplier
    invRs: 0.1, // Updated real price
    weeks: 3,
  },
  {
    id: "dig",
    name: "Digitalization + AI",
    note: "Low investment",
    mult: 1.1, // Updated multiplier
    invRs: 0.5, // Updated real price
    weeks: 6,
  },
  {
    id: "tri",
    name: "Tri-Cavity Mold",
    note: "Medium investment",
    mult: 3.0,
    invRs: 6.0, // Updated real price
    weeks: 12,
  },
  {
    id: "radical",
    name: "Radical Re-Designs",
    note: "High investment",
    mult: 2.0, // Updated multiplier
    invRs: 12.0, // Updated real price
    weeks: 24,
  },
  {
    id: "robot",
    name: "Automation (Robot arm)",
    note: "High investment / Low volume gain",
    mult: 1.15,
    invRs: 12.5,
    weeks: 12,
  },
];

const RADAR_DATA = [
  { axis: "Efficiency & Productivity", before: 5.0, after: 8.0 },
  { axis: "Technology and Automation", before: 5.0, after: 8.0 },
  { axis: "Quality and Process reliability", before: 5.0, after: 6.0 },
  { axis: "Digitalization and AI", before: 2.0, after: 9.0 },
  { axis: "Scalability and Industrialization", before: 5, after: 8.0 },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function PresentationDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // État des cases à cocher (L'automation 'robot' est décochée par défaut pour démontrer votre speech)
  const [checkedSolutions, setCheckedSolutions] = useState({
    clean: true,
    dig: true,
    tri: true,
    radical: true,
    robot: false,
  });

  const totalSlides = 4; // Added Thank You slide

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  // Keyboard and Fullscreen listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [nextSlide, prevSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleSolution = (id) => {
    setCheckedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Dynamic calculations
  const calculatedImpact = useMemo(() => {
    let cumulative = BASE_PRODUCTION;
    let totalInvRs = 0;
    let maxWeeks = 0;

    for (const sol of SOLUTIONS_DATA) {
      if (!checkedSolutions[sol.id]) continue;
      cumulative *= sol.mult;
      totalInvRs += sol.invRs;
      maxWeeks = Math.max(maxWeeks, sol.weeks);
    }

    const finalProduction = Math.round(cumulative);
    const multiplier = finalProduction / BASE_PRODUCTION;

    return {
      production: finalProduction,
      multiplier,
      investmentRs: totalInvRs,
      weeks: maxWeeks,
    };
  }, [checkedSolutions]);

  const titles = [
    "PROPOSED SOLUTION",
    "BUSINESS VALUE PROPOSITION",
    "BUSINESS VALUE PROPOSITION",
    "THANK YOU",
  ];

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col overflow-hidden bg-white font-sans text-slate-800 select-none"
    >
      {/* ========================================== */}
      {/* HEADER                                     */}
      {/* ========================================== */}
      <header className="relative z-20 flex h-24 w-full items-center justify-between border-b border-sky-400 bg-white px-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#00a3e0] px-6 py-2 shadow-sm">
            <span className="text-xl font-black text-white tracking-widest mr-2">
              ❯❯❯❯
            </span>
            <h1 className="text-xl font-extrabold tracking-wide text-white uppercase">
              {titles[currentSlide]}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            {/* <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-[#0b2545]">
                NATEC
              </span>
              <span className="text-xs font-semibold text-[#00a3e0]">
                medical ltd
              </span>
            </div>
            <span className="text-[10px] text-slate-400 tracking-wider">
              CDMO
            </span>
            <span className="text-[8px] text-[#00a3e0] italic">
              cutting edge technology for health
            </span> */}
            <img width={150} src="/logo-natec.png" alt="logo-natec" />
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
            title="Plein écran (Échap pour quitter)"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* ========================================== */}
      {/* SLIDE CONTENT AREA                         */}
      {/* ========================================== */}
      <main
        className="relative flex-1 w-full overflow-hidden cursor-pointer bg-white"
        onClick={(e) => {
          const target = e.target;
          if (
            target.closest("button") ||
            target.closest("input") ||
            target.closest("label")
          )
            return;
          if (e.clientX > window.innerWidth * 0.75) nextSlide();
          else if (e.clientX < window.innerWidth * 0.25) prevSlide();
        }}
      >
        {/* SLIDE 1: ROADMAP */}
        {currentSlide === 0 && (
          <div className="flex h-full w-full items-center justify-center p-4">
            <img
              src="/roadmap.png"
              alt="Proposed Solution Roadmap"
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.target.src = "/image_d5a61b.png";
              }}
            />
          </div>
        )}

        {/* SLIDE 2 & 3: BUSINESS VALUE PROPOSITION */}
        {currentSlide === 1 && (
          <SlideBusinessValueInteractive
            checked={checkedSolutions}
            toggle={toggleSolution}
            impact={calculatedImpact}
          />
        )}

        {/* SLIDE 4: THANK YOU */}
        {currentSlide === 2 && <ThankYouSlide />}
      </main>

      {/* ========================================== */}
      {/* FOOTER CONTROLS                            */}
      {/* ========================================== */}
      <footer className="relative z-20 flex h-12 w-full items-center justify-between border-t border-slate-200 bg-slate-50 px-6">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 transition-all rounded-full ${
                currentSlide === idx ? "w-6 bg-[#00a3e0]" : "w-2 bg-slate-300"
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-slate-500 font-mono">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex h-7 items-center gap-1 rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 disabled:opacity-30"
          >
            <ChevronLeft className="h-3 w-3" /> Précédent
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="flex h-7 items-center gap-1 rounded bg-[#00a3e0] px-3 text-xs font-semibold text-white disabled:opacity-30"
          >
            Suivant <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// INTERACTIVE SLIDE COMPONENT
// ==========================================

function SlideBusinessValueInteractive({ checked, toggle, impact }) {
  // Radar Geometry (Increased size significantly)
  const center = 280;
  const radius = 200;
  const totalAxes = RADAR_DATA.length;

  const getCoordinates = (index, val) => {
    const angle = ((Math.PI * 2) / totalAxes) * index - Math.PI / 2;
    const r = (val / 10) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const pointsBefore = RADAR_DATA.map((d, i) => getCoordinates(i, d.before));
  const pointsAfter = RADAR_DATA.map((d, i) => getCoordinates(i, d.after));

  const pathBefore = pointsBefore.map((p) => `${p.x},${p.y}`).join(" ");
  const pathAfter = pointsAfter.map((p) => `${p.x},${p.y}`).join(" ");

  // Pourcentages pour les Progress Bars
  const productionPct = Math.min((impact.production / SCALE_MAX) * 100, 100);
  const targetPct = (TARGET_PRODUCTION / SCALE_MAX) * 100;
  const maxInvestmentPossible = 33.5; // Max Rs
  const investmentPct = Math.min(
    (impact.investmentRs / maxInvestmentPossible) * 100,
    100,
  );

  return (
    <div className="flex h-full w-full items-center justify-between px-10 py-6 gap-8 bg-white">
      {/* Gauche : Radar Chart - 50% width */}
      <div className="w-1/2 flex flex-col items-center justify-center">
        <div className="flex items-center gap-6 mb-4 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-[#00a3e0]" />
            <span className="text-slate-700">Before Solution</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-[#a855f7]" />
            <span className="text-slate-700">After Solution</span>
          </div>
        </div>

        {/* SVG Radar Chart - Larger size */}
        <svg
          width="600"
          height="600"
          viewBox="0 0 560 560"
          className="overflow-visible"
        >
          {/* Grid circles with scale numbers */}
          {[2, 4, 6, 8, 10].map((level) => {
            const ringPoints = RADAR_DATA.map((_, i) =>
              getCoordinates(i, level),
            )
              .map((p) => `${p.x},${p.y}`)
              .join(" ");
            return (
              <g key={level}>
                <polygon
                  points={ringPoints}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Scale number */}
                <text
                  x={center}
                  y={center - (level / 10) * radius}
                  fill="#64748b"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="middle"
                  dy="-5"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Axes and labels */}
          {RADAR_DATA.map((d, i) => {
            const outer = getCoordinates(i, 10);
            const labelPos = getCoordinates(i, 12.5);
            const words = d.axis.split(" ");
            return (
              <g key={i}>
                <line
                  x1={center}
                  y1={center}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#cbd5e1"
                  strokeWidth="2"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fill="#475569"
                  fontSize="13"
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="max-w-[120px]"
                >
                  {words.map((word, idx) => (
                    <tspan key={idx} x={labelPos.x} dy={idx === 0 ? 0 : 14}>
                      {word}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}

          {/* Before polygon */}
          <polygon
            points={pathBefore}
            fill="rgba(0, 163, 224, 0.35)"
            stroke="#00a3e0"
            strokeWidth="3"
          />

          {/* After polygon */}
          <polygon
            points={pathAfter}
            fill="rgba(168, 85, 247, 0.25)"
            stroke="#a855f7"
            strokeWidth="3"
          />

          {/* Data points for Before */}
          {pointsBefore.map((p, i) => (
            <circle
              key={`before-${i}`}
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#00a3e0"
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* Data points for After */}
          {pointsAfter.map((p, i) => (
            <circle
              key={`after-${i}`}
              cx={p.x}
              cy={p.y}
              r="5"
              fill="#a855f7"
              stroke="white"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      {/* Droite : Metrics & Progress Bars & Checkboxes - 50% width */}
      <div className="w-1/2 flex flex-col justify-center space-y-4 max-w-xl">
        {/* Output Header */}
        <div>
          <h3 className="text-2xl font-black text-[#0b2545]">
            Projected annual output
          </h3>
          <div className="flex items-baseline gap-3 mt-0.5">
            <span className="text-3xl font-extrabold text-[#0b2545]">
              {BASE_PRODUCTION.toLocaleString("en-US")} ➜{" "}
              {impact.production.toLocaleString("en-US")}
            </span>
          </div>
          <p className="text-xs font-semibold text-[#00a3e0] mt-0.5">
            ×{impact.multiplier.toFixed(2)} vs legacy baseline
          </p>
        </div>

        {/* Dynamic Progress Bar - Production & Financial Impact */}
        <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
              <span>Production Target Progress</span>
              <span className="text-[#00a3e0]">
                {impact.production.toLocaleString("en-US")} /{" "}
                {TARGET_PRODUCTION.toLocaleString("en-US")} units
              </span>
            </div>
            <div className="relative h-3.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00a3e0] to-purple-500 transition-all duration-300"
                style={{ width: `${productionPct}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-1 bg-red-500 z-10"
                style={{ left: `${targetPct}%` }}
                title="Target 750k"
              />
            </div>
          </div>

          {/* <div>
            <div className="flex justify-between text-[11px] font-bold text-slate-600 mb-1">
              <span>Investment Consumption</span>
              <span className="text-[#1d1b84]">{impact.investmentRs} M Rs</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-[#1d1b84] transition-all duration-300"
                style={{ width: `${investmentPct}%` }}
              />
            </div>
          </div> */}
        </div>

        {/* 4 Cards Impact */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#1d1b84] p-4 text-white shadow-sm">
            <span className="text-xs font-bold text-sky-200">
              Critical path
            </span>
            <div className="text-2xl font-black mt-0.5">
              {impact.weeks} months
            </div>
          </div>

          <div className="rounded-xl bg-[#2a4356] p-4 text-white shadow-sm">
            <span className="text-xs font-bold text-slate-300">Return (Production)</span>
            <div className="text-2xl font-black mt-0.5">
              +{(impact.production - BASE_PRODUCTION).toLocaleString("en-US")}
            </div>
          </div>

          <div className="rounded-xl bg-[#1d1b84] p-4 text-white shadow-sm">
            <span className="text-xs font-bold text-sky-200">
              Total investment (Rs)
            </span>
            <div className="text-2xl font-black mt-0.5">
              {impact.investmentRs} millions
            </div>
          </div>
        </div>

        {/* Checkboxes List */}
        <div className="pt-2 border-t border-slate-200 space-y-1.5">
          {SOLUTIONS_DATA.map((sol) => (
            <label
              key={sol.id}
              className={`flex w-full cursor-pointer items-center rounded-lg border px-3 py-2 transition ${
                checked[sol.id]
                  ? "border-[#00a3e0] bg-sky-50/50"
                  : "border-slate-200 bg-white opacity-60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={checked[sol.id]}
                  onChange={() => toggle(sol.id)}
                  className="custom-checkbox"
                />
                <span className="text-xs font-bold text-slate-800">
                  {sol.name}
                </span>
              </div>

              <span className="ml-auto shrink-0 whitespace-nowrap font-mono text-[11px] text-slate-500">
                x{sol.mult.toFixed(2)} · {sol.invRs}M Rs · {sol.weeks}w
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// THANK YOU SLIDE COMPONENT
// ==========================================

function ThankYouSlide() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50 px-8">
      <div className="text-center space-y-8 max-w-3xl">
        {/* Main Thank You */}
        <div className="space-y-4">
          <h1 className="text-7xl font-black text-[#0b2545] tracking-tight">
            Thank You
          </h1>
          <div className="h-2 w-32 bg-[#00a3e0] mx-auto rounded-full" />
        </div>

        {/* Company Tagline */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <img width={150} src="/logo-natec.png" alt="logo-natec" />
          </div>
          {/* <p className="text-lg text-[#00a3e0] italic font-medium">
            cutting edge technology for health
          </p> */}
        </div>

        {/* Additional Message */}
        <div className="pt-8 space-y-3">
          <p className="text-xl text-slate-600 font-medium">
            Ready to transform healthcare manufacturing
          </p>
          <p className="text-sm text-slate-500">
            Questions? Let's discuss how we can achieve these targets together.
          </p>
        </div>

        {/* Decorative elements */}
        {/* <div className="flex justify-center gap-3 pt-8">
          <div
            className="h-3 w-3 rounded-full bg-[#00a3e0] animate-pulse"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="h-3 w-3 rounded-full bg-[#00a3e0] animate-pulse"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="h-3 w-3 rounded-full bg-[#00a3e0] animate-pulse"
            style={{ animationDelay: "0.4s" }}
          />
        </div> */}
      </div>
    </div>
  );
}
