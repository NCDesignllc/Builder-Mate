import { useEffect, useMemo, useState } from 'react';
import type { Measurement, TakeoffScale, TakeoffScaleByPage } from './types';

type PersistPayload = {
  // OLD: single scale
  scale?: TakeoffScale | null;
  // NEW: scales per page
  scalesByPage?: TakeoffScaleByPage;
  measurements: Measurement[];
  updatedAt: number;
};

function safeJsonParse<T>(s: string | null): T | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

// Local storage key used across the app.
function keyFor(projectId?: string, planId?: string) {
  if (projectId && planId) return `buildermate.takeoff.${projectId}.${planId}`;
  if (projectId) return `buildermate.takeoff.${projectId}`;
  return `buildermate.takeoff.demo`;
}

/**
 * Persist takeoff state.
 * NOW supports scale per page:
 * - `scale` is derived from `scalesByPage[activePage]`
 * - `setScale` updates that page only
 */
export function useTakeoffPersist(projectId?: string, planId?: string, activePage: number = 0) {
  const storageKey = useMemo(() => keyFor(projectId, planId), [projectId, planId]);

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [scalesByPage, setScalesByPage] = useState<TakeoffScaleByPage>({});

  // derived scale for current page
  const scale = scalesByPage[activePage] ?? null;

  // Load once
  useEffect(() => {
    const saved = safeJsonParse<PersistPayload>(localStorage.getItem(storageKey));
    if (!saved) return;

    // Measurements
    setMeasurements(Array.isArray(saved.measurements) ? saved.measurements : []);

    // Scales per page
    if (saved.scalesByPage && typeof saved.scalesByPage === 'object') {
      setScalesByPage(saved.scalesByPage);
      return;
    }

    // Back-compat: if old single scale exists, treat it as page 0 scale.
    const oldScale = saved.scale ?? null;
    if (oldScale) setScalesByPage({ 0: oldScale });
  }, [storageKey]);

  // Save on change
  useEffect(() => {
    const payload: PersistPayload = {
      scalesByPage,
      measurements,
      updatedAt: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [storageKey, scalesByPage, measurements]);

  function clear() {
    setMeasurements([]);
    setScalesByPage({});
    localStorage.removeItem(storageKey);
  }

  function setScale(next: TakeoffScale | null) {
    setScalesByPage((prev) => {
      if (next === null) {
        const copy = { ...prev };
        delete copy[activePage];
        return copy;
      }
      return { ...prev, [activePage]: next };
    });
  }

  // Helpers to keep measurements aligned to page
  function addMeasurement(m: Measurement) {
    const pageIndex = m.pageIndex ?? activePage;
    setMeasurements((prev) => [...prev, { ...m, pageIndex }]);
  }

  function updateMeasurement(id: string, patch: Partial<Measurement>) {
    setMeasurements((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function deleteMeasurement(id: string) {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  }

  return {
    storageKey,
    measurements,
    setMeasurements,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    scale,
    setScale,
    // expose full map for UI/debug if needed
    scalesByPage,
    setScalesByPage,
    clear,
  };
}
