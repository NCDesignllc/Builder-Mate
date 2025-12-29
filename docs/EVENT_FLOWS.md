# PDF Takeoff Toolbar - Event Flows

This document provides detailed event flows for each tool and integration guidance.

## Integration Points

### PDF Viewer Hooks Required
- `getPageViewport(pageIndex)` - Get page dimensions and scale
- `getPageElement(pageIndex)` - Get DOM element for overlay mounting
- `getCurrentPage()` / `setPage(index)` - Page navigation

### MeasurementCanvas Overlay
Mount above each PDF page as absolute positioned overlay.

### Storage
Key: `buildermate.takeoff.${projectId}.${planId}`
Stores: `{ scales: Record<number, ScaleModel>, measurements: Measurement[] }`

## Tool Event Flows

### Scale Tool (Calibrated)
1. Click Scale → Modal opens
2. Enter feet/inches/fraction
3. Toggle "Show Dimension Line"
4. Click "Set" → Cursor becomes crosshair
5. Click point 1 → Line starts
6. Move mouse → Live dimension line
7. Click point 2 → Scale calculated and stored for current page

### Area Tool (Multi Point)
1. Click Area → Popover opens
2. Click "Multi Point" → Popover closes
3. Click points to create polygon
4. Double-click or Enter → Polygon closed, measurement created
5. Live sqft display during drawing

### Linear Tool (Curve)
1. Click Linear → Popover opens
2. Click "Curve" → Popover closes
3. Click and drag → Path sampled (20ms intervals)
4. Release → Curve finalized, measurement created
5. Live length display during drawing

### Count Tool
1. Click Count → Popover opens
2. Select mode → Popover closes
3. Click to place numbered markers
4. Each click increments count
5. Esc or tool change → Finalizes count measurement

### Wall Area Tool
1. Click Wall Area → Tool activated
2. Click points to trace wall
3. Double-click or Enter → Height prompt
4. Enter height → Measurement created (length × height)

### Slope Tool
1. Click Slope → Tool activated
2. Click start point
3. Move mouse → Live slope display
4. Click end point → Measurement created with rise/run/slope%/pitch

### Volume Tool
1. Click Volume → Tool activated
2. Draw area polygon
3. Enter height → Measurement created (area × height in cu ft and cu yd)

### Subtract Tool
1. Click Subtract → Tool activated
2. Click source area measurement
3. Click measurements to subtract
4. Preview shows result
5. Enter → Non-destructive subtract measurement created

### Markup Tool
1. Click Markup → Popover opens
2. Select Text/Draw/Ruler/Legend
3. Place or draw markup
4. Markup added as measurement

### Download Tool
1. Click Download → Popover opens
2. Select CSV/PDF/Image
3. File downloads with visible measurements only

## State Management

```typescript
type TakeoffState = {
  tool: TakeoffTool;
  scalesByPage: Record<number, ScaleModel>;
  measurements: Measurement[];
  selectedIds: string[];
  openPopover: TakeoffTool | null;
  drawingState: 'idle' | 'active';
  currentPoints: Point[];
  history: HistoryEntry[];
}
```

## Popover Rules
- Only one open at a time
- Click outside closes
- Esc key closes
- Positioned above icon with 8px gap
- Auto-close on option selection

## Acceptance Criteria

### Visual
- [ ] 10 tools visible, icons correct
- [ ] Dark background, proper spacing
- [ ] Only one popover open
- [ ] Active tool highlighted

### Scale Modal
- [ ] Two tabs (Calibrated/Standard)
- [ ] Calibrated: feet/inches/fraction inputs, two-point capture, dimension line
- [ ] Standard: 9 presets, "apply to all" toggle
- [ ] Per-page storage by default

### Tools Work Correctly
- [ ] Area: 3 modes (Two Points, Multi Point, Oval)
- [ ] Linear: 3 modes (Line, Curve, Segment)
- [ ] Count: Place markers, increment count
- [ ] Wall Area: Trace + height = area
- [ ] Slope: Rise/run/slope%/pitch display
- [ ] Volume: Area + height = cu ft/yd
- [ ] Subtract: Non-destructive preview
- [ ] Markup: Text/Draw/Ruler/Legend
- [ ] Download: CSV/PDF/Image export

### Interaction
- [ ] Live value display during drawing
- [ ] Snapping to endpoints/intersections
- [ ] Undo/redo works for all operations
- [ ] Measurements locked to page
- [ ] Locked/visible toggles work
