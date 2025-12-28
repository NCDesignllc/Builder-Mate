import type { Measurement, TakeoffScale } from './types';
import { computeMeasurement } from './measurementMath';

function escapeCsv(value: string) {
  const needs = /[",\n]/.test(value);
  const v = value.replace(/"/g, '""');
  return needs ? `"${v}"` : v;
}

export function measurementsToCsv(measurements: Measurement[], scale: TakeoffScale | null) {
  const header = ['id', 'kind', 'value', 'unit', 'createdAt'].join(',');
  const rows = measurements.map((m) => {
    const c = computeMeasurement(m, scale);
    const value = c.value == null ? '' : String(c.value);
    const unit = c.unitLabel;
    return [
      escapeCsv(m.id),
      escapeCsv(m.kind),
      escapeCsv(value),
      escapeCsv(unit),
      escapeCsv(new Date(m.createdAt).toISOString()),
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

export function downloadText(filename: string, text: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}
