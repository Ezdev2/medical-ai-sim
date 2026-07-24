import { useEffect, useMemo, useState } from 'react';
import ParisonVisual from '../components/ParisonVisual.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { subscribeMachineJobs, updateMachineJob } from '../services/machineService.js';
import { assignLayout, estimateMachineOutput, saveShiftRecord } from '../services/operatorService.js';
import { formatDateTime, formatNumber } from '../utils/format.js';

const INITIAL_OPERATOR = {
  operatorName: 'Operator Demo',
  badgeId: 'NAT-042',
};

export default function OperatorPortal({ setRoute }) {
  const [jobs, setJobs] = useState([]);
  const [operatorForm, setOperatorForm] = useState(INITIAL_OPERATOR);
  const [operator, setOperator] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [totalFormed, setTotalFormed] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(5);
  const [notes, setNotes] = useState('');
  const [record, setRecord] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeMachineJobs(setJobs), []);

  const selectedJob = useMemo(() => {
    return jobs.find((job) => job.id === selectedJobId) || jobs[0] || null;
  }, [jobs, selectedJobId]);

  useEffect(() => {
    if (!selectedJobId && jobs[0]) setSelectedJobId(jobs[0].id);
  }, [jobs, selectedJobId]);

  useEffect(() => {
    if (selectedJob) {
      setTotalFormed(estimateMachineOutput(selectedJob));
      setRejectedCount(5);
      setRecord(null);
    }
  }, [selectedJob?.id]);

  function updateOperatorField(field, value) {
    setOperatorForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCheckIn(event) {
    event.preventDefault();
    const layoutAssignment = assignLayout(operatorForm.badgeId, operatorForm.operatorName);
    const checkedInOperator = {
      ...operatorForm,
      layoutAssignment,
      checkedInAtMs: Date.now(),
    };
    setOperator(checkedInOperator);
    if (selectedJob) {
      await updateMachineJob(selectedJob.id, {
        status: 'OPERATOR_CHECKED_IN',
        statusLabel: 'Operator checked-in',
        currentOperator: checkedInOperator,
      });
    }
  }

  async function handleCheckout(event) {
    event.preventDefault();
    if (!operator || !selectedJob) return;
    setSaving(true);
    try {
      const saved = await saveShiftRecord({
        operator,
        job: selectedJob,
        totalFormed,
        rejectedCount,
        notes,
      });
      setRecord(saved);
    } finally {
      setSaving(false);
    }
  }

  const params = selectedJob?.recipe?.parameters ?? {};

  return (
    <div className="page operator-page">
      <section className="portal-heading">
        <div>
          <p className="eyebrow">Operator View</p>
          <h1>Cleanroom tablet: check-in, validated parameters, and yield.</h1>
          <p>
            The operator receives only useful information: assigned layout, BFM job, visual parison cut,
            main parameters, and check-out. Less paper, fewer errors, more actionable data.
          </p>
        </div>
        <button className="ghost" onClick={() => setRoute('client')}>
          Restart demo →
        </button>
      </section>

      <div className="operator-grid">
        <aside className="operator-sidebar">
          <form className="form-card compact" onSubmit={handleCheckIn}>
            <div className="form-section-title">
              <span>✓</span>
              <div>
                <h2>Operator Check-in</h2>
                <p>The badge automatically assigns a layout zone.</p>
              </div>
            </div>
            <label>
              Operator Name
              <input
                required
                value={operatorForm.operatorName}
                onChange={(event) => updateOperatorField('operatorName', event.target.value)}
              />
            </label>
            <label>
              Badge ID
              <input
                required
                value={operatorForm.badgeId}
                onChange={(event) => updateOperatorField('badgeId', event.target.value)}
              />
            </label>
            <button className="primary full" type="submit">
              Check-in
            </button>
          </form>

          {operator && (
            <div className="side-card operator-card">
              <p className="eyebrow">Active Session</p>
              <h2>{operator.operatorName}</h2>
              <dl className="summary-list">
                <div>
                  <dt>Badge</dt>
                  <dd>{operator.badgeId}</dd>
                </div>
                <div>
                  <dt>Assigned Layout</dt>
                  <dd>{operator.layoutAssignment}</dd>
                </div>
                <div>
                  <dt>Check-in</dt>
                  <dd>{formatDateTime(operator.checkedInAtMs)}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="side-card">
            <div className="queue-header compact-row">
              <div>
                <p className="eyebrow">Injected Jobs</p>
                <h2>BFM ready</h2>
              </div>
              <span>{jobs.length}</span>
            </div>
            {jobs.map((job) => (
              <button
                key={job.id}
                className={`job-item ${selectedJob?.id === job.id ? 'selected' : ''}`}
                onClick={() => setSelectedJobId(job.id)}
              >
                <strong>{job.orderId}</strong>
                <span>{job.order?.organization}</span>
                <StatusBadge status={job.order?.status} label={job.statusLabel} />
              </button>
            ))}
            {jobs.length === 0 && (
              <div className="empty-state">
                <strong>No jobs injected.</strong>
                <span>Validate and inject a recipe from the engineer side.</span>
                <button className="primary" onClick={() => setRoute('engineer')}>
                  Open Engineer View
                </button>
              </div>
            )}
          </div>
        </aside>

        <section className="tablet-shell">
          <div className="tablet-frame">
            <div className="tablet-top">
              <div>
                <span className="tablet-camera" />
                <strong>NATEC Cleanroom Tablet</strong>
              </div>
              <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {selectedJob ? (
              <div className="tablet-content">
                <div className="tablet-hero">
                  <div>
                    <p className="eyebrow">Active Job</p>
                    <h2>{selectedJob.orderId}</h2>
                    <StatusBadge status={selectedJob.order?.status} label={selectedJob.statusLabel} />
                  </div>
                  <div className="tablet-metric">
                    <span>Estimated Cycle</span>
                    <strong>{formatNumber(params.estimatedCycleTimeSec, 1)} s</strong>
                  </div>
                </div>

                <ParisonVisual
                  parisonCutMm={params.parisonCutMm}
                  balloonLengthMm={selectedJob.order?.balloonLengthMm}
                  diameterMm={selectedJob.order?.balloonDiameterMm}
                />

                <div className="operator-param-grid">
                  <div>
                    <span>Mold temp</span>
                    <strong>{formatNumber(params.moldTemperatureC, 1)} °C</strong>
                  </div>
                  <div>
                    <span>Preheat</span>
                    <strong>{formatNumber(params.preheatTimeSec, 1)} s</strong>
                  </div>
                  <div>
                    <span>Blow pressure</span>
                    <strong>{formatNumber(params.blowPressureBar, 2)} bar</strong>
                  </div>
                  <div>
                    <span>Cooling</span>
                    <strong>{formatNumber(params.coolingTimeSec, 1)} s</strong>
                  </div>
                  <div>
                    <span>Gripper</span>
                    <strong>{formatNumber(params.gripperForceN, 1)} N</strong>
                  </div>
                  <div>
                    <span>Water jacket</span>
                    <strong>{formatNumber(params.waterJacketFlowLMin, 2)} L/min</strong>
                  </div>
                </div>

                <form className="checkout-card" onSubmit={handleCheckout}>
                  <div>
                    <p className="eyebrow">End of Shift</p>
                    <h2>Production Check-out</h2>
                    <p>The total is read from the BFM counter; the operator only indicates defective balloons.</p>
                  </div>

                  <div className="field-grid two">
                    <label>
                      Total balloons formed — BFM read
                      <input
                        type="number"
                        min="0"
                        value={totalFormed}
                        onChange={(event) => setTotalFormed(event.target.value)}
                      />
                    </label>
                    <label>
                      Defective balloons
                      <input
                        type="number"
                        min="0"
                        value={rejectedCount}
                        onChange={(event) => setRejectedCount(event.target.value)}
                      />
                    </label>
                    <label className="span-two">
                      Optional notes
                      <input
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Ex: no issue, first run stable..."
                      />
                    </label>
                  </div>

                  <button className="primary full" disabled={!operator || saving} type="submit">
                    {!operator ? 'Check-in before checking out' : saving ? 'Saving...' : 'Check-out & save yield'}
                  </button>
                </form>

                {record && (
                  <div className="yield-result">
                    <div>
                      <span>Accepted</span>
                      <strong>{record.acceptedCount}</strong>
                    </div>
                    <div>
                      <span>Rejected</span>
                      <strong>{record.rejectedCount}</strong>
                    </div>
                    <div>
                      <span>Yield</span>
                      <strong>{record.yieldPercent}%</strong>
                    </div>
                    <p>
                      Data saved in the production dataset: it links the order, BFM recipe,
                      operator, layout, output, and defects.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state tall tablet-empty">
                <strong>No jobs ready for operator.</strong>
                <span>The job will appear here after BFM injection from the engineer side.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}