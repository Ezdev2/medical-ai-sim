export default function FutureDataCard() {
  return (
    <section className="future-card">
      <div>
        <p className="eyebrow">Pourquoi ces données changent l’échelle ?</p>
        <h3>Dataset process → IA plus avancée</h3>
      </div>
      <div className="data-grid">
        <div>
          <strong>Commande</strong>
          <span>dimensions, matériau, quantité, pression cible</span>
        </div>
        <div>
          <strong>Paramètres BFM</strong>
          <span>températures, pression, stretch, cycle time</span>
        </div>
        <div>
          <strong>Production réelle</strong>
          <span>ballons formés par shift, défauts, yield</span>
        </div>
        <div>
          <strong>Apprentissage futur</strong>
          <span>prédire les meilleurs setups et réduire les essais</span>
        </div>
      </div>
      {/* <p>
        Chaque commande validée devient un exemple structuré. À mesure que NATEC collecte plus de données,
        l’IA peut recommander des paramètres plus précis, détecter les dérives et soutenir la scalabilité.
      </p> */}
    </section>
  );
}
