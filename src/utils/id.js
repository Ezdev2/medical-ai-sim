export function generateOrderId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `QC-${y}${m}${d}-${suffix}`;
}

export function hashString(input = '') {
  return [...String(input)].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
}
