# PDF Takeoff Tools

A comprehensive set of construction takeoff measurement tools for PDF plans with precision snapping, layers, and export capabilities.

## Features

### 🛠 Measurement Tools
- **Linear Tool** - Polyline-based measurements for pipes, wires, walls
- **Area Tool** - Polygon-based square footage calculations
- **Count Tool** - Single-click markers for fixtures and devices
- **Scale Tool** - Interactive calibration with known distances

### 🎯 Precision Features
- **Smart Snapping**
  - Endpoint snapping (snap to existing points)
  - Intersection snapping (snap to line crossings)
  - Angle snapping (90° with Shift key)
  - Visual snap indicator (green circle)
  
### 📐 Scale Calibration
- Per-page scale independence
- Support for ft, in, m, cm units
- Quick presets (5, 10, 20, 50, 100)
- Visual calibration line
- Persistent scale storage

### 🗂 Layer System
- **Default Layers**
  - Electrical (Gold - #FFD700)
  - Plumbing (Blue - #4169E1)
  - HVAC (Green - #32CD32)
  - Framing (Brown - #8B4513)
- Custom layer creation
- Visibility toggle
- Lock/unlock editing
- Color-coded legend

### 🔄 Editing & Control
- **Undo/Redo** - 50-level history (Ctrl+Z/Y)
- **Selection** - Hover highlighting, multi-select (Shift)
- **Labels** - Inline editing for all measurements
- **Delete** - Remove individual measurements

### 📊 Summary & Export
- **Live Totals**
  - Total linear footage
  - Total square footage
  - Total count
  - Breakdown by type
- **Export to CSV**
  - All measurements with labels
  - Totals and breakdowns
  - Page information
  - Timestamps

### ⌨️ Keyboard Shortcuts
```
V - Select tool
H - Pan tool
S - Scale tool
L - Linear measurement
A - Area measurement
C - Count tool

Ctrl+Z - Undo
Ctrl+Y - Redo
Shift - Angle snap (90°)
Esc - Cancel/Exit
F - Fullscreen
+/- - Zoom in/out
0 - Reset zoom
? - Show help
Middle Mouse Button - Pan (click & drag)
```

## Usage

### Basic Setup
```tsx
import { TakeoffWorkspace } from '@/components/takeoff';

function MyApp() {
  const [plan, setPlan] = useState<PlanSource | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  return (
    <TakeoffWorkspace
      isDarkMode={true}
      plan={plan}
      pageIndex={pageIndex}
      onPageChange={setPageIndex}
      projectId="project-123"
    />
  );
}
```

### Individual Components
```tsx
import { 
  TakeoffToolbar,
  TakeoffViewportPdf,
  TakeoffItemsPanel,
  LayersPanel,
  TakeoffSummary,
  useTakeoffPersist,
  useUndoRedo,
  useLayers
} from '@/components/takeoff';
```

## Architecture

### Type System
```typescript
// Measurement types
type MeasurementKind = "linear" | "area" | "count";

type LinearMeasurement = {
  kind: "linear";
  points: Point[];
  pageIndex: number;
  label?: string;
  layerId?: string;
  // ... other fields
};

// Scale definition
type TakeoffScale = {
  pxPerUnit: number;
  unit: 'ft' | 'in' | 'm' | 'cm';
  label: string;
};
```

### State Management
- **Measurements** - Centralized array with page-scoped filtering
- **Scale** - Per-page dictionary for independent calibration
- **Layers** - Global layer definitions with active layer tracking
- **History** - Circular buffer for undo/redo operations

### Canvas Architecture
- PDF rendering via `pdf.js`
- Measurement overlay canvas
- Separate tool canvases (scale, etc.)
- Event handling with snap detection
- Efficient redraw on state changes

## API Reference

### useTakeoffPersist
```typescript
const {
  scale,              // Current page scale
  setScale,           // Update page scale
  measurements,       // All measurements
  addMeasurement,     // Add new measurement
  updateMeasurement,  // Update existing
  deleteMeasurement,  // Remove measurement
  clear,              // Clear all
  storageKey,         // Current storage key
} = useTakeoffPersist(projectId, planId, pageIndex);
```

### useUndoRedo
```typescript
const {
  undo,      // Undo last change
  redo,      // Redo last undo
  canUndo,   // Can undo?
  canRedo,   // Can redo?
} = useUndoRedo(measurements, setMeasurements);
```

### useLayers
```typescript
const {
  layers,              // All layers
  activeLayerId,       // Current layer
  setActiveLayerId,    // Change active layer
  toggleVisibility,    // Show/hide layer
  toggleLock,          // Lock/unlock layer
  addLayer,            // Create custom layer
  deleteLayer,         // Remove layer
  getLayer,            // Get layer by ID
} = useLayers();
```

## Calculation Formulas

### Linear Measurement
```typescript
// Polyline total length
length = Σ distance(point[i], point[i+1])
realLength = length / scale.pxPerUnit
```

### Area Measurement
```typescript
// Shoelace formula for polygon area
area = |Σ (x[i] * y[i+1] - x[i+1] * y[i])| / 2
realArea = area / (scale.pxPerUnit)²
```

### Scale Calibration
```typescript
pxPerUnit = pixelDistance / realDistance
// Example: 100px for 10ft → pxPerUnit = 10
```

## Storage

All measurements are persisted to `localStorage`:

```typescript
Key: `buildermate.takeoff.{projectId}.{planId}`

Data: {
  scalesByPage: Record<number, TakeoffScale>,
  measurements: Measurement[],
  updatedAt: number
}
```

## Performance Considerations

- **Canvas Rendering** - Only redraws on state change
- **Page Filtering** - Measurements filtered by page before render
- **Snap Detection** - Spatial indexing for large measurement sets
- **History** - Circular buffer limits memory usage
- **Debouncing** - Mouse move events throttled

## Browser Compatibility

- Modern browsers with Canvas support
- PDF.js for PDF rendering
- LocalStorage for persistence
- ES2020+ JavaScript features

## Future Enhancements

- Vertex editing (drag points)
- Multi-select operations
- Excel export
- PDF markup export
- Symbol library
- AI symbol recognition
- Cost integration
- Change order tracking

## License

Part of BuilderMate - Construction estimation and project management platform.
