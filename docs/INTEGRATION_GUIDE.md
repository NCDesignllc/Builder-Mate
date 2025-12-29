# Phase 2 Integration Guide

This document provides step-by-step instructions for integrating the Phase 2 components into the existing BuilderMate takeoff system.

## Components Completed in Phase 2

1. **ScaleModal.enhanced.tsx** - Two-tab scale modal (Calibrated/Standard)
2. **exportService.ts** - CSV and Image export functionality
3. **TakeoffToolbar.enhanced.tsx** - 10-tool toolbar with popovers (from Phase 1)
4. **Tool popovers** - Sub-mode selection popovers (from Phase 1)

## Integration Steps

### Step 1: Replace ScaleModal

**File:** `src/components/takeoff/TakeoffWorkspace.tsx` or wherever ScaleModal is used

```typescript
// Old import:
// import { ScaleModal } from './ScaleModal';

// New import:
import { ScaleModal } from './ScaleModal.enhanced';
import type { ScaleModel } from '../../types/measurements';

// Add state for enhanced scale handling
const [scaleModel, setScaleModel] = useState<ScaleModel | null>(null);
const [isCapturingScale, setIsCapturingScale] = useState(false);
const [scalePoints, setScalePoints] = useState<[Point, Point] | null>(null);

// Update ScaleModal usage:
<ScaleModal
  isOpen={showScaleModal}
  isDarkMode={isDarkMode}
  pixelDistance={scalePoints ? pixelDistance(scalePoints[0], scalePoints[1]) : null}
  calibrationPoints={scalePoints}
  pageIndex={currentPage}
  onClose={() => {
    setShowScaleModal(false);
    setIsCapturingScale(false);
    setScalePoints(null);
  }}
  onApply={(scale) => {
    // Legacy handler - still works
    setScale(scale);
  }}
  onApplyEnhanced={(scale: ScaleModel) => {
    // Enhanced handler - use this for new features
    setScaleModel(scale);
    // Convert to legacy format for compatibility
    setScale({
      pxPerUnit: scale.pxPerFoot / 12,
      unit: 'ft',
      label: scale.name,
    });
  }}
  onStartCalibration={() => {
    // User clicked "Set" in Calibrated tab
    setIsCapturingScale(true);
    setShowScaleModal(false); // Close modal, start capture
  }}
/>
```

### Step 2: Handle Scale Calibration Capture

**In your canvas click handler:**

```typescript
function handleCanvasClick(e: React.MouseEvent) {
  const point = getCanvasPoint(e);
  
  if (isCapturingScale) {
    if (!scalePoints) {
      // First point
      setScalePoints([point, point]);
    } else {
      // Second point - reopen modal with both points
      setScalePoints([scalePoints[0], point]);
      setShowScaleModal(true);
      setIsCapturingScale(false);
    }
    return;
  }
  
  // ... rest of click handling
}

// Show live dimension line during capture
function renderScaleCapture(ctx: CanvasRenderingContext2D) {
  if (isCapturingScale && scalePoints) {
    ctx.strokeStyle = '#10b981'; // Green
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(scalePoints[0].x, scalePoints[0].y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
```

### Step 3: Replace TakeoffToolbar

**File:** `src/components/takeoff/TakeoffWorkspace.tsx`

```typescript
// Old import:
// import { TakeoffToolbar } from './TakeoffToolbar';

// New import:
import { TakeoffToolbar } from './TakeoffToolbar.enhanced';
import type { AreaMode, LinearMode, CountMode, MarkupType } from '../../types/measurements';

// Add state for sub-modes
const [areaMode, setAreaMode] = useState<AreaMode>('multiPoint');
const [linearMode, setLinearMode] = useState<LinearMode>('segment');
const [countMode, setCountMode] = useState<CountMode>('multiPoint');
const [markupMode, setMarkupMode] = useState<MarkupType>('text');

// Update toolbar usage:
<TakeoffToolbar
  isDarkMode={isDarkMode}
  disabled={!plan}
  tool={tool}
  onChange={setTool}
  onUndo={undo}
  onRedo={redo}
  canUndo={canUndo}
  canRedo={canRedo}
  // New callbacks for sub-modes
  onAreaModeSelect={(mode) => {
    setAreaMode(mode);
    setTool('area'); // Ensure tool is active
  }}
  onLinearModeSelect={(mode) => {
    setLinearMode(mode);
    setTool('linear');
  }}
  onCountModeSelect={(mode) => {
    setCountMode(mode);
    setTool('count');
  }}
  onMarkupModeSelect={(mode) => {
    setMarkupMode(mode);
    setTool('markup');
  }}
  onExportFormatSelect={(format) => {
    handleExport(format);
  }}
/>
```

