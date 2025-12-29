/**
 * Scale conversion utilities for PDF takeoff measurements
 * 
 * Provides functions for:
 * - Converting between pixels, inches, and feet
 * - Calibrating scales from known distances
 * - Calculating architectural preset scales
 */

import type { Point } from '../components/takeoff/types';
import type { ScaleModel } from '../types/measurements';
import { ARCHITECTURAL_PRESETS } from '../types/measurements';

/**
 * Calculate pixel distance between two points
 */
export function pixelDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Convert total inches to feet, inches, and fractional inches
 */
export function inchesToComponents(totalInches: number): {
  feet: number;
  inches: number;
  fraction: number;
} {
  const feet = Math.floor(totalInches / 12);
  const remainingInches = totalInches % 12;
  const inches = Math.floor(remainingInches);
  const fraction = remainingInches - inches;
  
  return { feet, inches, fraction };
}

/**
 * Convert feet, inches, and fractional inches to total inches
 */
export function componentsToInches(
  feet: number,
  inches: number,
  fraction: number
): number {
  return feet * 12 + inches + fraction;
}

/**
 * Create a calibrated scale from two points and a known distance
 */
export function createCalibratedScale(
  point1: Point,
  point2: Point,
  knownFeet: number,
  knownInches: number,
  knownFraction: number,
  options: {
    pageIndex?: number;
    showDimensionLine?: boolean;
    name?: string;
  } = {}
): ScaleModel {
  const pixelDist = pixelDistance(point1, point2);
  const knownTotalInches = componentsToInches(knownFeet, knownInches, knownFraction);
  const pxPerInch = pixelDist / knownTotalInches;
  const pxPerFoot = pxPerInch * 12;
  
  const label = knownFeet > 0 
    ? `${knownFeet}' ${knownInches}${knownFraction > 0 ? '+' : ''}"`
    : `${knownInches}${knownFraction > 0 ? '+' : ''}"`;
  
  return {
    id: `scale-${Date.now()}`,
    name: options.name || `Calibrated (${label})`,
    type: 'calibrated',
    pxPerInch,
    pxPerFoot,
    pageIndex: options.pageIndex,
    showDimensionLine: options.showDimensionLine ?? true,
    locked: false,
    createdAt: Date.now(),
    calibrationPoints: [point1, point2],
    knownDistance: {
      feet: knownFeet,
      inches: knownInches,
      fraction: knownFraction,
    },
  };
}

/**
 * Create a standard architectural scale from a preset
 */
export function createStandardScale(
  presetIndex: number,
  viewportScale: number = 1.0,
  options: {
    pageIndex?: number;
    name?: string;
    applyToAll?: boolean;
  } = {}
): ScaleModel {
  if (presetIndex < 0 || presetIndex >= ARCHITECTURAL_PRESETS.length) {
    throw new Error(`Invalid preset index: ${presetIndex}`);
  }
  
  const preset = ARCHITECTURAL_PRESETS[presetIndex];
  const screenDPI = 96;
  const paperInches = preset.ratio * 12;
  const pxPerInch = (screenDPI * paperInches) / viewportScale;
  const pxPerFoot = pxPerInch * 12;
  
  return {
    id: `scale-${Date.now()}`,
    name: options.name || `Standard (${preset.label})`,
    type: 'standard',
    pxPerInch,
    pxPerFoot,
    pageIndex: options.applyToAll ? undefined : options.pageIndex,
    showDimensionLine: false,
    locked: false,
    createdAt: Date.now(),
    preset: preset.label,
  };
}

export function pixelsToInches(pixels: number, scale: ScaleModel | null): number {
  if (!scale || scale.pxPerInch === 0) return 0;
  return pixels / scale.pxPerInch;
}

export function pixelsToFeet(pixels: number, scale: ScaleModel | null): number {
  if (!scale || scale.pxPerFoot === 0) return 0;
  return pixels / scale.pxPerFoot;
}

export function squarePixelsToSquareFeet(sqPixels: number, scale: ScaleModel | null): number {
  if (!scale || scale.pxPerFoot === 0) return 0;
  return sqPixels / (scale.pxPerFoot * scale.pxPerFoot);
}

export function cubicPixelsToCubicFeet(cuPixels: number, scale: ScaleModel | null): number {
  if (!scale || scale.pxPerFoot === 0) return 0;
  return cuPixels / (scale.pxPerFoot * scale.pxPerFoot * scale.pxPerFoot);
}

export function cubicFeetToCubicYards(cubicFeet: number): number {
  return cubicFeet / 27;
}

export function formatMeasurement(value: number, unit: string, decimals: number = 2): string {
  return `${value.toFixed(decimals)} ${unit}`;
}

export function calculateSlope(riseFt: number, runFt: number): {
  percent: number;
  pitch: string;
} {
  if (runFt === 0) {
    return { percent: 0, pitch: '0:12' };
  }
  const percent = (riseFt / runFt) * 100;
  const pitchRise = (riseFt / runFt) * 12;
  const pitch = `${pitchRise.toFixed(2)}:12`;
  return { percent, pitch };
}

export function getScaleDescription(scale: ScaleModel | null): string {
  if (!scale) return 'No scale set';
  if (scale.type === 'calibrated') {
    const dist = scale.knownDistance;
    if (dist) {
      const ftPart = dist.feet > 0 ? `${dist.feet}'` : '';
      const inPart = dist.inches > 0 || dist.fraction > 0 
        ? `${dist.inches}${dist.fraction > 0 ? '+' : ''}"`
        : '';
      return `${ftPart}${ftPart && inPart ? ' ' : ''}${inPart}`;
    }
    return 'Calibrated';
  }
  return scale.preset || scale.name || 'Standard';
}
