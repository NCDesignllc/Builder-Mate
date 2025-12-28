export type TakeoffTool = "select" | "pan" | "scale" | "measure" | "area" | "label" | "line";

export type PlanSource = {
  id: string;
  name: string;
  mime: string;
  url: string; // object URL (blob:) or remote URL
  file?: File; // keep original file for pdfjs ArrayBuffer loading
};