### Step 4: Add Export Functionality

**File:** `src/components/takeoff/TakeoffWorkspace.tsx` or `TakeoffItemsPanel.tsx`

```typescript
import { exportMeasurements, generateSummary } from '../../services/exportService';
import type { ExportFormat } from '../../types/measurements';

async function handleExport(format: ExportFormat) {
  try {
    const canvas = document.querySelector('canvas'); // Get your measurement canvas
    
    await exportMeasurements(
      format,
      measurements,
      scalesByPage,
      {
        format,
        includeHidden: false,
        includeLocked: true,
        pageIndex: undefined, // undefined = all pages
        timestamp: true,
      },
      canvas || undefined,
      projectId
    );
    
    // Optional: Show success message
    console.log(`Exported as ${format}`);
  } catch (error) {
    console.error('Export failed:', error);
    alert(`Export failed: ${error.message}`);
  }
}

// Optional: Show summary statistics
const summary = generateSummary(measurements, scalesByPage);
console.log('Summary:', summary);
```

### Step 5: Update MeasurementCanvas for New Tools

**File:** `src/components/takeoff/MeasurementCanvas.tsx`

Add handlers for new tools and sub-modes:

```typescript
// Import new types
import type { WallAreaMeasurement, SlopeMeasurement } from '../../types/measurements';
import { pixelsToFeet, calculateSlope } from '../../services/scaleUtils';

// In your click handler, add cases for new tools:
function handleToolClick(point: Point) {
  switch (tool) {
    case 'wallArea':
      handleWallAreaClick(point);
      break;
    case 'slope':
      handleSlopeClick(point);
      break;
    case 'volume':
      handleVolumeClick(point);
      break;
    // ... existing cases
  }
}

// Wall Area tool handler
function handleWallAreaClick(point: Point) {
  const snapped = enableSnap ? smartSnap(point, existingPoints, snapThreshold) : point;
  setCurrentPoints([...currentPoints, snapped]);
  // On double-click or Enter, prompt for height and create measurement
}

// Slope tool handler
function handleSlopeClick(point: Point) {
  if (currentPoints.length === 0) {
    setCurrentPoints([point]);
  } else {
    // Second point - calculate slope
    const pt1 = currentPoints[0];
    const dx = Math.abs(point.x - pt1.x);
    const dy = Math.abs(point.y - pt1.y);
    const runFt = pixelsToFeet(dx, scale);
    const riseFt = pixelsToFeet(dy, scale);
    const { percent, pitch } = calculateSlope(riseFt, runFt);
    
    const measurement: SlopeMeasurement = {
      id: uuid(),
      type: 'slope',
      pageIndex,
      scaleId: scale?.id || null,
      points: [pt1, point],
      riseFt,
      runFt,
      slopePercent: percent,
      pitch,
      locked: false,
      visible: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    onAddMeasurement(measurement);
    setCurrentPoints([]);
  }
}

// Area tool - handle different modes
function handleAreaClick(point: Point, mode: AreaMode) {
  switch (mode) {
    case 'twoPoints':
      // Rectangle mode
      if (currentPoints.length === 0) {
        setCurrentPoints([point]);
      } else {
        // Second point - create rectangle
        const rect = createRectangle(currentPoints[0], point);
        createAreaMeasurement(rect, 'twoPoints');
        setCurrentPoints([]);
      }
      break;
    case 'multiPoint':
      // Existing polygon logic
      setCurrentPoints([...currentPoints, point]);
      break;
    case 'oval':
      // Ellipse mode - handle drag
      // Implementation depends on your drag handling
      break;
  }
}
```

