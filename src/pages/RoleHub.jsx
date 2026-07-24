import FutureDataCard from '../components/FutureDataCard.jsx';

export default function RoleHub({ setRoute }) {
  const cards = [
    {
      route: 'client',
      label: 'Je suis Client',
      title: 'Passer une commande ballon',
      description:
        'Le jury saisit les dimensions, matériau et quantité. La référence commande est générée automatiquement.',
      metric: '0 papier',
      icon: '01',
    },
    {
      route: 'engineer',
      label: 'Je suis Ingénieur',
      title: 'Calcul IA + validation process',
      description:
        'Visualiser la commande en temps réel, lancer le calcul IA, corriger si besoin, puis injecter vers la BFM.',
      metric: '~3 sec IA',
      icon: '02',
    },
    {
      route: 'operator',
      label: 'Je suis Opérateur',
      title: 'Tablette cleanroom + yield',
      description:
        'Check-in badge, voir parison cut et paramètres validés, check-out avec défauts et rendement automatique.',
      metric: 'Yield live',
      icon: '03',
    },
  ];

  return (
    <div className="page page-home">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Digitalization module · Solution 1/5</p>
          <h1>Transformer une commande client en paramètres BFM validés.</h1>
          <p>
            Ce demo montre comment Quadracure Innovators réduit le temps de paramétrage machine :
            saisie client structurée, calcul IA, validation ingénieur, injection Windows BFM et feedback opérateur.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => setRoute('client')}>
              Démarrer comme Client
            </button>
            <button className="ghost" onClick={() => setRoute('engineer')}>
              Aller directement Ingénieur
            </button>
          </div>
        </div>
        <div className="hero-panel" aria-label="Chaîne digitale">
          <div className="pipeline-node active">Client order</div>
          <div className="pipeline-line" />
          <div className="pipeline-node ai">AI recipe</div>
          <div className="pipeline-line" />
          <div className="pipeline-node">Engineer approval</div>
          <div className="pipeline-line" />
          <div className="pipeline-node machine">BFM Windows</div>
          <div className="pipeline-line" />
          <div className="pipeline-node operator">Operator yield</div>
        </div>
      </section>

      <section>
        <div className="section-title">
          <p className="eyebrow">Choix du rôle</p>
          <h2>Je suis un...</h2>
        </div>
        <div className="role-grid">
          {cards.map((card) => (
            <button key={card.route} className="role-card" onClick={() => setRoute(card.route)}>
              <span className="role-index">{card.icon}</span>
              <span className="role-metric">{card.metric}</span>
              <h3>{card.label}</h3>
              <strong>{card.title}</strong>
              <p>{card.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="impact-strip">
        <div>
          <strong>Problème actuel</strong>
          <span>Paramétrage long, feuilles papier, données non capitalisées.</span>
        </div>
        <div>
          <strong>Solution demo</strong>
          <span>Flux numérique traçable avec IA et validation process.</span>
        </div>
        <div>
          <strong>Objectif compétition</strong>
          <span>Contribuer à l’augmentation de production NATEC ×5.</span>
        </div>
      </section>

      <FutureDataCard />
    </div>
  );
}
