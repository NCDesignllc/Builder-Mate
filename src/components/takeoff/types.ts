// ==================== TOOLS ====================
export type TakeoffTool = 
  | "select" 
  | "pan"
  | "scale" 
  | "linear"    // Linear measurement (polyline)
  | "area"      // Area measurement (polygon)
  | "count"     // Count tool
  | "wallArea"  // Wall area tool
  | "slope"     // Slope measurement
  | "volume"    // Volume measurement
  | "subtract"  // Subtract tool
  | "markup"    // Markup/annotation tool
  | "download"  // Export/download tool
  | "label";    // Label/annotation (legacy)

// ==================== PLAN SOURCE ====================
export type PlanSource = {
  id: string;
  name: string;
  mime: string;
  url: string; // object URL (blob:) or remote URL
  file?: File; // keep original file for pdfjs ArrayBuffer loading
};

// ==================== GEOMETRY ====================
export type Point = {
  x: number;
  y: number;
};

// ==================== SCALE ====================
export type TakeoffScale = {
  pxPerUnit: number;      // pixels per unit
  unit: 'ft' | 'in' | 'm' | 'cm';
  label: string;          // e.g., "10 ft"
};

export type TakeoffScaleByPage = Record<number, TakeoffScale>;

// ==================== LAYERS ====================
export type LayerType = 
  | "electrical"
  | "plumbing"
  | "hvac"
  | "framing"
  | "custom";

export type Layer = {
  id: string;
  name: string;
  type: LayerType;
  color: string;
  visible: boolean;
  locked: boolean;
};

// ==================== MEASUREMENTS ====================
export type MeasurementKind = "linear" | "area" | "count";

export type BaseMeasurement = {
  id: string;
  pageIndex: number;      // Page this measurement belongs to (0-based)
  layerId?: string;       // Optional layer assignment
  label?: string;         // User-editable label
  tag?: string;           // Optional categorization tag
  createdAt: number;      // Timestamp
};

export type LinearMeasurement = BaseMeasurement & {
  kind: "linear";
  points: Point[];        // Polyline vertices (2+ points)
};

export type AreaMeasurement = BaseMeasurement & {
  kind: "area";
  points: Point[];        // Polygon vertices (3+ points, auto-closed)
};

export type CountMeasurement = BaseMeasurement & {
  kind: "count";
  point: Point;           // Single placement point
  count: number;          // Count value (auto-incremented)
  symbol?: string;        // Optional symbol identifier
};

export type Measurement = LinearMeasurement | AreaMeasurement | CountMeasurement;

// ==================== UNDO/REDO ====================
export type HistoryEntry = {
  measurements: Measurement[];
  timestamp: number;
};

// ==================== SNAPPING ====================
export type SnapMode = "none" | "endpoint" | "intersection" | "angle";

export type SnapResult = {
  point: Point;
  mode: SnapMode;
  distance: number;
};

// ==================== SELECTION ====================
export type SelectionMode = "single" | "multi";

export type Selection = {
  measurementIds: string[];
  mode: SelectionMode;
};

// ==================== EXPORT ====================
export type ExportFormat = "csv" | "excel" | "pdf";

export type ExportOptions = {
  format: ExportFormat;
  includeMarkup: boolean;
  includeLegend: boolean;
  groupBy?: "page" | "layer" | "type";
};

// ==================== PAGE VISIBILITY ====================
export type PageVisibility = {
  pageIndex: number;
  isHidden: boolean;
  label?: string;         // Optional custom page label (e.g., "A2.1")
};

export type PageVisibilityMap = Record<number, PageVisibility>;
