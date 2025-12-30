import { useCallback, useMemo, useRef, useState } from 'react';
import { clamp } from './geometry';
import type { Point } from './types';

// Minimum movement (in pixels) required before a click becomes a drag
const PAN_THRESHOLD = 3;

export type PanZoom = {
  zoom: number;
  pan: Point;
  setZoom: (z: number) => void;
  setPan: (p: Point) => void;
  reset: () => void;
  // helpers
  screenToWorld: (p: Point) => Point;
  worldToScreen: (p: Point) => Point;
  bind: {
    onWheel: (e: React.WheelEvent) => void;
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
  };
};

type DragState = {
  isDragging: boolean;
  isActuallyDragging: boolean;  // True after movement exceeds threshold
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
};

/**
 * Simple pan/zoom for a viewport with CSS transforms.
 * World coordinates are "plan pixels". Screen coordinates are viewport pixels.
 * 
 * Uses pointer events with capture for smooth dragging that continues
 * even when the cursor leaves the viewport. Includes a movement threshold
 * to prevent accidental pans from simple clicks.
 */
export function usePanZoom() : PanZoom {
  const [zoom, setZoomState] = useState(1);
  const [pan, setPanState] = useState<Point>({ x: 0, y: 0 });
  // Cursor state managed via React to avoid direct DOM manipulation conflicts
  const [cursor, setCursor] = useState<'grab' | 'grabbing' | undefined>(undefined);
  
  // Use ref for drag state to avoid stale closures
  const dragRef = useRef<DragState>({
    isDragging: false,
    isActuallyDragging: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
  });
  
  // Ref for the element to enable pointer capture
  const elementRef = useRef<HTMLElement | null>(null);

  const setZoom = useCallback((z: number) => {
    setZoomState(clamp(z, 0.2, 6));
  }, []);

  const setPan = useCallback((p: Point) => {
    setPanState({ x: p.x, y: p.y });
  }, []);

  const reset = useCallback(() => {
    setZoomState(1);
    setPanState({ x: 0, y: 0 });
    dragRef.current = {
      isDragging: false,
      isActuallyDragging: false,
      pointerId: -1,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
    };
  }, []);

  const screenToWorld = useCallback((p: Point) => {
    // world = (screen - pan) / zoom
    return { x: (p.x - pan.x) / zoom, y: (p.y - pan.y) / zoom };
  }, [pan.x, pan.y, zoom]);

  const worldToScreen = useCallback((p: Point) => {
    // screen = world * zoom + pan
    return { x: p.x * zoom + pan.x, y: p.y * zoom + pan.y };
  }, [pan.x, pan.y, zoom]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    // zoom toward cursor
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.08 : 0.92;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cursor = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldBefore = screenToWorld(cursor);

    const nextZoom = clamp(zoom * factor, 0.2, 6);
    setZoomState(nextZoom);

    // adjust pan so world point under cursor stays under cursor
    const screenAfter = { x: worldBefore.x * nextZoom + pan.x, y: worldBefore.y * nextZoom + pan.y };
    const panDelta = { x: cursor.x - screenAfter.x, y: cursor.y - screenAfter.y };
    setPanState({ x: pan.x + panDelta.x, y: pan.y + panDelta.y });
  }, [pan.x, pan.y, screenToWorld, zoom]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    
    const el = e.currentTarget as HTMLElement;
    elementRef.current = el;
    
    // Capture the pointer for smooth drag that continues outside the element
    el.setPointerCapture(e.pointerId);
    
    dragRef.current = {
      isDragging: true,
      isActuallyDragging: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
    };
    
    // Set grab cursor via React state
    setCursor('grab');
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const state = dragRef.current;
    if (!state.isDragging || e.pointerId !== state.pointerId) return;
    
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    
    // Check if we've exceeded the threshold to start actual dragging
    if (!state.isActuallyDragging) {
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < PAN_THRESHOLD) {
        return; // Not yet dragging - simple click
      }
      // Threshold exceeded - start actual drag
      state.isActuallyDragging = true;
      setCursor('grabbing');
    }
    
    // Prevent default to avoid text selection
    e.preventDefault();
    
    // Calculate movement delta from last position
    const moveDx = e.clientX - state.lastX;
    const moveDy = e.clientY - state.lastY;
    state.lastX = e.clientX;
    state.lastY = e.clientY;
    
    setPanState((p) => ({ x: p.x + moveDx, y: p.y + moveDy }));
  }, []);

  const endDrag = useCallback((e: React.PointerEvent) => {
    const state = dragRef.current;
    if (!state.isDragging || e.pointerId !== state.pointerId) return;
    
    const el = elementRef.current;
    if (el) {
      // Release pointer capture
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer may have already been released
      }
    }
    
    // Reset cursor via React state
    setCursor(undefined);
    
    dragRef.current = {
      isDragging: false,
      isActuallyDragging: false,
      pointerId: -1,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
    };
  }, []);

  const bind = useMemo(() => ({
    onWheel,
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    // CSS styles to apply for proper pan behavior
    style: {
      touchAction: 'none',      // Prevent browser gesture handling
      userSelect: 'none',       // Prevent text selection during drag
      cursor,                   // Centralized cursor management via React state
    } as React.CSSProperties,
  }), [cursor, endDrag, onPointerDown, onPointerMove, onWheel]);

  return { zoom, pan, setZoom, setPan, reset, screenToWorld, worldToScreen, bind };
}
