import { useEffect, useMemo, useState } from "react";
import StatusBadge from "../components/StatusBadge.jsx";
import ProcessStepper from "../components/ProcessStepper.jsx";
import { createOrder, subscribeOrders } from "../services/orderService.js";
import { formatDateTime } from "../utils/format.js";

const INITIAL_FORM = {
  organization: "Client Demo / NATEC",
  contactName: "Demo User",
  contactEmail: "client@natec-demo.mu",
  material: "Pebax",
  balloonDiameterMm: 4,
  balloonLengthMm: 30,
  balloonWidthMm: 4,
  wallThicknessMm: 0.06,
  tubeOuterDiameterMm: 1.55,
  tubeInnerDiameterMm: 1.05,
  quantity: 120,
  targetPressureBar: 12,
  toleranceMm: 0.1,
  priority: "Standard",
  clinicalUse: "PTCA / Catheter Balloon Forming Demo",
};

const MATERIALS = ["Pebax", "Nylon 12", "PET", "Polyurethane", "Silicone"];

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

  const recentOrder = useMemo(
    () => orders.find((item) => item.id === submittedOrder?.id),
    [orders, submittedOrder],
  );

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
      {/* <section className="portal-heading">
        <div>
          <p className="eyebrow">Customer Portal</p>
          <h1>Structured order for automatic setup calculation.</h1>
          <p>
            The order reference is generated automatically. Only the information
            required by the engineer and the BFM AI is requested.
          </p>
        </div>

        <button className="ghost" onClick={() => setRoute('engineer')}>
          View Engineer Portal →
        </button>
      </section> */}

      <div className="two-column client-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-section-title">
            <span>1</span>

            <div>
              <h2>Customer Information</h2>
              <p>
                Basic customer details. The order reference is generated
                automatically upon submission.
              </p>
            </div>
          </div>

          <div className="field-grid two">
            <label>
              Customer / Organization Name
              <input
                required
                value={form.organization}
                onChange={(event) =>
                  updateField("organization", event.target.value)
                }
                placeholder="e.g. NATEC Medical Ltd"
              />
            </label>

            <label>
              Contact Person
              <input
                required
                value={form.contactName}
                onChange={(event) =>
                  updateField("contactName", event.target.value)
                }
                placeholder="Requester's name"
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={form.contactEmail}
                onChange={(event) =>
                  updateField("contactEmail", event.target.value)
                }
                placeholder="contact@organization.com"
              />
            </label>

            <label>
              Priority
              <select
                value={form.priority}
                onChange={(event) =>
                  updateField("priority", event.target.value)
                }
              >
                <option>Standard</option>
                <option>Urgent</option>
                <option>R&D Prototype</option>
                <option>Process Validation</option>
              </select>
            </label>
          </div>

          <div className="form-section-title">
            <span>2</span>

            <div>
              <h2>Balloon Specifications</h2>
              <p>
                Dimensions are entered in millimeters. Material is selected from
                a predefined list to avoid input errors.
              </p>
            </div>
          </div>

          <div className="field-grid three">
            <label>
              Balloon Tube Material
              <select
                value={form.material}
                onChange={(event) =>
                  updateField("material", event.target.value)
                }
              >
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
                onChange={(event) =>
                  updateField("balloonDiameterMm", event.target.value)
                }
              />
            </label>

            <label>
              Balloon Length (mm)
              <input
                required
                type="number"
                min="1"
                step="0.1"
                value={form.balloonLengthMm}
                onChange={(event) =>
                  updateField("balloonLengthMm", event.target.value)
                }
              />
            </label>

            <label>
              Balloon Width / Profile (mm)
              <input
                required
                type="number"
                min="0.1"
                step="0.01"
                value={form.balloonWidthMm}
                onChange={(event) =>
                  updateField("balloonWidthMm", event.target.value)
                }
              />
            </label>

            <label>
              Target Wall Thickness (mm)
              <input
                required
                type="number"
                min="0.01"
                step="0.005"
                value={form.wallThicknessMm}
                onChange={(event) =>
                  updateField("wallThicknessMm", event.target.value)
                }
              />
            </label>

            <label>
              Quantity (pcs)
              <input
                required
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(event) =>
                  updateField("quantity", event.target.value)
                }
              />
            </label>
          </div>
          <div className="advanced-box">
            <div className="advanced-title">Optional Process Parameters</div>

            <div className="field-grid three">
              <label>
                Tube OD (mm)
                <input
                  type="number"
                  min="0.1"
                  step="0.01"
                  value={form.tubeOuterDiameterMm}
                  onChange={(event) =>
                    updateField("tubeOuterDiameterMm", event.target.value)
                  }
                />
              </label>

              <label>
                Tube ID (mm)
                <input
                  type="number"
                  min="0.1"
                  step="0.01"
                  value={form.tubeInnerDiameterMm}
                  onChange={(event) =>
                    updateField("tubeInnerDiameterMm", event.target.value)
                  }
                />
              </label>

              <label>
                Target Pressure (bar)
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={form.targetPressureBar}
                  onChange={(event) =>
                    updateField("targetPressureBar", event.target.value)
                  }
                />
              </label>

              <label>
                Dimensional Tolerance (± mm)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.toleranceMm}
                  onChange={(event) =>
                    updateField("toleranceMm", event.target.value)
                  }
                />
              </label>

              <label className="span-two">
                Application / Notes
                <input
                  value={form.clinicalUse}
                  onChange={(event) =>
                    updateField("clinicalUse", event.target.value)
                  }
                  placeholder="e.g. Coronary balloon, prototype validation..."
                />
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button className="primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Submitting..." : "Submit Order"}
            </button>

            <button
              className="ghost"
              type="button"
              onClick={() => setForm(INITIAL_FORM)}
            >
              Load Demo Data
            </button>
          </div>
        </form>

        <aside className="side-card sticky-card">
          <p className="eyebrow">Live Order</p>

          {submittedOrder ? (
            <div className="submitted-box">
              <h2>{submittedOrder.id}</h2>

              <StatusBadge
                status={recentOrder?.status || submittedOrder.status}
                label={recentOrder?.statusLabel || submittedOrder.statusLabel}
              />

              <ProcessStepper
                status={recentOrder?.status || submittedOrder.status}
              />

              <dl className="summary-list">
                <div>
                  <dt>Customer</dt>
                  <dd>{submittedOrder.organization}</dd>
                </div>

                <div>
                  <dt>Material</dt>
                  <dd>{submittedOrder.material}</dd>
                </div>

                <div>
                  <dt>Dimensions</dt>

                  <dd>
                    Ø{submittedOrder.balloonDiameterMm} ×{" "}
                    {submittedOrder.balloonLengthMm} mm · wall{" "}
                    {submittedOrder.wallThicknessMm} mm
                  </dd>
                </div>

                <div>
                  <dt>Created</dt>
                  <dd>{formatDateTime(submittedOrder.createdAtMs)}</dd>
                </div>
              </dl>

              <button
                className="primary full"
                onClick={() => setRoute("engineer")}
              >
                Continue to Engineer
              </button>
            </div>
          ) : (
            <div className="empty-state tall">
              <strong>No order submitted yet.</strong>
              <span>
                Once submitted, the order appears instantly in the Engineer
                Portal through Firebase.
              </span>
            </div>
          )}

          <div className="mini-feed">
            <h3>Recent Orders</h3>

            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="feed-row">
                <span>{order.id}</span>

                <StatusBadge status={order.status} label={order.statusLabel} />
              </div>
            ))}

            {orders.length === 0 && <p>No orders available yet.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
