/**
 * Export service for PDF takeoff measurements
 * 
 * Provides functionality to export measurements in various formats:
 * - CSV (with all measurement data)
 * - Image snapshot (current canvas view)
 * - Annotated PDF (future: requires pdf-lib integration)
 */

import type { Measurement, ScaleModel, ExportFormat, ExportOptions } from '../types/measurements';
import { pixelsToFeet, getScaleDescription } from './scaleUtils';

/**
 * Export measurements to CSV format
 */
export function exportToCSV(
  measurements: Measurement[],
  scales: Record<number, ScaleModel>,
  options: ExportOptions = { format: 'csv' }
): Blob {
  const includeHidden = options.includeHidden ?? false;
  const includeLocked = options.includeLocked ?? true;
  
  // Filter measurements
  const filtered = measurements.filter(m => {
    if (!includeHidden && !m.visible) return false;
    if (!includeLocked && m.locked) return false;
    if (options.pageIndex !== undefined && m.pageIndex !== options.pageIndex) return false;
    return true;
  });

  // CSV header
  const header = [
    'ID',
    'Type',
    'Mode',
    'Page',
    'Label',
    'Scale',
    'Value',
    'Units',
    'Locked',
    'Visible',
    'Created',
    'Updated',
    'Geometry',
  ].join(',');

  // CSV rows
  const rows = filtered.map(m => {
    const scale = m.scaleId ? scales[m.pageIndex] : null;
    const scaleDesc = getScaleDescription(scale);
    
    let value = '';
    let units = '';
    
    // Calculate value based on measurement type
    if (m.type === 'linear') {
      value = m.lengthFt?.toFixed(2) || '0';
      units = 'ft';
    } else if (m.type === 'area') {
      value = m.areaSqFt?.toFixed(2) || '0';
      units = 'sq ft';
    } else if (m.type === 'count') {
      value = String(m.count || 0);
      units = 'count';
    } else if (m.type === 'wallArea') {
      value = m.areaSqFt?.toFixed(2) || '0';
      units = 'sq ft';
    } else if (m.type === 'slope') {
      value = m.slopePercent?.toFixed(1) || '0';
      units = '% (pitch: ' + (m.pitch || '0:12') + ')';
    } else if (m.type === 'volume') {
      value = m.volumeCuYd?.toFixed(2) || '0';
      units = 'cu yd';
    } else if (m.type === 'subtract') {
      value = m.resultAreaSqFt?.toFixed(2) || '0';
      units = 'sq ft';
    }
    
    const mode = 'mode' in m ? (m as any).mode : '';
    const geometry = JSON.stringify('points' in m ? (m as any).points : {});
    
    return [
      m.id,
      m.type,
      mode,
      m.pageIndex,
      `"${(m.label || '').replace(/"/g, '""')}"`, // Escape quotes
      scaleDesc,
      value,
      units,
      m.locked ? 'Yes' : 'No',
      m.visible ? 'Yes' : 'No',
      new Date(m.createdAt).toISOString(),
      new Date(m.updatedAt).toISOString(),
      `"${geometry.replace(/"/g, '""')}"`,
    ].join(',');
  });

  // Combine header and rows
  const csvContent = [header, ...rows].join('\n');
  
  // Create blob
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Export current canvas view to image
 */
export async function exportToImage(
  canvas: HTMLCanvasElement,
  options: ExportOptions = { format: 'image' }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create image blob'));
      }
    }, 'image/png');
  });
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  projectId: string | undefined,
  format: string,
  includeTimestamp: boolean = true
): string {
  const timestamp = includeTimestamp ? `-${Date.now()}` : '';
  const project = projectId ? `${projectId}-` : '';
  return `takeoff-${project}${timestamp}.${format}`;
}

/**
 * Main export function - handles all export formats
 */
export async function exportMeasurements(
  format: ExportFormat,
  measurements: Measurement[],
  scales: Record<number, ScaleModel>,
  options: ExportOptions,
  canvas?: HTMLCanvasElement,
  projectId?: string
): Promise<void> {
  const timestamp = options.timestamp ?? true;
  
  switch (format) {
    case 'csv': {
      const blob = exportToCSV(measurements, scales, options);
      const filename = generateFilename(projectId, 'csv', timestamp);
      downloadBlob(blob, filename);
      break;
    }
    
    case 'image': {
      if (!canvas) {
        throw new Error('Canvas element required for image export');
      }
      const blob = await exportToImage(canvas, options);
      const filename = generateFilename(projectId, 'png', timestamp);
      downloadBlob(blob, filename);
      break;
    }
    
    case 'annotatedPdf': {
      // TODO: Implement annotated PDF export using pdf-lib
      // This requires:
      // 1. Loading the original PDF
      // 2. Adding measurement annotations to each page
      // 3. Rendering dimension lines, labels, and values
      // 4. Saving the modified PDF
      throw new Error('Annotated PDF export not yet implemented. Requires pdf-lib integration.');
    }
    
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Generate summary statistics for measurements
 */
export function generateSummary(
  measurements: Measurement[],
  scales: Record<number, ScaleModel>
): {
  totalLinearFt: number;
  totalAreaSqFt: number;
  totalCount: number;
  totalVolumeCuYd: number;
  byType: Record<string, number>;
  byPage: Record<number, number>;
} {
  const visible = measurements.filter(m => m.visible);
  
  const summary = {
    totalLinearFt: 0,
    totalAreaSqFt: 0,
    totalCount: 0,
    totalVolumeCuYd: 0,
    byType: {} as Record<string, number>,
    byPage: {} as Record<number, number>,
  };
  
  visible.forEach(m => {
    // Totals by type
    if (m.type === 'linear') {
      summary.totalLinearFt += m.lengthFt || 0;
    } else if (m.type === 'area') {
      summary.totalAreaSqFt += m.areaSqFt || 0;
    } else if (m.type === 'wallArea') {
      summary.totalAreaSqFt += m.areaSqFt || 0;
    } else if (m.type === 'count') {
      summary.totalCount += m.count || 0;
    } else if (m.type === 'volume') {
      summary.totalVolumeCuYd += m.volumeCuYd || 0;
    }
    
    // Count by type
    summary.byType[m.type] = (summary.byType[m.type] || 0) + 1;
    
    // Count by page
    summary.byPage[m.pageIndex] = (summary.byPage[m.pageIndex] || 0) + 1;
  });
  
  return summary;
}
