import type { Measurement, TakeoffScale } from './types';
import { computeMeasurement, computeTotals, formatNumber } from './measurementMath';

function escapeCsv(value: string) {
  const needs = /[",\n]/.test(value);
  const v = value.replace(/"/g, '""');
  return needs ? `"${v}"` : v;
}

export function measurementsToCsv(measurements: Measurement[], scale: TakeoffScale | null, includePageBreaks = true) {
  const header = ['Page', 'Type', 'Label', 'Value', 'Unit', 'Layer', 'Created At'].join(',');
  
  const rows = measurements.map((m) => {
    const c = computeMeasurement(m, scale);
    let value = '';
    
    if (c.kind === 'linear' && c.value !== null) {
      value = formatNumber(c.value, 2);
    } else if (c.kind === 'area' && c.value !== null) {
      value = formatNumber(c.value, 2);
    } else if (c.kind === 'count') {
      value = String(c.count);
    }
    
    const unitLabel = c.kind === 'count' ? 'count' : 
                      c.kind === 'linear' ? c.unitLabel :
                      c.unitLabel;
    
    return [
      String(m.pageIndex + 1),
      escapeCsv(m.kind),
      escapeCsv(m.label || ''),
      escapeCsv(value),
      escapeCsv(unitLabel),
      escapeCsv(m.layerId || ''),
      escapeCsv(new Date(m.createdAt).toISOString()),
    ].join(',');
  });

  // Add totals
  const totals = computeTotals(measurements, scale);
  const totalRows = [
    '',
    '--- TOTALS ---',
    '',
    '',
    '',
    '',
    '',
    '',
  ];
  
  if (totals.totalLength !== null) {
    totalRows.push([
      '',
      'Total Linear',
      '',
      formatNumber(totals.totalLength, 2),
      scale?.unit || '',
      '',
      '',
    ].join(','));
  }
  
  if (totals.totalArea !== null) {
    totalRows.push([
      '',
      'Total Area',
      '',
      formatNumber(totals.totalArea, 2),
      scale ? `${scale.unit}²` : '',
      '',
      '',
    ].join(','));
  }
  
  if (totals.totalCount > 0) {
    totalRows.push([
      '',
      'Total Count',
      '',
      String(totals.totalCount),
      'count',
      '',
      '',
    ].join(','));
  }

  return [header, ...rows, ...totalRows].join('\n');
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

export function exportMeasurements(
  measurements: Measurement[], 
  scale: TakeoffScale | null, 
  filename = 'takeoff-measurements.csv'
) {
  const csv = measurementsToCsv(measurements, scale);
  downloadText(filename, csv, 'text/csv');
}
