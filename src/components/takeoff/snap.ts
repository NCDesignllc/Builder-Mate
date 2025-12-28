import type { Point } from './types';

/**
 * Constrain a point to 0/45/90° relative to an origin (useful for SHIFT snapping).
 */
export function snapAngle(origin: Point, target: Point): Point {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;

  if (dx === 0 && dy === 0) return target;

  const angle = Math.atan2(dy, dx);
  const step = Math.PI / 4; // 45°
  const snapped = Math.round(angle / step) * step;

  const len = Math.hypot(dx, dy);
  return { x: origin.x + Math.cos(snapped) * len, y: origin.y + Math.sin(snapped) * len };
}

export function near(a: Point, b: Point, thresholdPx: number): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy) <= thresholdPx;
}
