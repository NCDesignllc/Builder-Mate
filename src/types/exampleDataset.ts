/**
 * Example measurement dataset for testing and documentation
 * 
 * This file contains sample measurements demonstrating all measurement types
 * with realistic values and proper scale conversions.
 */

import type { MeasurementDataset, Measurement, ScaleModel } from './measurements';

/**
 * Example calibrated scale for page 0
 * - Two points clicked at (100, 100) and (500, 100)
 * - Known distance: 20 feet
 * - Pixel distance: 400 pixels
 * - pxPerFoot = 400 / 20 = 20
 * - pxPerInch = 20 / 12 = 1.67
 */
const exampleCalibratedScale: ScaleModel = {
  id: 'scale-page0-calibrated',
  name: 'Calibrated (20\')',
  type: 'calibrated',
  pxPerInch: 1.67,
  pxPerFoot: 20,
  pageIndex: 0,
  showDimensionLine: true,
  locked: false,
  createdAt: Date.now(),
  calibrationPoints: [
    { x: 100, y: 100 },
    { x: 500, y: 100 },
  ],
  knownDistance: {
    feet: 20,
    inches: 0,
    fraction: 0,
  },
};

/**
 * Example standard scale for page 1
 * - Preset: 1/4" = 1'-0" (1:48 ratio)
 * - At 96 DPI: 1/4" = 24 pixels
 * - 24 pixels = 12 inches real
 * - pxPerInch = 24 / 12 = 2
 * - pxPerFoot = 2 * 12 = 24
 */
const exampleStandardScale: ScaleModel = {
  id: 'scale-page1-standard',
  name: 'Standard (1/4" = 1\'-0")',
  type: 'standard',
  pxPerInch: 2,
  pxPerFoot: 24,
  pageIndex: 1,
  showDimensionLine: false,
  locked: false,
  createdAt: Date.now(),
  preset: '1/4" = 1\'-0"',
};

/**
 * Example measurements for page 0 (calibrated scale)
 */

// Linear measurement: Exterior wall (polyline)
const linearMeasurement1: Measurement = {
  id: 'meas-linear-1',
  type: 'linear',
  mode: 'segment',
  pageIndex: 0,
  scaleId: 'scale-page0-calibrated',
  label: 'North exterior wall',
  locked: false,
  visible: true,
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 3600000,
  points: [
    { x: 100, y: 200 },
    { x: 300, y: 200 },
    { x: 300, y: 400 },
    { x: 500, y: 400 },
  ],
  // Calculated values:
  // Segment 1: 200px = 200/20 = 10 ft
  // Segment 2: 200px = 10 ft
  // Segment 3: 200px = 10 ft
  // Total: 30 ft
  lengthPx: 600,
  lengthFt: 30,
};

// Area measurement: Living room (polygon)
const areaMeasurement1: Measurement = {
  id: 'meas-area-1',
  type: 'area',
  mode: 'multiPoint',
  pageIndex: 0,
  scaleId: 'scale-page0-calibrated',
  label: 'Living room',
  locked: false,
  visible: true,
  createdAt: Date.now() - 3000000,
  updatedAt: Date.now() - 3000000,
  points: [
    { x: 150, y: 250 },
    { x: 350, y: 250 },
    { x: 350, y: 450 },
    { x: 150, y: 450 },
  ],
  // Calculated values:
  // Width: 200px = 10 ft
  // Height: 200px = 10 ft
  // Area: 100 sq ft
  areaPx: 40000,
  areaSqFt: 100,
};

// Count measurement: Electrical outlets
const countMeasurement1: Measurement = {
  id: 'meas-count-1',
  type: 'count',
  mode: 'multiPoint',
  pageIndex: 0,
  scaleId: 'scale-page0-calibrated',
  label: 'Electrical outlets',
  locked: false,
  visible: true,
  createdAt: Date.now() - 2000000,
  updatedAt: Date.now() - 2000000,
  points: [
    { x: 180, y: 270 },
    { x: 320, y: 270 },
    { x: 180, y: 430 },
    { x: 320, y: 430 },
    { x: 250, y: 350 },
  ],
  count: 5,
  symbol: 'outlet',
};

/**
 * Example measurements for page 1 (standard scale)
 */