### Step 6: Render New Measurement Types

**File:** `src/components/takeoff/MeasurementCanvas.tsx`

```typescript
function renderMeasurement(ctx: CanvasRenderingContext2D, m: Measurement) {
  switch (m.type) {
    case 'wallArea':
      renderWallArea(ctx, m as WallAreaMeasurement);
      break;
    case 'slope':
      renderSlope(ctx, m as SlopeMeasurement);
      break;
    case 'volume':
      renderVolume(ctx, m as VolumeMeasurement);
      break;
    // ... existing cases
  }
}

function renderWallArea(ctx: CanvasRenderingContext2D, m: WallAreaMeasurement) {
  // Draw polyline
  ctx.strokeStyle = m.meta?.color || '#FF6B6B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  m.points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
  
  // Draw label with area
  if (m.areaSqFt) {
    const midPoint = m.points[Math.floor(m.points.length / 2)];
    ctx.fillStyle = '#fff';
    ctx.fillText(
      `${m.lengthFt?.toFixed(1)}' × ${m.height}'  = ${m.areaSqFt.toFixed(1)} sq ft`,
      midPoint.x,
      midPoint.y - 10
    );
  }
}

function renderSlope(ctx: CanvasRenderingContext2D, m: SlopeMeasurement) {
  const [pt1, pt2] = m.points;
  
  // Draw line
  ctx.strokeStyle = m.meta?.color || '#8B5CF6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pt1.x, pt1.y);
  ctx.lineTo(pt2.x, pt2.y);
  ctx.stroke();
  
  // Draw label
  ctx.fillStyle = '#fff';
  ctx.fillText(
    `Rise: ${m.riseFt?.toFixed(1)}' Run: ${m.runFt?.toFixed(1)}' Slope: ${m.slopePercent?.toFixed(1)}% (${m.pitch})`,
    (pt1.x + pt2.x) / 2,
    (pt1.y + pt2.y) / 2 - 10
  );
}
```

## Testing Your Integration

### Test Checklist

1. **Enhanced ScaleModal**
   - [ ] Open Scale modal - both tabs visible
   - [ ] Calibrated tab: Enter 20', click Set, click two points
   - [ ] Standard tab: Select preset, click Set
   - [ ] "Apply to all" toggle works
   - [ ] Modal closes after Set

2. **Export Functionality**
   - [ ] Export to CSV - file downloads
   - [ ] CSV contains all visible measurements
   - [ ] Export to Image - PNG downloads
   - [ ] Image shows current canvas view

3. **Enhanced Toolbar**
   - [ ] All 10 tools visible
   - [ ] Clicking Area/Linear/Count opens popover
   - [ ] Selecting popover option closes popover and activates mode
   - [ ] Only one popover open at a time

4. **New Tools** (if implemented)
   - [ ] Wall Area: trace wall, enter height, measurement created
   - [ ] Slope: two points, rise/run/slope% displayed
   - [ ] Volume: area + height = cubic yards

## Troubleshooting

### ScaleModal not showing tabs
- Make sure you're importing from `ScaleModal.enhanced.tsx`, not the original `ScaleModal.tsx`

### Export not working
- Check that canvas element is accessible: `document.querySelector('canvas')`
- Verify measurements array is populated
- Check browser console for errors

### Toolbar popovers not appearing
- Ensure `TakeoffToolbar.enhanced.tsx` is imported
- Verify button refs are being set correctly
- Check z-index of popover (should be 100)

### TypeScript errors
- Import types from `../../types/measurements`
- Use type assertions when needed: `m as WallAreaMeasurement`

## Next Steps

1. **Complete Tool Implementations**: Implement canvas handlers for all new tool types
2. **Add Rendering**: Render all new measurement types with proper styling
3. **Comprehensive Testing**: Use acceptance tests in `docs/ACCEPTANCE_TESTS.md`
4. **Polish**: Add loading states, error handling, user feedback
5. **Documentation**: Update user-facing documentation with new features

## Support

- See `docs/EVENT_FLOWS.md` for detailed tool behavior specifications
- See `docs/ACCEPTANCE_TESTS.md` for test scenarios
- See `src/types/exampleDataset.ts` for example measurements
