const STATUS_STYLE = {
  ORDER_RECEIVED: 'blue',
  AI_PROCESSING: 'purple',
  AI_READY: 'purple',
  ENGINEER_VALIDATED: 'green',
  INJECTED_TO_BFM: 'cyan',
  SHIFT_RECORDED: 'green',
};

export default function StatusBadge({ status, label }) {
  const tone = STATUS_STYLE[status] || 'gray';
  return <span className={`status-badge ${tone}`}>{label || status || '—'}</span>;
}
