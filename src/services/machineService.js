import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase.js';
import { setLocalDoc, subscribeLocal, updateLocalDoc } from './localStore.js';
import { updateOrder } from './orderService.js';

const MACHINE_JOBS = 'machineJobs';

export async function injectRecipeToBFM(order, recipe) {
  const now = Date.now();
  const machineJob = {
    id: order.id,
    orderId: order.id,
    order,
    recipe,
    machineName: 'BFM-01 / Windows HMI',
    cleanroomZone: 'Layout A · Cellule Balloon Forming',
    status: 'READY_FOR_OPERATOR',
    statusLabel: 'Injecté vers BFM — prêt opérateur',
    injectedAtMs: now,
    updatedAtMs: now,
    machineCounter: 0,
  };

  if (isFirebaseConfigured) {
    await setDoc(doc(db, MACHINE_JOBS, order.id), {
      ...machineJob,
      injectedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    setLocalDoc(MACHINE_JOBS, order.id, machineJob);
  }

  await updateOrder(order.id, {
    status: 'INJECTED_TO_BFM',
    statusLabel: 'Paramètres injectés vers BFM',
    approvedRecipe: recipe,
    injection: {
      machineName: machineJob.machineName,
      cleanroomZone: machineJob.cleanroomZone,
      injectedAtMs: now,
    },
  });

  return machineJob;
}

export function subscribeMachineJobs(callback) {
  if (isFirebaseConfigured) {
    const q = query(collection(db, MACHINE_JOBS), orderBy('injectedAtMs', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
  }

  return subscribeLocal(MACHINE_JOBS, (items) => {
    callback([...items].sort((a, b) => (b.injectedAtMs ?? 0) - (a.injectedAtMs ?? 0)));
  });
}

export async function updateMachineJob(jobId, patch) {
  const payload = { ...patch, updatedAtMs: Date.now() };
  if (isFirebaseConfigured) {
    await updateDoc(doc(db, MACHINE_JOBS, jobId), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
  } else {
    updateLocalDoc(MACHINE_JOBS, jobId, payload);
  }
}
