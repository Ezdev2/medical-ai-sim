import { useEffect, useMemo, useState } from 'react';
import StatusBadge from '../components/StatusBadge.jsx';
import ProcessStepper from '../components/ProcessStepper.jsx';
import { createOrder, subscribeOrders } from '../services/orderService.js';
import { formatDateTime } from '../utils/format.js';

const INITIAL_FORM = {
  organization: 'Jury Demo / NATEC',
  contactName: 'Demo user',
  contactEmail: 'jury@natec-demo.mu',
  material: 'Pebax',
  balloonDiameterMm: 4,
  balloonLengthMm: 30,
  balloonWidthMm: 4,
  wallThicknessMm: 0.06,
  tubeOuterDiameterMm: 1.55,
  tubeInnerDiameterMm: 1.05,
  quantity: 120,
  targetPressureBar: 12,
  toleranceMm: 0.1,
  priority: 'Standard',
  clinicalUse: 'PTCA / catheter balloon forming demo',
};

const MATERIALS = ['Pebax', 'Nylon 12', 'PET', 'Polyurethane', 'Silicone'];

function numberPayload(form) {
  return {
    ...form,
    balloonDiameterMm: Number(form.balloonDiameterMm),
    balloonLengthMm: Number(form.balloonLengthMm),
    balloonWidthMm: Number(form.balloonWidthMm),
    wallThicknessMm: Number(form.wallThicknessMm),
    tubeOuterDiameterMm: Number(form.tubeOuterDiameterMm),
    tubeInnerDiameterMm: Number(form.tubeInnerDiameterMm),
    quantity: Number(form.quantity),
    targetPressureBar: Number(form.targetPressureBar),
    toleranceMm: Number(form.toleranceMm),
  };
}