// Wall area measurement: Interior wall with height
const wallAreaMeasurement1: Measurement = {
  id: 'meas-wallarea-1',
  type: 'wallArea',
  pageIndex: 1,
  scaleId: 'scale-page1-standard',
  label: 'Interior wall - drywall',
  locked: false,
  visible: true,
  createdAt: Date.now() - 1000000,
  updatedAt: Date.now() - 1000000,
  points: [
    { x: 100, y: 150 },
    { x: 400, y: 150 },
    { x: 400, y: 300 },
  ],
  height: 9, // 9 ft ceiling
  // Calculated values:
  // Segment 1: 300px = 300/24 = 12.5 ft
  // Segment 2: 150px = 150/24 = 6.25 ft
  // Total length: 18.75 ft
  // Wall area: 18.75 ft * 9 ft = 168.75 sq ft
  lengthFt: 18.75,
  areaSqFt: 168.75,
};

// Slope measurement: Roof pitch
const slopeMeasurement1: Measurement = {
  id: 'meas-slope-1',
  type: 'slope',
  pageIndex: 1,
  scaleId: 'scale-page1-standard',
  label: 'Roof slope - south side',
  locked: false,
  visible: true,
  createdAt: Date.now() - 500000,
  updatedAt: Date.now() - 500000,
  points: [
    { x: 200, y: 400 },
    { x: 500, y: 250 },
  ],
  // Calculated values:
  // Horizontal run: 300px = 12.5 ft
  // Vertical rise: 150px = 6.25 ft
  // Slope: (6.25/12.5) * 100 = 50%
  // Pitch: (6.25/12.5) * 12 = 6:12
  riseFt: 6.25,
  runFt: 12.5,
  slopePercent: 50,
  pitch: '6.00:12',
};

// Volume measurement: Concrete slab
const volumeMeasurement1: Measurement = {
  id: 'meas-volume-1',
  type: 'volume',
  volumeType: 'slab',
  pageIndex: 1,
  scaleId: 'scale-page1-standard',
  label: 'Concrete slab - garage',
  locked: false,
  visible: true,
  createdAt: Date.now() - 100000,
  updatedAt: Date.now() - 100000,
  areaPoints: [
    { x: 150, y: 200 },
    { x: 450, y: 200 },
    { x: 450, y: 500 },
    { x: 150, y: 500 },
  ],
  height: 0.33, // 4 inches = 0.33 ft
  // Calculated values:
  // Width: 300px = 12.5 ft
  // Length: 300px = 12.5 ft
  // Area: 156.25 sq ft
  // Volume: 156.25 * 0.33 = 51.56 cu ft = 1.91 cu yd
  areaSqFt: 156.25,
  volumeCuFt: 51.56,
  volumeCuYd: 1.91,
};

/**
 * Complete example dataset
 */
export const exampleMeasurementDataset: MeasurementDataset = {
  projectId: 'project-demo-001',
  planId: 'plan-floor-plan-001',
  scales: {
    0: exampleCalibratedScale,
    1: exampleStandardScale,
  },
  measurements: [
    linearMeasurement1,
    areaMeasurement1,
    countMeasurement1,
    wallAreaMeasurement1,
    slopeMeasurement1,
    volumeMeasurement1,
  ],
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now(),
};

/**
 * Expected values for QA testing
 */
export const expectedValues = {
  'meas-linear-1': {
    lengthFt: 30,
    description: 'Polyline with 3 segments of 10 ft each',
  },
  'meas-area-1': {
    areaSqFt: 100,
    description: '10 ft x 10 ft rectangle',
  },
  'meas-count-1': {
    count: 5,
    description: '5 electrical outlets placed individually',
  },
  'meas-wallarea-1': {
    lengthFt: 18.75,
    areaSqFt: 168.75,
    description: '18.75 ft wall length * 9 ft height',
  },
  'meas-slope-1': {
    riseFt: 6.25,
    runFt: 12.5,
    slopePercent: 50,
    pitch: '6.00:12',
    description: '6.25 ft rise over 12.5 ft run',
  },
  'meas-volume-1': {
    areaSqFt: 156.25,
    volumeCuFt: 51.56,
    volumeCuYd: 1.91,
    description: '12.5 ft x 12.5 ft x 4 inches (0.33 ft)',
  },
};
