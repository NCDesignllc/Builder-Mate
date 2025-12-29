/**
 * Comprehensive measurement type definitions for PDF Takeoff Tools
 * 
 * This file contains all measurement types, scale models, and related
 * interfaces as specified in the PDF takeoff toolbar requirements.
 */

import type { Point } from '../components/takeoff/types';

// ==================== SCALE MODELS ====================

export type ScaleType = 'calibrated' | 'standard';

/**
 * Enhanced scale model supporting both calibrated and standard scales
 */
export type ScaleModel = {
  id: string;
  name: string;
  type: ScaleType;
  pxPerInch: number;        // Pixels per inch
  pxPerFoot: number;        // Pixels per foot (pxPerInch * 12)
  pageIndex?: number;       // Page this scale applies to (undefined = all pages)
  showDimensionLine: boolean; // Show calibration dimension line
  locked: boolean;          // Prevent accidental changes
  createdAt: number;        // Timestamp
  // Calibrated-specific
  calibrationPoints?: [Point, Point]; // Two points used for calibration
  knownDistance?: {         // Known real-world distance
    feet: number;
    inches: number;
    fraction: number;       // Fractional inches (e.g., 0.5 for 1/2")
  };
  // Standard-specific
  preset?: string;          // e.g., "1/4\" = 1'-0\""
};

/**
 * Architectural scale presets for standard scales
 */
export const ARCHITECTURAL_PRESETS = [
  { label: '1/16" = 1\'-0"', ratio: 1/192 },   // 1/16" on paper = 1 foot in real life
  { label: '3/32" = 1\'-0"', ratio: 3/384 },
  { label: '1/8" = 1\'-0"', ratio: 1/96 },
  { label: '3/16" = 1\'-0"', ratio: 3/192 },
  { label: '1/4" = 1\'-0"', ratio: 1/48 },
  { label: '3/8" = 1\'-0"', ratio: 3/96 },
  { label: '1/2" = 1\'-0"', ratio: 1/24 },
  { label: '3/4" = 1\'-0"', ratio: 3/48 },
  { label: '1" = 1\'-0"', ratio: 1/12 },
] as const;

// ==================== MEASUREMENT BASE ====================

export type MeasurementType = 
  | 'linear'
  | 'area'
  | 'count'
  | 'wallArea'
  | 'slope'
  | 'volume'
  | 'subtract'
  | 'markup';

/**
 * Base properties shared by all measurements
 */
export type BaseMeasurement = {
  id: string;                 // UUID
  type: MeasurementType;
  pageIndex: number;          // Page this measurement belongs to (0-based)
  scaleId: string | null;     // Reference to scale used
  layerId?: string;           // Optional layer assignment
  label?: string;             // User-editable label
  locked: boolean;            // Prevent editing
  visible: boolean;           // Show/hide
  createdAt: number;          // Timestamp
  updatedAt: number;          // Last modified timestamp
  meta?: MeasurementMeta;     // Additional metadata
};

export type MeasurementMeta = {
  color?: string;             // Custom color override
  tags?: string[];            // Categorization tags
  notes?: string;             // User notes
  [key: string]: any;         // Extensible
};

// ==================== LINEAR MEASUREMENTS ====================

export type LinearMode = 'line' | 'curve' | 'segment';

export type LinearMeasurement = BaseMeasurement & {
  type: 'linear';
  mode: LinearMode;           // Line, Curve, or Segment
  points: Point[];            // Polyline vertices (2+ points)
  // Computed values (stored for performance)
  lengthPx?: number;          // Length in pixels
  lengthFt?: number;          // Length in feet
};

// ==================== AREA MEASUREMENTS ====================

export type AreaMode = 'twoPoints' | 'multiPoint' | 'oval';

export type AreaMeasurement = BaseMeasurement & {
  type: 'area';
  mode: AreaMode;             // Rectangle, Polygon, or Ellipse
  points: Point[];            // Vertices (polygon) or control points (ellipse)
  // Computed values
  areaPx?: number;            // Area in square pixels
  areaSqFt?: number;          // Area in square feet
};

// ==================== COUNT MEASUREMENTS ====================

export type CountMode = 'twoPoints' | 'multiPoint' | 'line';

