const STORAGE_PREFIX = 'quadracure-demo';
const listeners = new Map();

function key(collectionName) {
  return `${STORAGE_PREFIX}:${collectionName}`;
}

function readCollection(collectionName) {
  try {
    const raw = localStorage.getItem(key(collectionName));
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('localStore read failed', error);
    return [];
  }
}

function writeCollection(collectionName, items) {
  localStorage.setItem(key(collectionName), JSON.stringify(items));
  notify(collectionName);
}

function notify(collectionName) {
  const callbacks = listeners.get(collectionName) ?? new Set();
  const items = readCollection(collectionName);
  callbacks.forEach((callback) => callback(items));
}

export function subscribeLocal(collectionName, callback) {
  const callbacks = listeners.get(collectionName) ?? new Set();
  callbacks.add(callback);
  listeners.set(collectionName, callbacks);
  callback(readCollection(collectionName));

  const storageHandler = (event) => {
    if (event.key === key(collectionName)) notify(collectionName);
  };
  window.addEventListener('storage', storageHandler);

  return () => {
    callbacks.delete(callback);
    window.removeEventListener('storage', storageHandler);
  };
}

export function setLocalDoc(collectionName, id, payload) {
  const items = readCollection(collectionName);
  const without = items.filter((item) => item.id !== id);
  writeCollection(collectionName, [...without, { ...payload, id }]);
}

export function updateLocalDoc(collectionName, id, patch) {
  const items = readCollection(collectionName);
  const next = items.map((item) => (item.id === id ? { ...item, ...patch, id } : item));
  writeCollection(collectionName, next);
}

export function addLocalDoc(collectionName, payload) {
  const id = payload.id ?? crypto.randomUUID();
  setLocalDoc(collectionName, id, { ...payload, id });
  return id;
}
