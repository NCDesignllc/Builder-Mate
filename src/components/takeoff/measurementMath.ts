import type { Measurement, Point, TakeoffScale, LinearMeasurement, AreaMeasurement } from './types';
import { dist, polygonArea, polylineLength } from './geometry';

export type MeasurementComputed =
  | { kind: 'linear'; px: number; value: number | null; unitLabel: string }
  | { kind: 'area'; px2: number; value: number | null; unitLabel: string }
  | { kind: 'count'; count: number };

export function computeMeasurement(m: Measurement, scale: TakeoffScale | null): MeasurementComputed {
  if (m.kind === 'linear') {
    const px = m.points.length >= 2 ? polylineLength(m.points) : 0;
    const value = scale ? px / scale.pxPerUnit : null;
    const unitLabel = scale ? scale.unit : 'px';
    return { kind: 'linear', px, value, unitLabel };
  }
  if (m.kind === 'area') {
    const px2 = m.points.length >= 3 ? polygonArea(m.points) : 0;
    const value = scale ? px2 / (scale.pxPerUnit * scale.pxPerUnit) : null;
    const unitLabel = scale ? `${scale.unit}²` : 'px²';
    return { kind: 'area', px2, value, unitLabel };
  }
  // count
  return { kind: 'count', count: m.count };
}

export function computeTotals(measurements: Measurement[], scale: TakeoffScale | null) {
  let totalLengthPx = 0;
  let totalAreaPx2 = 0;
  let totalCount = 0;

  for (const m of measurements) {
    if (m.kind === 'linear' && m.points.length >= 2) {
      totalLengthPx += polylineLength(m.points);
    }
    if (m.kind === 'area' && m.points.length >= 3) {
      totalAreaPx2 += polygonArea(m.points);
    }
    if (m.kind === 'count') {
      totalCount += m.count;
    }
  }

  if (!scale) {
    return { 
      totalLength: null as number | null, 
      totalArea: null as number | null,
      totalCount 
    };
  }
  return {
    totalLength: totalLengthPx / scale.pxPerUnit,
    totalArea: totalAreaPx2 / (scale.pxPerUnit * scale.pxPerUnit),
    totalCount,
  };
}

export function formatNumber(n: number, decimals = 2) {
  return Number.isFinite(n) ? n.toFixed(decimals) : '—';
}
