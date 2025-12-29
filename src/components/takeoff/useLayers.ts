import { useState, useCallback } from 'react';
import type { Layer, LayerType } from './types';
import { uuid } from './geometry';

// Default layer colors
const LAYER_COLORS: Record<LayerType, string> = {
  electrical: '#FFD700', // Gold
  plumbing: '#4169E1',   // Royal Blue
  hvac: '#32CD32',       // Lime Green
  framing: '#8B4513',    // Saddle Brown
  custom: '#9370DB',     // Medium Purple
};

// Default layers
const DEFAULT_LAYERS: Layer[] = [
  { id: 'layer-electrical', name: 'Electrical', type: 'electrical', color: LAYER_COLORS.electrical, visible: true, locked: false },
  { id: 'layer-plumbing', name: 'Plumbing', type: 'plumbing', color: LAYER_COLORS.plumbing, visible: true, locked: false },
  { id: 'layer-hvac', name: 'HVAC', type: 'hvac', color: LAYER_COLORS.hvac, visible: true, locked: false },
  { id: 'layer-framing', name: 'Framing', type: 'framing', color: LAYER_COLORS.framing, visible: true, locked: false },
];

export function useLayers() {
  const [layers, setLayers] = useState<Layer[]>(DEFAULT_LAYERS);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(DEFAULT_LAYERS[0].id);

  const addLayer = useCallback((name: string, type: LayerType = 'custom') => {
    const newLayer: Layer = {
      id: uuid('layer'),
      name,
      type,
      color: LAYER_COLORS[type],
      visible: true,
      locked: false,
    };
    setLayers((prev) => [...prev, newLayer]);
    return newLayer.id;
  }, []);

  const updateLayer = useCallback((id: string, patch: Partial<Omit<Layer, 'id'>>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const deleteLayer = useCallback((id: string) => {
    setLayers((prev) => {
      const newLayers = prev.filter((l) => l.id !== id);
      // If deleting active layer, select first layer
      if (activeLayerId === id) {
        setActiveLayerId(newLayers[0]?.id ?? null);
      }
      return newLayers;
    });
  }, [activeLayerId]);

  const toggleVisibility = useCallback((id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  }, []);

  const toggleLock = useCallback((id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)));
  }, []);

  const getLayer = useCallback((id: string | undefined) => {
    if (!id) return null;
    return layers.find((l) => l.id === id) ?? null;
  }, [layers]);

  const activeLayer = activeLayerId ? getLayer(activeLayerId) : null;

  return {
    layers,
    activeLayerId,
    activeLayer,
    setActiveLayerId,
    addLayer,
    updateLayer,
    deleteLayer,
    toggleVisibility,
    toggleLock,
    getLayer,
  };
}
