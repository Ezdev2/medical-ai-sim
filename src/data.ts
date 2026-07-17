export type Role = 'client' | 'engineer' | 'operator';

export interface BalloonOrder {
  id: string;
  createdAt: number;
  customer: string;
  orderRef: string;
  diameter: number; // mm
  length: number; // mm
  material: string;
  quantity: number;
  status: 'new' | 'approved' | 'in-production' | 'done';
  params?: ParameterSheet;
}

export interface ParameterSheet {
  parisonCutLength: number; // mm
  heatingTemp: number; // °C
  formingPressure: number; // bar
  cycleTime: number; // sec
  moldId: string;
  coolingTime: number; // sec
}

export interface WorkstationState {
  stationId: string;
  operatorName: string | null;
  badgeInAt: number | null;
}

export const MATERIALS = ['Pebax 3533', 'Pebax 4033', 'Pebax 5533', 'Pebax 6333', 'Pebax 7233'];
export const MOLD_IDS = ['M-04A', 'M-04B', 'M-08A', 'M-12A', 'M-12B'];

export const STATIONS: { id: string; name: string; x: number; y: number }[] = [
  { id: 'WS-01', name: 'Forming Line A', x: 1, y: 0 },
  { id: 'WS-02', name: 'Forming Line B', x: 2, y: 0 },
  { id: 'WS-03', name: 'Inspection', x: 3, y: 0 },
  { id: 'WS-04', name: 'Packaging', x: 1, y: 1 },
  { id: 'WS-05', name: 'QC Lab', x: 2, y: 1 },
  { id: 'WS-06', name: 'Materials', x: 3, y: 1 },
];

export const OPERATORS = ['L. Haddad', 'M. Bensaïd', 'S. Cherif', 'Y. Mansour'];

export function suggestParams(order: BalloonOrder): ParameterSheet {
  const d = order.diameter;
  const l = order.length;
  return {
    parisonCutLength: Math.round(l * 2.4 + 18),
    heatingTemp: Math.min(250, Math.round(110 + d * 3.5)),
    formingPressure: Math.round(Math.min(50, 8 + d * 0.9) * 10) / 10,
    cycleTime: Math.round(60 + l * 0.4),
    moldId: d <= 6 ? 'M-04A' : d <= 10 ? 'M-08A' : 'M-12A',
    coolingTime: Math.round(30 + l * 0.2),
  };
}

export function fmtTime(ts: number | null): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
