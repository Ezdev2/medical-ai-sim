import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase.js';
import { addLocalDoc } from './localStore.js';
import { hashString } from '../utils/id.js';
import { updateMachineJob } from './machineService.js';
import { updateOrder } from './orderService.js';

const SHIFT_RECORDS = 'shiftRecords';
const LAYOUTS = [
  'Cleanroom Zone A · BFM-01 · Parison Prep gauche',
  'Cleanroom Zone A · BFM-02 · Parison Prep droite',
  'Cleanroom Zone B · Inspection immédiate',
  'Cleanroom Zone B · Balloon Forming support',
];

export function assignLayout(badgeId, operatorName) {
  const seed = hashString(`${badgeId}-${operatorName}`);
  return LAYOUTS[seed % LAYOUTS.length];
}

export function estimateMachineOutput(job) {
  const quantity = Number(job?.order?.quantity ?? 120);
  const cycle = Number(job?.recipe?.parameters?.estimatedCycleTimeSec ?? 55);
  const theoreticalPerHour = Math.max(1, Math.floor(3600 / cycle));
  // Demo: assume partial shift output, bounded by order quantity.
  return Math.min(quantity, Math.max(24, theoreticalPerHour * 2));
}

export async function saveShiftRecord({ operator, job, totalFormed, rejectedCount, notes }) {
  const now = Date.now();
  const accepted = Math.max(0, Number(totalFormed) - Number(rejectedCount));
  const yieldPercent = Number(totalFormed) > 0 ? (accepted / Number(totalFormed)) * 100 : 0;
  const id = `SHIFT-${now}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const record = {
    id,
    orderId: job.orderId,
    machineJobId: job.id,
    machineName: job.machineName,
    operator,
    layoutAssignment: operator.layoutAssignment,
    totalFormed: Number(totalFormed),
    rejectedCount: Number(rejectedCount),
    acceptedCount: accepted,
    yieldPercent: Math.round(yieldPercent * 10) / 10,
    notes: notes || '',
    createdAtMs: now,
  };

  if (isFirebaseConfigured) {
    await setDoc(doc(collection(db, SHIFT_RECORDS), id), {
      ...record,
      createdAt: serverTimestamp(),
    });
  } else {
    addLocalDoc(SHIFT_RECORDS, record);
  }

  await updateMachineJob(job.id, {
    status: 'SHIFT_RECORDED',
    statusLabel: 'Shift enregistré',
    machineCounter: Number(totalFormed),
    lastRejectedCount: Number(rejectedCount),
    lastYieldPercent: record.yieldPercent,
  });

  await updateOrder(job.orderId, {
    status: 'SHIFT_RECORDED',
    statusLabel: `Production enregistrée — yield ${record.yieldPercent}%`,
    lastShiftRecord: record,
  });

  return record;
}
