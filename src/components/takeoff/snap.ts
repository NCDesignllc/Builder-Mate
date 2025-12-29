import type { Point, Measurement, SnapResult, SnapMode } from './types';
import { dist } from './geometry';

/**
 * Constrain a point to 0/45/90° relative to an origin (useful for SHIFT snapping).
 */
export function snapAngle(origin: Point, target: Point, step45: boolean = false): Point {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;

  if (dx === 0 && dy === 0) return target;

  const angle = Math.atan2(dy, dx);
  const step = step45 ? Math.PI / 4 : Math.PI / 2; // 45° or 90°
  const snapped = Math.round(angle / step) * step;

  const len = Math.hypot(dx, dy);
  return { x: origin.x + Math.cos(snapped) * len, y: origin.y + Math.sin(snapped) * len };
}

export function near(a: Point, b: Point, thresholdPx: number): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy) <= thresholdPx;
}

/**
 * Find the closest endpoint from all measurements
 */
export function findClosestEndpoint(
  point: Point,
  measurements: Measurement[],
  threshold: number
): SnapResult | null {
  let closest: Point | null = null;
  let minDist = threshold;

  for (const m of measurements) {
    if (m.kind === 'count') {
      const d = dist(point, m.point);
      if (d < minDist) {
        minDist = d;
        closest = m.point;
      }
    } else {
      // linear or area
      for (const p of m.points) {
        const d = dist(point, p);
        if (d < minDist) {
          minDist = d;
          closest = p;
        }
      }
    }
  }

  if (!closest) return null;
  return { point: closest, mode: 'endpoint', distance: minDist };
}

/**
 * Find intersection point between two line segments
 */
function segmentIntersection(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): Point | null {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return null; // parallel

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1),
    };
  }
  return null;
}

/**
 * Find the closest intersection point from all measurement segments
 */
export function findClosestIntersection(
  point: Point,
  measurements: Measurement[],
  threshold: number
): SnapResult | null {
  let closest: Point | null = null;
  let minDist = threshold;

  // Collect all segments
  const segments: [Point, Point][] = [];
  for (const m of measurements) {
    if (m.kind === 'linear' && m.points.length >= 2) {
      for (let i = 0; i < m.points.length - 1; i++) {
        segments.push([m.points[i], m.points[i + 1]]);
      }
    } else if (m.kind === 'area' && m.points.length >= 3) {
      for (let i = 0; i < m.points.length; i++) {
        const p1 = m.points[i];
        const p2 = m.points[(i + 1) % m.points.length];
        segments.push([p1, p2]);
      }
    }
  }

  // Check all segment pairs for intersections
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const [s1p1, s1p2] = segments[i];
      const [s2p1, s2p2] = segments[j];
      const intersection = segmentIntersection(s1p1, s1p2, s2p1, s2p2);
      
      if (intersection) {
        const d = dist(point, intersection);
        if (d < minDist) {
          minDist = d;
          closest = intersection;
        }
      }
    }
  }

  if (!closest) return null;
  return { point: closest, mode: 'intersection', distance: minDist };
}

/**
 * Smart snap: tries endpoint first, then intersection
 */
export function smartSnap(
  point: Point,
  measurements: Measurement[],
  threshold: number,
  enableAngleSnap: boolean = false,
  angleSnapOrigin?: Point
): SnapResult | null {
  // If angle snap is requested and we have an origin
  if (enableAngleSnap && angleSnapOrigin) {
    const snapped = snapAngle(angleSnapOrigin, point, false);
    return { point: snapped, mode: 'angle', distance: 0 };
  }

  // Try endpoint snap first
  const endpointSnap = findClosestEndpoint(point, measurements, threshold);
  if (endpointSnap) return endpointSnap;

  // Try intersection snap
  const intersectionSnap = findClosestIntersection(point, measurements, threshold);
  if (intersectionSnap) return intersectionSnap;

  return null;
}
