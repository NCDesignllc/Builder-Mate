import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clamp } from './geometry';
import type { Point } from './types';

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
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
  };
};

/**
 * Simple pan/zoom for a viewport with CSS transforms.
 * World coordinates are "plan pixels". Screen coordinates are viewport pixels.
 */
export function usePanZoom() : PanZoom {
  const [zoom, setZoomState] = useState(1);
  const [pan, setPanState] = useState<Point>({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const lastRef = useRef<Point | null>(null);

  const setZoom = useCallback((z: number) => {
    setZoomState(clamp(z, 0.2, 6));
  }, []);

  const setPan = useCallback((p: Point) => {
    setPanState({ x: p.x, y: p.y });
  }, []);

  const reset = useCallback(() => {
    setZoomState(1);
    setPanState({ x: 0, y: 0 });
    draggingRef.current = false;
    lastRef.current = null;
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

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    draggingRef.current = true;
    lastRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggingRef.current || !lastRef.current) return;
    const last = lastRef.current;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    lastRef.current = { x: e.clientX, y: e.clientY };
    setPanState((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const endDrag = useCallback(() => {
    draggingRef.current = false;
    lastRef.current = null;
  }, []);

  // prevent the page from scrolling when over the viewport
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      // noop; we handle wheel on element. This avoids accidental page scroll in some browsers if passive listeners interfere.
    };
    window.addEventListener('wheel', handler, { passive: true });
    return () => window.removeEventListener('wheel', handler);
  }, []);

  const bind = useMemo(() => ({
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp: () => endDrag(),
    onMouseLeave: () => endDrag(),
  }), [endDrag, onMouseDown, onMouseMove, onWheel]);

  return { zoom, pan, setZoom, setPan, reset, screenToWorld, worldToScreen, bind };
}
