import { useEffect, useState, useCallback } from 'react';
import type { BalloonOrder, Role, WorkstationState } from './data';
import { STATIONS, OPERATORS, uid } from './data';

const ORDERS_KEY = 'qc.orders.v1';
const STATIONS_KEY = 'qc.stations.v1';
const ROLE_KEY = 'qc.role.v1';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, val: T) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}

function seedStations(): WorkstationState[] {
  return STATIONS.map((s) => ({ stationId: s.id, operatorName: null, badgeInAt: null }));
}

export function useStore() {
  const [orders, setOrders] = useState<BalloonOrder[]>(() => load(ORDERS_KEY, []));
  const [stations, setStations] = useState<WorkstationState[]>(() => load(STATIONS_KEY, seedStations()));
  const [role, setRole] = useState<Role>(() => load<Role>(ROLE_KEY, 'client'));

  useEffect(() => save(ORDERS_KEY, orders), [orders]);
  useEffect(() => save(STATIONS_KEY, stations), [stations]);
  useEffect(() => save(ROLE_KEY, role), [role]);

  const addOrder = useCallback((o: Omit<BalloonOrder, 'id' | 'createdAt' | 'status'>) => {
    setOrders((prev) => [
      { ...o, id: uid(), createdAt: Date.now(), status: 'new' },
      ...prev,
    ]);
  }, []);

  const approveOrder = useCallback((id: string, params: BalloonOrder['params']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, params, status: 'approved' as const } : o))
    );
  }, []);

  const sendToOperator = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'in-production' as const } : o))
    );
  }, []);

  const completeOrder = useCallback((id: string) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'done' as const } : o)));
  }, []);

  const badgeIn = useCallback((stationId: string, operatorName: string) => {
    setStations((prev) =>
      prev.map((s) =>
        s.stationId === stationId ? { ...s, operatorName, badgeInAt: Date.now() } : s
      )
    );
  }, []);

  const badgeOut = useCallback((stationId: string) => {
    setStations((prev) =>
      prev.map((s) =>
        s.stationId === stationId ? { ...s, operatorName: null, badgeInAt: null } : s
      )
    );
  }, []);

  const moveOperator = useCallback((fromId: string, toId: string) => {
    setStations((prev) => {
      const from = prev.find((s) => s.stationId === fromId);
      if (!from || !from.operatorName) return prev;
      return prev.map((s) => {
        if (s.stationId === fromId) return { ...s, operatorName: null, badgeInAt: null };
        if (s.stationId === toId) return { ...s, operatorName: from.operatorName, badgeInAt: Date.now() };
        return s;
      });
    });
  }, []);

  const resetAll = useCallback(() => {
    setOrders([]);
    setStations(seedStations());
  }, []);

  return {
    orders,
    stations,
    role,
    setRole,
    addOrder,
    approveOrder,
    sendToOperator,
    completeOrder,
    badgeIn,
    badgeOut,
    moveOperator,
    resetAll,
  };
}

export type Store = ReturnType<typeof useStore>;
export { OPERATORS };
