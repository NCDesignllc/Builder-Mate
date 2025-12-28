/**
 * Selection + Highlight Integration Notes
 *
 * This project currently uses a modular TakeoffViewport wrapper that forwards
 * `selectedId` and `onSelectMeasurement` to the underlying renderer.
 *
 * To fully support clicking on the canvas to select a measurement:
 *  - Implement hit-testing in your renderer (nearest segment / polygon containment)
 *  - Call `onSelectMeasurement(measurementId)` on click
 *
 * To fully support highlight styling:
 *  - When drawing the selected measurement, increase stroke width and/or set stroke color
 *  - Use the provided `highlightColor` prop if present
 */
export {};
