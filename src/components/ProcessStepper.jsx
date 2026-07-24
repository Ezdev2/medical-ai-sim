const STEPS = [
  { id: 'ORDER_RECEIVED', label: 'Commande' },
  { id: 'AI_READY', label: 'Calcul IA' },
  { id: 'ENGINEER_VALIDATED', label: 'Validation' },
  { id: 'INJECTED_TO_BFM', label: 'Injection BFM' },
  { id: 'SHIFT_RECORDED', label: 'Dataset yield' },
];

function indexForStatus(status) {
  if (status === 'AI_PROCESSING') return 1;
  const index = STEPS.findIndex((step) => step.id === status);
  return index === -1 ? 0 : index;
}

export default function ProcessStepper({ status }) {
  const currentIndex = indexForStatus(status);
  return (
    <div className="stepper" aria-label="Digital process status">
      {STEPS.map((step, index) => (
        <div key={step.id} className={`step ${index <= currentIndex ? 'done' : ''}`}>
          <div className="dot">{index + 1}</div>
          <span>{step.label}</span>
        </div>
      ))}
    </div>
  );
}
