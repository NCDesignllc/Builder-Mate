import type { Measurement, Point } from './types';

export function pointToSegmentDistance(p: Point, a: Point, b: Point) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;
  const abLen2 = abx * abx + aby * aby;
  const t = abLen2 === 0 ? 0 : Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLen2));
  const proj = { x: a.x + t * abx, y: a.y + t * aby };
  const dx = p.x - proj.x;
  const dy = p.y - proj.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Very small hit test (world space):
 * - length: distance to segment
 * - area: distance to nearest edge
 */
export function hitTestMeasurementWorld(measurements: Measurement[], world: Point, thresholdPx: number) {
  // thresholdPx is in WORLD SPACE for this helper's caller (you can convert if needed)
  for (let i = measurements.length - 1; i >= 0; i--) {
    const m = measurements[i];
    if (m.kind === 'length' && m.points.length >= 2) {
      const d = pointToSegmentDistance(world, m.points[0], m.points[1]);
      if (d <= thresholdPx) return m.id;
    }
    if (m.kind === 'area' && m.points.length >= 3) {
      for (let j = 0; j < m.points.length; j++) {
        const a = m.points[j];
        const b = m.points[(j + 1) % m.points.length];
        const d = pointToSegmentDistance(world, a, b);
        if (d <= thresholdPx) return m.id;
      }
    }
  }
  return null as string | null;
}
