import FutureDataCard from '../components/FutureDataCard.jsx';

export default function RoleHub({ setRoute }) {
  const cards = [
    {
      route: 'client',
      label: 'I am a Customer',
      title: 'Place a Balloon Order',
      description:
        'The user enters the dimensions, material, and quantity. The order reference is generated automatically.',
      metric: '0 paper',
      icon: '01',
    },
    {
      route: 'engineer',
      label: 'I am an Engineer',
      title: 'AI Calculation + Process Validation',
      description:
        'View the order in real time, run the AI calculation, make adjustments if needed, then send it to the BFM.',
      metric: '~3 sec AI',
      icon: '02',
    },
    {
      route: 'operator',
      label: 'I am an Operator',
      title: 'Cleanroom Tablet + Yield',
      description:
        'Badge check-in, view validated parison cut and process parameters, then check out with defects and automatic yield tracking.',
      metric: 'Live Yield',
      icon: '03',
    },
  ];

  return (
    <div className="page page-home">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Digitalization</p>
          <h1>Transform a Customer Order into Validated BFM Machine Parameters.</h1>
          <p>
            This demo shows how Quadracure Innovators reduces machine setup time:
            structured customer order entry, AI calculation, engineer validation,
            Windows BFM integration, and operator feedback.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={() => setRoute('client')}>
              Start as Customer
            </button>
            <button className="ghost" onClick={() => setRoute('engineer')}>
              Go Directly to Engineer
            </button>
          </div>
        </div>
        <div className="hero-panel" aria-label="Digital Workflow">
          <div className="pipeline-node active">Customer Order</div>
          <div className="pipeline-line" />
          <div className="pipeline-node ai">AI Recipe</div>
          <div className="pipeline-line" />
          <div className="pipeline-node">Engineer Approval</div>
          <div className="pipeline-line" />
          <div className="pipeline-node machine">BFM Windows</div>
          <div className="pipeline-line" />
          <div className="pipeline-node operator">Operator Yield</div>
        </div>
      </section>

      <section>
        <div className="section-title">
          <p className="eyebrow">Choose Your Role</p>
          <h2>I am a...</h2>
        </div>
        <div className="role-grid">
          {cards.map((card) => (
            <button key={card.route} className="role-card" onClick={() => setRoute(card.route)}>
              <span className="role-index">{card.icon}</span>
              <span className="role-metric">{card.metric}</span>
              <h3>{card.label}</h3>
              <strong>{card.title}</strong>
              {/* <p>{card.description}</p> */}
            </button>
          ))}
        </div>
      </section>

      {/* <section className="impact-strip">
        <div>
          <strong>Current Challenge</strong>
          <span>Lengthy machine setup, paper-based forms, and unstructured data.</span>
        </div>
        <div>
          <strong>Demo Solution</strong>
          <span>Traceable digital workflow with AI and process validation.</span>
        </div>
        <div>
          <strong>Competition Goal</strong>
          <span>Support the NATEC ×5 production increase initiative.</span>
        </div>
      </section> */}

      <FutureDataCard />
    </div>
  );
}