export default function BfmScreen({ order, recipe, injected = false }) {
  const script = recipe?.bfmScript || 'En attente de validation ingénieur...';

  return (
    <div className="bfm-screen" aria-label="Simulation écran Windows BFM">
      <div className="window-bar">
        <div className="window-dots">
          <span />
          <span />
          <span />
        </div>
        <div>BFM-01 Windows HMI — Recipe Loader</div>
        <div className={injected ? 'screen-led online' : 'screen-led'}>{injected ? 'LINK OK' : 'STANDBY'}</div>
      </div>
      <div className="screen-body">
        <div className="screen-grid">
          <div>
            <small>ORDER</small>
            <strong>{order?.id || '—'}</strong>
          </div>
          <div>
            <small>MATERIAL</small>
            <strong>{order?.material || '—'}</strong>
          </div>
          <div>
            <small>STATUS</small>
            <strong>{injected ? 'READY FOR OPERATOR' : 'AWAITING APPROVAL'}</strong>
          </div>
        </div>
        <pre>{script}</pre>
      </div>
    </div>
  );
}
