export type TakeoffTool = "select" | "pan" | "scale" | "measure" | "area" | "count" | "label";

export type PlanSource = {
  id: string;
  name: string;
  mime: string;
  url: string; // object URL (blob:) or remote URL
  file?: File; // keep original file for pdfjs ArrayBuffer loading
};

export type Point = {
  x: number;
  y: number;
};

export type MeasurementKind = "length" | "area" | "count";

export type Measurement = {
  id: string;
  kind: MeasurementKind;
  points: Point[];
  pageIndex: number; // REQUIRED: locks measurement to specific page
  label?: string;
  tag?: string;
  color?: string;
  createdAt?: number;
  updatedAt?: number;
};

export type TakeoffScale = {
  pxPerUnit: number;
  unit: "ft" | "in" | "m" | "cm";
  label: string; // e.g., "10 ft"
};

export type TakeoffScaleByPage = {
  [pageIndex: number]: TakeoffScale | null;
};

export type UnitSystem = "imperial" | "metric";

export type SnapMode = "endpoint" | "angle-90" | "angle-45" | "none";

export type EditorState = {
  selectedMeasurementId: string | null;
  selectedPointIndex: number | null;
  hoveredMeasurementId: string | null;
  hoveredPointIndex: number | null;
  labelsVisible: boolean;
};
