import { useEffect, useMemo, useState } from 'react';
import BfmScreen from '../components/BfmScreen.jsx';
import FutureDataCard from '../components/FutureDataCard.jsx';
import ProcessStepper from '../components/ProcessStepper.jsx';
import RecipeTable from '../components/RecipeTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { buildBfmScript, generateBFMRecipe } from '../services/aiService.js';
import { injectRecipeToBFM } from '../services/machineService.js';
import { subscribeOrders, updateOrder } from '../services/orderService.js';
import { formatDateTime, formatNumber } from '../utils/format.js';

function statusRank(status) {
  return {
    ORDER_RECEIVED: 1,
    AI_PROCESSING: 2,
    AI_READY: 3,
    ENGINEER_VALIDATED: 4,
    INJECTED_TO_BFM: 5,
    SHIFT_RECORDED: 6,
  }[status] ?? 0;
}

export default function EngineerPortal({ setRoute }) {
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [recipeDraft, setRecipeDraft] = useState(null);
  const [isCalculating, setCalculating] = useState(false);
  const [isInjecting, setInjecting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => subscribeOrders(setOrders), []);

  const selectedOrder = useMemo(() => {
    return orders.find((order) => order.id === selectedId) || orders[0] || null;
  }, [orders, selectedId]);

  useEffect(() => {
    if (!selectedId && orders[0]) setSelectedId(orders[0].id);
  }, [orders, selectedId]);

  useEffect(() => {
    setRecipeDraft(selectedOrder?.approvedRecipe || selectedOrder?.recipe || null);
    setMessage('');
    setError('');
  }, [selectedOrder?.id]);

  const queue = useMemo(() => {
    return [...orders].sort((a, b) => statusRank(a.status) - statusRank(b.status) || (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
  }, [orders]);

  async function handleGenerateRecipe() {
    if (!selectedOrder) return;
    setCalculating(true);
    setError('');
    setMessage('Calcul IA en cours : lecture commande, estimation thermique, génération script BFM...');

    try {
      await updateOrder(selectedOrder.id, {
        status: 'AI_PROCESSING',
        statusLabel: 'Calcul IA en cours',
      });
      const recipe = await generateBFMRecipe(selectedOrder);
      setRecipeDraft(recipe);
      await updateOrder(selectedOrder.id, {
        status: 'AI_READY',
        statusLabel: 'Paramètres IA proposés',
        recipe,
      });
      setMessage('Paramètres proposés. L’ingénieur garde le contrôle avant injection machine.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur pendant le calcul IA.');
    } finally {
      setCalculating(false);
    }
  }

  async function handleValidateRecipe() {
    if (!selectedOrder || !recipeDraft) return;
    const validatedRecipe = {
      ...recipeDraft,
      bfmScript: buildBfmScript(selectedOrder, recipeDraft.parameters),
      validatedAtMs: Date.now(),
      validatedBy: 'Process Engineer / Quadracure demo',
    };
    setRecipeDraft(validatedRecipe);
    await updateOrder(selectedOrder.id, {
      status: 'ENGINEER_VALIDATED',
      statusLabel: 'Paramètres validés par ingénieur',
      approvedRecipe: validatedRecipe,
      validation: {
        validatedAtMs: validatedRecipe.validatedAtMs,
        validatedBy: validatedRecipe.validatedBy,
      },
    });
    setMessage('Validation enregistrée. Les paramètres peuvent être injectés vers la BFM Windows.');
  }

  async function handleInjectRecipe() {
    if (!selectedOrder || !recipeDraft) return;
    setInjecting(true);
    setError('');
    try {
      const recipeToInject = selectedOrder.approvedRecipe || recipeDraft;
      await injectRecipeToBFM(selectedOrder, recipeToInject);
      setMessage('Injection BFM réussie. Le job apparaît maintenant sur la tablette opérateur.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur pendant l’injection BFM.');
    } finally {
      setInjecting(false);
    }
  }

  return (
    <div className="page engineer-page">
      {/* <section className="portal-heading">
        <div>
          <p className="eyebrow">Vue Ingénieur</p>
          <h1>Calcul IA, validation process et injection machine.</h1>
          <p>
            Le côté ingénieur montre la crédibilité du système : aucune injection automatique sans validation humaine.
            L’IA accélère le setup; l’ingénieur sécurise le process.
          </p>
        </div>
        <button className="ghost" onClick={() => setRoute('operator')}>
          Voir côté opérateur →
        </button>
      </section> */}

      <div className="engineer-grid">
        <aside className="order-queue">
          <div className="queue-header">
            <div>
              <p className="eyebrow">Temps réel</p>
              <h2>Commandes</h2>
            </div>
            <span>{orders.length}</span>
          </div>

          {queue.map((order) => (
            <button
              key={order.id}
              className={`queue-item ${selectedOrder?.id === order.id ? 'selected' : ''}`}
              onClick={() => setSelectedId(order.id)}
            >
              <div>
                <strong>{order.id}</strong>
                <span>{order.organization}</span>
              </div>
              <StatusBadge status={order.status} label={order.statusLabel} />
            </button>
          ))}

          {queue.length === 0 && (
            <div className="empty-state tall">
              <strong>Aucune commande.</strong>
              <span>Demandez au client de passer une commande côté client.</span>
              <button className="primary" onClick={() => setRoute('client')}>
                Ouvrir vue client
              </button>
            </div>
          )}
        </aside>

        <section className="engineer-workspace">
          {selectedOrder ? (
            <>
              <div className="order-overview panel">
                <div className="overview-top">
                  <div>
                    <p className="eyebrow">Commande sélectionnée</p>
                    <h2>{selectedOrder.id}</h2>
                    <StatusBadge status={selectedOrder.status} label={selectedOrder.statusLabel} />
                  </div>
                  <ProcessStepper status={selectedOrder.status} />
                </div>

                <div className="spec-grid">
                  <div>
                    <span>Client</span>
                    <strong>{selectedOrder.organization}</strong>
                  </div>
                  <div>
                    <span>Matériau</span>
                    <strong>{selectedOrder.material}</strong>
                  </div>
                  <div>
                    <span>Dimensions</span>
                    <strong>
                      Ø{formatNumber(selectedOrder.balloonDiameterMm)} × {formatNumber(selectedOrder.balloonLengthMm)} mm
                    </strong>
                  </div>
                  <div>
                    <span>Épaisseur</span>
                    <strong>{formatNumber(selectedOrder.wallThicknessMm, 3)} mm</strong>
                  </div>
                  <div>
                    <span>Quantité</span>
                    <strong>{selectedOrder.quantity} pcs</strong>
                  </div>
                  <div>
                    <span>Créée</span>
                    <strong>{formatDateTime(selectedOrder.createdAtMs)}</strong>
                  </div>
                </div>
              </div>

              <div className="action-panel panel">
                <div className="ai-card">
                  <div>
                    <p className="eyebrow">IA de setup</p>
                    <h2>Proposition des paramètres BFM</h2>
                    <p>
                      L’IA transforme les specs client en recette initiale : parison cut, température, pression,
                      stretch, cooling et script d’injection.
                    </p>
                  </div>
                  <button className="primary" disabled={isCalculating} onClick={handleGenerateRecipe}>
                    {isCalculating ? 'Calcul IA en cours...' : 'Calculer avec IA (~3 sec)'}
                  </button>
                </div>

                {isCalculating && (
                  <div className="ai-progress">
                    <div className="spinner" />
                    <div>
                      <strong>Analyse IA</strong>
                      <span>Dimensions → matériau → historique futur → paramètres machine → script Windows</span>
                    </div>
                  </div>
                )}

                {message && <div className="notice success">{message}</div>}
                {error && <div className="notice error">{error}</div>}
              </div>

              <div className="recipe-machine-grid">
                <section className="panel">
                  <div className="panel-title-row">
                    <div>
                      <p className="eyebrow">Recette process</p>
                      <h2>Paramètres éditables avant validation</h2>
                    </div>
                    {recipeDraft?.source && <span className="source-pill">{recipeDraft.source}</span>}
                  </div>

                  {recipeDraft?.summary && <p className="recipe-summary">{recipeDraft.summary}</p>}
                  <RecipeTable recipe={recipeDraft} editable={Boolean(recipeDraft)} onChange={setRecipeDraft} />

                  {recipeDraft && (
                    <div className="qa-grid">
                      <div>
                        <h3>Contrôles qualité</h3>
                        <ul>
                          {(recipeDraft.qualityChecks || []).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3>Risques / points à vérifier</h3>
                        <ul>
                          {(recipeDraft.riskFlags || []).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="form-actions">
                    <button className="primary" disabled={!recipeDraft} onClick={handleValidateRecipe}>
                      Valider paramètres
                    </button>
                    <button
                      className="secondary"
                      disabled={!recipeDraft || isInjecting}
                      onClick={handleInjectRecipe}
                    >
                      {isInjecting ? 'Injection...' : 'Injecter vers BFM'}
                    </button>
                  </div>
                </section>

                <section className="panel machine-panel">
                  <div className="panel-title-row">
                    <div>
                      <p className="eyebrow">Machine BFM</p>
                      <h2>Écran Windows / script injecté</h2>
                    </div>
                  </div>
                  <BfmScreen
                    order={selectedOrder}
                    recipe={selectedOrder.approvedRecipe || recipeDraft}
                    injected={selectedOrder.status === 'INJECTED_TO_BFM' || selectedOrder.status === 'SHIFT_RECORDED'}
                  />
                  <div className="machine-note">
                    <strong>Message clé presentation :</strong> la BFM reçoit un fichier/script validé. L’opérateur ne
                    recopie plus les paramètres manuellement, ce qui réduit erreurs et temps de setup.
                  </div>
                </section>
              </div>

              {/* <FutureDataCard /> */}
            </>
          ) : (
            <div className="panel empty-state tall">
              <strong>Sélectionner ou créer une commande.</strong>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
