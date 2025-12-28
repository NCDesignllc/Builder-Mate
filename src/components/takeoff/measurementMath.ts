import type { Measurement, Point, TakeoffScale } from './types';
import { dist, polygonArea } from './geometry';

export type MeasurementComputed =
  | { kind: 'length'; px: number; value: number | null; unitLabel: string }
  | { kind: 'area'; px2: number; value: number | null; unitLabel: string };

export function computeMeasurement(m: Measurement, scale: TakeoffScale | null): MeasurementComputed {
  if (m.kind === 'length') {
    const px = m.points.length >= 2 ? dist(m.points[0], m.points[1]) : 0;
    const value = scale ? px / scale.pxPerUnit : null;
    const unitLabel = scale ? scale.unit : 'px';
    return { kind: 'length', px, value, unitLabel };
  }
  // area
  const px2 = m.points.length >= 3 ? polygonArea(m.points) : 0;
  const value = scale ? px2 / (scale.pxPerUnit * scale.pxPerUnit) : null;
  const unitLabel = scale ? `${scale.unit}²` : 'px²';
  return { kind: 'area', px2, value, unitLabel };
}

export function computeTotals(measurements: Measurement[], scale: TakeoffScale | null) {
  let totalLengthPx = 0;
  let totalAreaPx2 = 0;

  for (const m of measurements) {
    if (m.kind === 'length' && m.points.length >= 2) totalLengthPx += dist(m.points[0], m.points[1]);
    if (m.kind === 'area' && m.points.length >= 3) totalAreaPx2 += polygonArea(m.points);
  }

  if (!scale) return { totalLength: null as number | null, totalArea: null as number | null };
  return {
    totalLength: totalLengthPx / scale.pxPerUnit,
    totalArea: totalAreaPx2 / (scale.pxPerUnit * scale.pxPerUnit),
  };
}

export function formatNumber(n: number, decimals = 2) {
  return Number.isFinite(n) ? n.toFixed(decimals) : '—';
}
