import { isFirebaseConfigured } from "../services/firebase.js";

export default function DemoHeader({ route, setRoute }) {
  const nav = [
    { id: "home", label: "Accueil" },
    { id: "client", label: "Client" },
    { id: "engineer", label: "Ingénieur" },
    { id: "operator", label: "Opérateur" },
  ];

  return (
    <header className="demo-header">
      <div
        className="brand"
        onClick={() => setRoute("home")}
        role="button"
        tabIndex={0}
      >
        <div className="brand-mark">QI</div>
        <div>
          <div className="brand-title">Quadracure Innovators</div>
          <div className="brand-subtitle">
            NATEC production ×5 · Digital thread demo
          </div>
        </div>
      </div>

      <nav className="top-nav" aria-label="Navigation demo">
        {nav.map((item) => (
          <button
            key={item.id}
            className={route === item.id ? "active" : ""}
            onClick={() => setRoute(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div
        className={`realtime-pill ${isFirebaseConfigured ? "online" : "offline"}`}
      >
        <span />
        {isFirebaseConfigured ? "Firebase temps réel" : "Mode demo local"}
      </div>
      <div>
        <a
          href="#/slides"
          className="inline-flex items-center gap-2 rounded-md bg-[#00a3e0] px-4 py-2 text-sm font-bold text-white hover:opacity-90"
        >
          Open Slides
        </a>
      </div>
    </header>
  );
}