export type CountMeasurement = BaseMeasurement & {
  type: 'count';
  mode: CountMode;
  points: Point[];            // Marker positions
  count: number;              // Total count
  symbol?: string;            // Symbol identifier for grouping
};

// ==================== WALL AREA MEASUREMENTS ====================

export type WallAreaMeasurement = BaseMeasurement & {
  type: 'wallArea';
  points: Point[];            // Wall polyline
  height: number;             // Wall height in feet
  // Computed values
  lengthFt?: number;          // Wall length in feet
  areaSqFt?: number;          // Wall area (length * height) in square feet
};

// ==================== SLOPE MEASUREMENTS ====================

export type SlopeMeasurement = BaseMeasurement & {
  type: 'slope';
  points: [Point, Point];     // Start and end points
  // Computed values
  riseFt?: number;            // Vertical rise in feet
  runFt?: number;             // Horizontal run in feet
  slopePercent?: number;      // Slope as percentage
  pitch?: string;             // Pitch in X:12 format (e.g., "4:12")
};

// ==================== VOLUME MEASUREMENTS ====================

export type VolumeType = 'slab' | 'fill' | 'excavation' | 'custom';

export type VolumeMeasurement = BaseMeasurement & {
  type: 'volume';
  volumeType: VolumeType;     // Type of volume calculation
  areaPoints: Point[];        // Base area polygon
  height: number;             // Height/depth in feet
  // Computed values
  areaSqFt?: number;          // Base area in square feet
  volumeCuFt?: number;        // Volume in cubic feet
  volumeCuYd?: number;        // Volume in cubic yards
};

// ==================== SUBTRACT MEASUREMENTS ====================

export type SubtractMeasurement = BaseMeasurement & {
  type: 'subtract';
  sourceId: string;           // ID of source measurement
  subtractIds: string[];      // IDs of measurements to subtract
  // Result geometry (computed and cached)
  resultPoints?: Point[];     // Resulting polygon after subtraction
  // Computed values
  originalAreaSqFt?: number;  // Original area
  subtractedAreaSqFt?: number; // Total subtracted area
  resultAreaSqFt?: number;    // Final area after subtraction
};

// ==================== MARKUP MEASUREMENTS ====================

export type MarkupType = 'text' | 'draw' | 'ruler' | 'legend';

export type TextMarkup = {
  markupType: 'text';
  position: Point;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
};

export type DrawMarkup = {
  markupType: 'draw';
  strokes: Point[][];         // Array of stroke paths (freehand)
  strokeWidth?: number;
  color?: string;
};

export type RulerMarkup = {
  markupType: 'ruler';
  points: [Point, Point];     // Start and end points
  showMeasurement?: boolean;  // Display measurement value
};

export type LegendMarkup = {
  markupType: 'legend';
  position: Point;
  measurementIds: string[];   // Measurements to include in legend
  autoUpdate: boolean;        // Update when measurements change
};

export type MarkupMeasurement = BaseMeasurement & {
  type: 'markup';
  markup: TextMarkup | DrawMarkup | RulerMarkup | LegendMarkup;
};

// ==================== UNION TYPE ====================

export type Measurement = 
  | LinearMeasurement
  | AreaMeasurement
  | CountMeasurement
  | WallAreaMeasurement
  | SlopeMeasurement
  | VolumeMeasurement
  | SubtractMeasurement
  | MarkupMeasurement;

// ==================== TOOL SUB-MODES ====================

/**
 * Sub-mode selections for tools with popovers
 */
export type ToolSubMode = {
  area: AreaMode;
  linear: LinearMode;
  count: CountMode;
};

// ==================== EXPORT TYPES ====================

export type ExportFormat = 'annotatedPdf' | 'csv' | 'image';

export type ExportOptions = {
  format: ExportFormat;
  includeHidden?: boolean;    // Include hidden measurements
  includeLocked?: boolean;    // Include locked measurements
  pageIndex?: number;         // Export specific page (undefined = all)
  timestamp?: boolean;        // Add timestamp to filename
};

// ==================== MEASUREMENT DATASET EXAMPLE ====================

/**
 * Example measurement dataset for testing and documentation
 */
export type MeasurementDataset = {
  projectId: string;
  planId: string;
  scales: Record<number, ScaleModel>;
  measurements: Measurement[];
  createdAt: number;
  updatedAt: number;
};
