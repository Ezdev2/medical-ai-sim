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
import { generateOrderId } from '../utils/id.js';

const ORDERS = 'orders';

function stripUndefined(value) {
  return Object.fromEntries(Object.entries(value).filter(([, val]) => val !== undefined));
}

export async function createOrder(formData) {
  const id = generateOrderId();
  const createdAtMs = Date.now();
  const order = stripUndefined({
    id,
    ...formData,
    status: 'ORDER_RECEIVED',
    statusLabel: 'Commande reçue',
    createdAtMs,
    updatedAtMs: createdAtMs,
    recipe: null,
    approvedRecipe: null,
    validation: null,
    injection: null,
  });

  if (isFirebaseConfigured) {
    await setDoc(doc(db, ORDERS, id), {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    setLocalDoc(ORDERS, id, order);
  }

  return order;
}

export function subscribeOrders(callback) {
  if (isFirebaseConfigured) {
    const q = query(collection(db, ORDERS), orderBy('createdAtMs', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
  }

  return subscribeLocal(ORDERS, (items) => {
    callback([...items].sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0)));
  });
}

export async function updateOrder(orderId, patch) {
  const payload = stripUndefined({
    ...patch,
    updatedAtMs: Date.now(),
  });

  if (isFirebaseConfigured) {
    await updateDoc(doc(db, ORDERS, orderId), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
  } else {
    updateLocalDoc(ORDERS, orderId, payload);
  }
}
