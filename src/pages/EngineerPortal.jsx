import { useEffect, useMemo, useState } from "react";
import BfmScreen from "../components/BfmScreen.jsx";
import FutureDataCard from "../components/FutureDataCard.jsx";
import ProcessStepper from "../components/ProcessStepper.jsx";
import RecipeTable from "../components/RecipeTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { buildBfmScript, generateBFMRecipe } from "../services/aiService.js";
import { injectRecipeToBFM } from "../services/machineService.js";
import { subscribeOrders, updateOrder } from "../services/orderService.js";
import { formatDateTime, formatNumber } from "../utils/format.js";

function statusRank(status) {
  return (
    {
      ORDER_RECEIVED: 1,
      AI_PROCESSING: 2,
      AI_READY: 3,
      ENGINEER_VALIDATED: 4,
      INJECTED_TO_BFM: 5,
      SHIFT_RECORDED: 6,
    }[status] ?? 0
  );
}

export default function EngineerPortal({ setRoute }) {
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [recipeDraft, setRecipeDraft] = useState(null);
  const [isCalculating, setCalculating] = useState(false);
  const [isInjecting, setInjecting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => subscribeOrders(setOrders), []);

  const selectedOrder = useMemo(() => {
    return orders.find((order) => order.id === selectedId) || orders[0] || null;
  }, [orders, selectedId]);

  useEffect(() => {
    if (!selectedId && orders[0]) setSelectedId(orders[0].id);
  }, [orders, selectedId]);

  useEffect(() => {
    setRecipeDraft(
      selectedOrder?.approvedRecipe || selectedOrder?.recipe || null,
    );
    setMessage("");
    setError("");
  }, [selectedOrder?.id]);

  const queue = useMemo(() => {
    return [...orders].sort(
      (a, b) =>
        statusRank(a.status) - statusRank(b.status) ||
        (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0),
    );
  }, [orders]);

  async function handleGenerateRecipe() {
    if (!selectedOrder) return;

    setCalculating(true);
    setError("");
    setMessage(
      "AI calculation in progress: reading order, estimating thermal profile, generating BFM script...",
    );

    try {
      await updateOrder(selectedOrder.id, {
        status: "AI_PROCESSING",
        statusLabel: "AI calculation in progress",
      });

      const recipe = await generateBFMRecipe(selectedOrder);

      setRecipeDraft(recipe);

      await updateOrder(selectedOrder.id, {
        status: "AI_READY",
        statusLabel: "AI parameters generated",
        recipe,
      });

      setMessage(
        "Parameters generated. The engineer keeps full control before machine injection.",
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Error during AI calculation.");
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
      validatedBy: "Process Engineer / Quadracure Demo",
    };

    setRecipeDraft(validatedRecipe);

    await updateOrder(selectedOrder.id, {
      status: "ENGINEER_VALIDATED",
      statusLabel: "Validated by Engineer",
      approvedRecipe: validatedRecipe,
      validation: {
        validatedAtMs: validatedRecipe.validatedAtMs,
        validatedBy: validatedRecipe.validatedBy,
      },
    });

    setMessage(
      "Validation completed. Parameters are now ready for BFM machine injection.",
    );
  }

  async function handleInjectRecipe() {
    if (!selectedOrder || !recipeDraft) return;

    setInjecting(true);
    setError("");

    try {
      const recipeToInject = selectedOrder.approvedRecipe || recipeDraft;

      await injectRecipeToBFM(selectedOrder, recipeToInject);

      setMessage(
        "BFM injection completed successfully. The job is now available on the Operator Tablet.",
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Error during BFM injection.");
    } finally {
      setInjecting(false);
    }
  }

  return (
    <div className="page engineer-page">
      {/* <section className="portal-heading">
        <div>
          <p className="eyebrow">Engineer Portal</p>
          <h1>AI calculation, process validation and machine injection.</h1>
          <p>
            The Engineer Portal demonstrates the credibility of the system:
            no automatic machine injection without human validation.
            AI accelerates the setup, while the engineer ensures process reliability.
          </p>
        </div>

        <button className="ghost" onClick={() => setRoute('operator')}>
          Open Operator Portal →
        </button>
      </section> */}

      <div className="engineer-grid">
        <aside className="order-queue">
          <div className="queue-header">
            <div>
              <p className="eyebrow">Real Time</p>
              <h2>Orders</h2>
            </div>

            <span>{orders.length}</span>
          </div>

          {queue.map((order) => (
            <button
              key={order.id}
              className={`queue-item ${
                selectedOrder?.id === order.id ? "selected" : ""
              }`}
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
              <strong>No orders available.</strong>

              <span>
                Ask the customer to submit an order from the Customer Portal.
              </span>

              <button className="primary" onClick={() => setRoute("client")}>
                Open Customer Portal
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
                    <p className="eyebrow">Selected Order</p>
                    <h2>{selectedOrder.id}</h2>
                    <StatusBadge
                      status={selectedOrder.status}
                      label={selectedOrder.statusLabel}
                    />
                  </div>

                  <ProcessStepper status={selectedOrder.status} />
                </div>

                <div className="spec-grid">
                  <div>
                    <span>Customer</span>
                    <strong>{selectedOrder.organization}</strong>
                  </div>

                  <div>
                    <span>Material</span>
                    <strong>{selectedOrder.material}</strong>
                  </div>

                  <div>
                    <span>Dimensions</span>
                    <strong>
                      Ø{formatNumber(selectedOrder.balloonDiameterMm)} ×{" "}
                      {formatNumber(selectedOrder.balloonLengthMm)} mm
                    </strong>
                  </div>

                  <div>
                    <span>Wall Thickness</span>
                    <strong>
                      {formatNumber(selectedOrder.wallThicknessMm, 3)} mm
                    </strong>
                  </div>

                  <div>
                    <span>Quantity</span>
                    <strong>{selectedOrder.quantity} pcs</strong>
                  </div>

                  <div>
                    <span>Created</span>
                    <strong>{formatDateTime(selectedOrder.createdAtMs)}</strong>
                  </div>
                </div>
              </div>

              <div className="action-panel panel">
                <div className="ai-card">
                  <div>
                    <p className="eyebrow">AI Setup Assistant</p>

                    <h2>Generate BFM Parameters</h2>

                    <p>
                      AI transforms customer specifications into an initial
                      process recipe: parison cut, temperature, pressure,
                      stretch, cooling, and Windows injection script.
                    </p>
                  </div>

                  <button
                    className="primary"
                    disabled={isCalculating}
                    onClick={handleGenerateRecipe}
                  >
                    {isCalculating
                      ? "AI Calculation in Progress..."
                      : "Generate with AI (~3 sec)"}
                  </button>
                </div>

                {isCalculating && (
                  <div className="ai-progress">
                    <div className="spinner" />

                    <div>
                      <strong>AI Analysis</strong>

                      <span>
                        Dimensions → Material → Future History → Machine
                        Parameters → Windows Script
                      </span>
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
                      <p className="eyebrow">Process Recipe</p>

                      <h2>Editable Parameters Before Validation</h2>
                    </div>

                    {recipeDraft?.source && (
                      <span className="source-pill">{recipeDraft.source}</span>
                    )}
                  </div>

                  {recipeDraft?.summary && (
                    <p className="recipe-summary">{recipeDraft.summary}</p>
                  )}

                  <RecipeTable
                    recipe={recipeDraft}
                    editable={Boolean(recipeDraft)}
                    onChange={setRecipeDraft}
                  />

                  {recipeDraft && (
                    <div className="qa-grid">
                      <div>
                        <h3>Quality Checks</h3>

                        <ul>
                          {(recipeDraft.qualityChecks || []).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3>Risks / Items to Verify</h3>

                        <ul>
                          {(recipeDraft.riskFlags || []).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      className="primary"
                      disabled={!recipeDraft}
                      onClick={handleValidateRecipe}
                    >
                      Validate Parameters
                    </button>

                    <button
                      className="secondary"
                      disabled={!recipeDraft || isInjecting}
                      onClick={handleInjectRecipe}
                    >
                      {isInjecting ? "Injecting..." : "Inject to BFM"}
                    </button>
                  </div>
                </section>
                <section className="panel machine-panel">
                  <div className="panel-title-row">
                    <div>
                      <p className="eyebrow">BFM Machine</p>
                      <h2>Windows Screen / Injected Script</h2>
                    </div>
                  </div>

                  <BfmScreen
                    order={selectedOrder}
                    recipe={selectedOrder.approvedRecipe || recipeDraft}
                    injected={
                      selectedOrder.status === "INJECTED_TO_BFM" ||
                      selectedOrder.status === "SHIFT_RECORDED"
                    }
                  />

                  <div className="machine-note">
                    <strong>Key Presentation Message:</strong> The BFM receives
                    a validated recipe/script. The operator no longer has to
                    manually copy machine parameters, reducing setup time and
                    minimizing human errors.
                  </div>
                </section>
              </div>

              <FutureDataCard />
            </>
          ) : (
            <div className="panel empty-state tall">
              <strong>Select or create an order.</strong>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