export default function ClientPortal({ setRoute }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [orders, setOrders] = useState([]);
  const [isSubmitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  useEffect(() => subscribeOrders(setOrders), []);

  const recentOrder = useMemo(() => orders.find((item) => item.id === submittedOrder?.id), [orders, submittedOrder]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const order = await createOrder(numberPayload(form));
      setSubmittedOrder(order);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <section className="portal-heading">
        <div>
          <p className="eyebrow">Vue Client</p>
          <h1>Commande structurée pour calcul automatique de setup.</h1>
          <p>
            Le numéro de référence est généré automatiquement. Les champs sont limités aux informations utiles
            pour l’ingénieur et pour l’IA de paramétrage BFM.
          </p>
        </div>
        <button className="ghost" onClick={() => setRoute('engineer')}>
          Voir côté ingénieur →
        </button>
      </section>

      <div className="two-column client-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-section-title">
            <span>1</span>
            <div>
              <h2>Informations client</h2>
              <p>Identification simple, la référence commande est créée à l’envoi.</p>
            </div>
          </div>

          <div className="field-grid two">
            <label>
              Nom du client / organisation
              <input
                required
                value={form.organization}
                onChange={(event) => updateField('organization', event.target.value)}
                placeholder="Ex: NATEC Medical Ltd"
              />
            </label>
            <label>
              Contact
              <input
                required
                value={form.contactName}
                onChange={(event) => updateField('contactName', event.target.value)}
                placeholder="Nom du demandeur"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.contactEmail}
                onChange={(event) => updateField('contactEmail', event.target.value)}
                placeholder="contact@organisation.com"
              />
            </label>
            <label>
              Priorité
              <select value={form.priority} onChange={(event) => updateField('priority', event.target.value)}>
                <option>Standard</option>
                <option>Urgent</option>
                <option>Prototype R&D</option>
                <option>Validation process</option>
              </select>
            </label>
          </div>

          <div className="form-section-title">
            <span>2</span>
            <div>
              <h2>Spécifications ballon</h2>
              <p>Dimensions en mm, matériau en sélection pour éviter les erreurs de saisie.</p>
            </div>
          </div>

          <div className="field-grid three">
            <label>
              Matériau tube ballon
              <select value={form.material} onChange={(event) => updateField('material', event.target.value)}>
                {MATERIALS.map((material) => (
                  <option key={material}>{material}</option>
                ))}
              </select>
            </label>
            <label>
              Balloon Ø (mm)
              <input
                required
                type="number"
                min="0.1"
                step="0.01"
                value={form.balloonDiameterMm}
                onChange={(event) => updateField('balloonDiameterMm', event.target.value)}
              />
            </label>
            <label>
              Longueur ballon (mm)
              <input
                required
                type="number"
                min="1"
                step="0.1"
                value={form.balloonLengthMm}
                onChange={(event) => updateField('balloonLengthMm', event.target.value)}
              />
            </label>
            <label>
              Largeur / profil ballon (mm)
              <input
                required
                type="number"
                min="0.1"
                step="0.01"
                value={form.balloonWidthMm}
                onChange={(event) => updateField('balloonWidthMm', event.target.value)}
              />
            </label>
            <label>
              Épaisseur paroi cible (mm)
              <input
                required
                type="number"
                min="0.01"
                step="0.005"
                value={form.wallThicknessMm}
                onChange={(event) => updateField('wallThicknessMm', event.target.value)}
              />
            </label>
            <label>
              Quantité (pcs)
              <input
                required
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(event) => updateField('quantity', event.target.value)}
              />
            </label>
          </div>

          <div className="advanced-box">
            <div className="advanced-title">Précision process optionnelle</div>
            <div className="field-grid three">
              <label>
                Tube OD (mm)
                <input
                  type="number"
                  min="0.1"
                  step="0.01"
                  value={form.tubeOuterDiameterMm}
                  onChange={(event) => updateField('tubeOuterDiameterMm', event.target.value)}
                />
              </label>
              <label>
                Tube ID (mm)
                <input
                  type="number"
                  min="0.1"
                  step="0.01"
                  value={form.tubeInnerDiameterMm}
                  onChange={(event) => updateField('tubeInnerDiameterMm', event.target.value)}
                />
              </label>
              <label>
                Pression cible (bar)
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={form.targetPressureBar}
                  onChange={(event) => updateField('targetPressureBar', event.target.value)}
                />
              </label>
              <label>
                Tolérance dimensionnelle (± mm)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.toleranceMm}
                  onChange={(event) => updateField('toleranceMm', event.target.value)}
                />
              </label>
              <label className="span-two">
                Application / commentaire
                <input
                  value={form.clinicalUse}
                  onChange={(event) => updateField('clinicalUse', event.target.value)}
                  placeholder="Ex: coronary balloon, validation prototype..."
                />
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button className="primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Envoi temps réel...' : 'Passer commande'}
            </button>
            <button className="ghost" type="button" onClick={() => setForm(INITIAL_FORM)}>
              Charger exemple jury
            </button>
          </div>
        </form>

        <aside className="side-card sticky-card">
          <p className="eyebrow">Commande live</p>
          {submittedOrder ? (
            <div className="submitted-box">
              <h2>{submittedOrder.id}</h2>
              <StatusBadge
                status={recentOrder?.status || submittedOrder.status}
                label={recentOrder?.statusLabel || submittedOrder.statusLabel}
              />
              <ProcessStepper status={recentOrder?.status || submittedOrder.status} />
              <dl className="summary-list">
                <div>
                  <dt>Client</dt>
                  <dd>{submittedOrder.organization}</dd>
                </div>
                <div>
                  <dt>Matériau</dt>
                  <dd>{submittedOrder.material}</dd>
                </div>
                <div>
                  <dt>Dimensions</dt>
                  <dd>
                    Ø{submittedOrder.balloonDiameterMm} × {submittedOrder.balloonLengthMm} mm · ép.
                    {submittedOrder.wallThicknessMm} mm
                  </dd>
                </div>
                <div>
                  <dt>Créé</dt>
                  <dd>{formatDateTime(submittedOrder.createdAtMs)}</dd>
                </div>
              </dl>
              <button className="primary full" onClick={() => setRoute('engineer')}>
                Continuer côté ingénieur
              </button>
            </div>
          ) : (
            <div className="empty-state tall">
              <strong>Aucune commande envoyée.</strong>
              <span>Après envoi, la commande apparaît instantanément côté ingénieur via Firebase.</span>
            </div>
          )}

          <div className="mini-feed">
            <h3>Dernières commandes</h3>
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="feed-row">
                <span>{order.id}</span>
                <StatusBadge status={order.status} label={order.statusLabel} />
              </div>
            ))}
            {orders.length === 0 && <p>Le flux est vide pour le moment.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
