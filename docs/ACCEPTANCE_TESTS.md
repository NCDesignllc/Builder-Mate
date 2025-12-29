# PDF Takeoff Toolbar - Acceptance Test Scenarios

This document provides detailed pass/fail criteria for QA testing of the PDF takeoff toolbar implementation.

## Test Environment Setup

### Prerequisites
- PDF document with known dimensions loaded
- BuilderMate application running
- Dark mode enabled (primary test mode)
- Multiple page PDF recommended for page-specific tests

### Test Data
Use the example dataset in `src/types/exampleDataset.ts` for expected value validation.

---

## Test Suite 1: Toolbar Visual and Behavior

### TC1.1: Toolbar Rendering
**Steps:**
1. Open application with PDF loaded
2. Observe toolbar on left side

**Expected:**
- [ ] 10 tool buttons visible in vertical layout
- [ ] Icons match specifications: Select, Pan, Scale, Area, Linear, Count, Wall Area, Slope, Volume, Subtract, Markup, Download
- [ ] Dark background (slate-800)
- [ ] Proper spacing between buttons (gap-2)
- [ ] Undo and Redo buttons visible below separator
- [ ] All buttons have tooltips on hover

**Pass Criteria:** All buttons visible with correct icons, dark background applied

---

### TC1.2: Popover Behavior - Single Open
**Steps:**
1. Click Area tool button → Popover opens
2. Click Linear tool button → Linear popover opens

**Expected:**
- [ ] Area popover closes when Linear popover opens
- [ ] Only one popover visible at a time
- [ ] Previous popover cleanly transitions out

**Pass Criteria:** Only one popover open at any time

---

### TC1.3: Popover Close - Click Outside
**Steps:**
1. Click Area tool button → Popover opens
2. Click anywhere on PDF canvas

**Expected:**
- [ ] Popover closes immediately
- [ ] Tool remains active
- [ ] No errors in console

**Pass Criteria:** Popover closes on outside click

---

### TC1.4: Popover Close - Esc Key
**Steps:**
1. Click Area tool button → Popover opens
2. Press Esc key

**Expected:**
- [ ] Popover closes
- [ ] Focus returns to main canvas
- [ ] Tool remains active

**Pass Criteria:** Esc key closes popover

---

### TC1.5: Active Tool Highlighting
**Steps:**
1. Click each tool button in sequence
2. Observe visual feedback

**Expected:**
- [ ] Active tool has orange background (bg-orange-600)
- [ ] Active tool has orange border
- [ ] Previously active tool returns to idle state
- [ ] Visual change is immediate and clear

**Pass Criteria:** Active tool clearly highlighted in orange

---

## Test Suite 2: Scale Tool - Calibrated Mode

### TC2.1: Scale Modal Opening
**Steps:**
1. Click Scale tool button

**Expected:**
- [ ] Scale modal opens centered on screen
- [ ] Modal has dark background
- [ ] Two tabs visible: "Calibrated" and "Standard"
- [ ] Calibrated tab active by default
- [ ] Modal has overlay preventing interaction with background

**Pass Criteria:** Modal opens with Calibrated tab active

---

### TC2.2: Calibrated Scale - Input Validation
**Steps:**
1. Open Scale modal (Calibrated tab)
2. Enter values:
   - Feet: 20
   - Inches: 6
   - Fraction: 0.5
3. Enable "Show Dimension Line" toggle

**Expected:**
- [ ] All inputs accept numeric values
- [ ] Fraction accepts decimal values
- [ ] Toggle switches to enabled state (visual feedback)
- [ ] "Set" button becomes enabled when distance > 0

**Pass Criteria:** All inputs work correctly, toggle functions

---

### TC2.3: Calibrated Scale - Two-Point Capture
**Steps:**
1. Enter known distance: 20 feet, 0 inches, 0 fraction
2. Enable "Show Dimension Line"
3. Click "Set" button
4. Click point (100, 100) on PDF
5. Move mouse to (500, 100)
6. Click second point

**Expected:**
- [ ] Cursor changes to crosshair after clicking Set
- [ ] Temporary dimension line appears after first click
- [ ] Line follows mouse cursor
- [ ] Live distance displayed (400 pixels)
- [ ] After second click, scale calculated and stored
- [ ] Modal closes
- [ ] Dimension line persists on page (if toggle enabled)
- [ ] Scale shows in scale indicator: "20'"

**Pass Criteria:** Two-point capture works, scale calculated correctly (400px / 20ft = 20 pxPerFoot)

---

### TC2.4: Calibrated Scale - Per-Page Storage
**Steps:**
1. Set calibrated scale on page 0: 20 feet
2. Navigate to page 1
3. Observe scale indicator
4. Set different scale on page 1: 30 feet
5. Navigate back to page 0

**Expected:**
- [ ] Page 1 shows "No scale set" initially
- [ ] After setting page 1 scale, it shows "30'"
- [ ] Returning to page 0 shows original "20'" scale
- [ ] Each page maintains independent scale

**Pass Criteria:** Scales stored independently per page

---

### TC2.5: Calibrated Scale - Dimension Line Visibility
**Steps:**
1. Set calibrated scale with "Show Dimension Line" enabled
2. Observe calibration line on page
3. Toggle "Show Dimension Line" off
4. Recalibrate or update scale

**Expected:**
- [ ] Dimension line visible when toggle enabled
- [ ] Dimension line displays measurement label
- [ ] Line drawn between exact calibration points
- [ ] Line color distinct from measurements (e.g., green)
- [ ] Dimension line hides when toggle disabled

**Pass Criteria:** Dimension line visibility controlled by toggle

---

## Test Suite 3: Scale Tool - Standard Mode

### TC3.1: Standard Scale - Preset Selection
**Steps:**
1. Open Scale modal
2. Click "Standard" tab
3. Observe preset dropdown

**Expected:**
- [ ] Standard tab becomes active
- [ ] Dropdown shows 9 architectural presets:
  - 1/16" = 1'-0"
  - 3/32" = 1'-0"
  - 1/8" = 1'-0"
  - 3/16" = 1'-0"
  - 1/4" = 1'-0"
  - 3/8" = 1'-0"
  - 1/2" = 1'-0"
  - 3/4" = 1'-0"
  - 1" = 1'-0"
- [ ] Dropdown scrollable
- [ ] Clear labels

**Pass Criteria:** All 9 presets available in dropdown

---

### TC3.2: Standard Scale - Apply to Current Page
**Steps:**
1. On page 0, select Standard tab
2. Choose "1/4\" = 1'-0\"" from dropdown
3. Leave "Apply to all plan sheets" toggle OFF
4. Click "Set"
5. Navigate to page 1

**Expected:**
- [ ] Scale set on page 0 immediately
- [ ] Scale indicator shows "Standard (1/4\" = 1'-0\")"
- [ ] Page 1 still shows "No scale set"
- [ ] Only page 0 affected

**Pass Criteria:** Scale applies to current page only

---

### TC3.3: Standard Scale - Apply to All Pages
**Steps:**
1. On page 0, select Standard tab
2. Choose "1/4\" = 1'-0\"" from dropdown
3. Enable "Apply to all plan sheets" toggle
4. Click "Set"
5. Navigate to pages 1, 2, 3

**Expected:**
- [ ] Toggle enables successfully
- [ ] After clicking Set, all pages have same scale
- [ ] Scale indicator shows same value on all pages
- [ ] No page-specific pageIndex in scale model

**Pass Criteria:** Scale applies to all pages when toggle enabled

---

## Test Suite 4: Area Tool

### TC4.1: Area Tool - Popover Options
**Steps:**
1. Click Area tool button

**Expected:**
- [ ] Popover opens above Area button
- [ ] Three options visible:
  - "Two Points" with Square icon
  - "Multi Point" with PenTool icon
  - "Oval" with Circle icon
- [ ] Options have hover effect
- [ ] Clear text labels

**Pass Criteria:** Popover shows 3 area modes

---

### TC4.2: Area Tool - Two Points Mode
**Steps:**
1. Open Area popover, select "Two Points"
2. Click point (100, 100) on PDF
3. Click point (300, 300)

**Expected:**
- [ ] Popover closes on mode selection
- [ ] First click starts rectangle
- [ ] Mouse move shows preview rectangle
- [ ] Live square footage displayed during draw
- [ ] Second click finalizes rectangle
- [ ] Rectangle area = 200px × 200px
- [ ] If scale is 20 pxPerFoot: Area = (200/20) × (200/20) = 100 sq ft
- [ ] Measurement appears in items panel with calculated area

**Pass Criteria:** Rectangle created, area calculated correctly

---

### TC4.3: Area Tool - Multi Point Mode
**Steps:**
1. Open Area popover, select "Multi Point"
2. Click points to form polygon: (100,100), (300,100), (300,300), (100,300)
3. Double-click on last point

**Expected:**
- [ ] Each click adds vertex
- [ ] Polygon outline follows mouse
- [ ] Live area value displayed
- [ ] Double-click closes polygon
- [ ] Final area calculated using shoelace formula
- [ ] Polygon auto-closed between last and first point

**Pass Criteria:** Polygon created with double-click finish, area calculated

---

### TC4.4: Area Tool - Oval Mode
**Steps:**
1. Open Area popover, select "Oval"
2. Click center point (200, 200)
3. Drag to (300, 250)
4. Release mouse

**Expected:**
- [ ] Click sets ellipse center
- [ ] Drag defines ellipse radii
- [ ] Live area displayed
- [ ] Release finalizes ellipse
- [ ] Ellipse area = π × radiusX × radiusY
- [ ] Ellipse visually smooth

**Pass Criteria:** Ellipse created, area calculated correctly

---

### TC4.5: Area Tool - Snapping
**Steps:**
1. Create first area measurement
2. Create second area measurement near first
3. Click near endpoint of first measurement

**Expected:**
- [ ] Green snap indicator appears when within 10px of existing point
- [ ] Point snaps to existing endpoint
- [ ] Snapped point coordinates match exactly
- [ ] Snap threshold consistent

**Pass Criteria:** Snapping works to existing endpoints

---

## Test Suite 5: Linear Tool

### TC5.1: Linear Tool - Line Mode
**Steps:**
1. Open Linear popover, select "Line"
2. Click point (100, 100)
3. Click point (500, 100)

**Expected:**
- [ ] Straight line drawn between points
- [ ] Live length displayed during draw
- [ ] Length = 400px = 20 ft (at 20 pxPerFoot scale)
- [ ] Line thickness consistent
- [ ] Measurement saved with correct length

**Pass Criteria:** Simple two-point line created

---

### TC5.2: Linear Tool - Curve Mode
**Steps:**
1. Open Linear popover, select "Curve"
2. Click and hold at point (100, 100)
3. Drag in curved path to (500, 300)
4. Release mouse

**Expected:**
- [ ] Path sampled during drag (~20ms intervals)
- [ ] Smooth curve follows mouse
- [ ] Live length updates continuously
- [ ] Curve stored as series of points
- [ ] Total length calculated from point-to-point segments

**Pass Criteria:** Freeform curve captured smoothly

---

### TC5.3: Linear Tool - Segment Mode
**Steps:**
1. Open Linear popover, select "Segment"
2. Click multiple points: (100,100), (200,100), (200,200), (300,200)
3. Double-click final point

**Expected:**
- [ ] Each click adds segment
- [ ] Polyline grows with each click
- [ ] Live total length displayed
- [ ] Double-click or Enter finalizes
- [ ] Total length = sum of all segments

**Pass Criteria:** Multi-segment polyline created

---

## Test Suite 6: Count Tool

### TC6.1: Count Tool - Multi Point Mode
**Steps:**
1. Open Count popover, select "Multi Point"
2. Click 5 different locations on PDF
3. Press Esc

**Expected:**
- [ ] Each click places numbered marker (1, 2, 3, 4, 5)
- [ ] Markers have gold/yellow background
- [ ] Number clearly visible inside marker
- [ ] Count total = 5
- [ ] Esc finalizes count measurement
- [ ] Summary panel shows "Count: 5"

**Pass Criteria:** 5 markers placed, numbered correctly

---

### TC6.2: Count Tool - Marker Dragging
**Steps:**
1. Create count measurement with 3 markers
2. Select measurement
3. Drag individual markers

**Expected:**
- [ ] Markers draggable
- [ ] Dragged marker maintains number
- [ ] Other markers unaffected
- [ ] Count total unchanged
- [ ] Position updates saved

**Pass Criteria:** Markers individually draggable

---

### TC6.3: Count Tool - Group Totals
**Steps:**
1. Create count measurement with symbol "outlet" (5 markers)
2. Create count measurement with symbol "light" (3 markers)
3. View summary panel

**Expected:**
- [ ] Total count = 8
- [ ] Breakdown by symbol:
  - "outlet": 5
  - "light": 3
- [ ] Each symbol group labeled distinctly

**Pass Criteria:** Counts grouped by symbol type

---

## Test Suite 7: Wall Area Tool

### TC7.1: Wall Area - Basic Trace
**Steps:**
1. Set scale: 20 pxPerFoot
2. Click Wall Area tool
3. Click points: (100,100), (300,100), (300,300)
4. Press Enter
5. Enter height: 9 feet

**Expected:**
- [ ] Polyline traced on wall
- [ ] Height prompt appears
- [ ] Length calculation:
  - Segment 1: 200px = 10 ft
  - Segment 2: 200px = 10 ft
  - Total: 20 ft
- [ ] Area = 20 ft × 9 ft = 180 sq ft
- [ ] Measurement shows both length and area

**Pass Criteria:** Wall area = length × height calculated correctly

---

### TC7.2: Wall Area - Default Height
**Steps:**
1. Configure project default wall height = 9 ft
2. Create wall area measurement
3. Observe height value

**Expected:**
- [ ] Height prompt pre-filled with 9 ft
- [ ] User can accept or change
- [ ] Default used if Enter pressed without change

**Pass Criteria:** Default height applied

---

## Test Suite 8: Slope Tool

### TC8.1: Slope - Basic Measurement
**Steps:**
1. Set scale: 20 pxPerFoot
2. Click Slope tool
3. Click point (100, 400)
4. Click point (400, 200)

**Expected:**
- [ ] Horizontal run: 300px = 15 ft
- [ ] Vertical rise: 200px = 10 ft
- [ ] Slope % = (10/15) × 100 = 66.67%
- [ ] Pitch = (10/15) × 12 = 8:12
- [ ] Display shows: "Rise: 10.00' Run: 15.00' Slope: 66.7% Pitch: 8.00:12"

**Pass Criteria:** Slope calculated correctly with all formats

---

### TC8.2: Slope - Live Display
**Steps:**
1. Click Slope tool
2. Click first point
3. Move mouse slowly toward second point
4. Observe display

**Expected:**
- [ ] Rise/run values update in real-time
- [ ] Slope % updates continuously
- [ ] Pitch format updates
- [ ] Display smooth, no flickering

**Pass Criteria:** Live display updates smoothly

---

## Test Suite 9: Volume Tool

### TC9.1: Volume - Slab Calculation
**Steps:**
1. Set scale: 20 pxPerFoot
2. Click Volume tool, select "slab"
3. Draw area: 400px × 400px square
4. Enter height: 0.33 feet (4 inches)

**Expected:**
- [ ] Area = (400/20) × (400/20) = 400 sq ft
- [ ] Volume = 400 × 0.33 = 132 cu ft
- [ ] Volume in yards = 132 / 27 = 4.89 cu yd
- [ ] Both units displayed

**Pass Criteria:** Volume calculated in cu ft and cu yd

---

### TC9.2: Volume - Type Selection
**Steps:**
1. Create volume measurements with different types:
   - Slab
   - Fill
   - Excavation
   - Custom

**Expected:**
- [ ] All four types available
- [ ] Type stored in measurement
- [ ] Types shown in items panel
- [ ] Totals grouped by type

**Pass Criteria:** Volume types differentiated

---

## Test Suite 10: Subtract Tool

### TC10.1: Subtract - Basic Operation
**Steps:**
1. Create source area: 400px × 400px = 400 sq ft
2. Create subtract area inside: 100px × 100px = 25 sq ft
3. Click Subtract tool
4. Click source area
5. Click subtract area
6. Press Enter

**Expected:**
- [ ] Source highlighted in green
- [ ] Subtractor highlighted in red
- [ ] Preview shows result area in blue
- [ ] Result area = 400 - 25 = 375 sq ft
- [ ] Original measurements unchanged
- [ ] New SubtractMeasurement created
- [ ] Result geometry calculated

**Pass Criteria:** Non-destructive subtraction, preview shown, correct result

---

### TC10.2: Subtract - Multiple Subtractors
**Steps:**
1. Create source area: 500 sq ft
2. Create three subtract areas: 20, 30, 50 sq ft
3. Subtract tool: select source, then all three subtractors
4. Press Enter

**Expected:**
- [ ] All three subtractors highlighted
- [ ] Preview shows final result
- [ ] Result = 500 - 20 - 30 - 50 = 400 sq ft
- [ ] All three IDs stored in subtractIds array

**Pass Criteria:** Multiple subtractions work correctly

---

## Test Suite 11: Markup Tool

### TC11.1: Markup - Text Annotation
**Steps:**
1. Open Markup popover, select "Text"
2. Click location (200, 200)
3. Enter text: "Main entrance"

**Expected:**
- [ ] Text input appears at click location
- [ ] User can type text
- [ ] Text saved as markup measurement
- [ ] Text visible on canvas
- [ ] Text editable after creation

**Pass Criteria:** Text annotation created and editable

---

### TC11.2: Markup - Freehand Draw
**Steps:**
1. Open Markup popover, select "Draw"
2. Click and drag to draw arrow or shape
3. Release

**Expected:**
- [ ] Freehand path follows mouse
- [ ] Stroke smooth and clean
- [ ] Multiple strokes possible in single markup
- [ ] Stroke width consistent
- [ ] Color customizable

**Pass Criteria:** Freehand drawing captured

---

### TC11.3: Markup - Legend Auto-Generation
**Steps:**
1. Create 3 different measurements (area, linear, count)
2. Open Markup popover, select "Legend"
3. Click location for legend

**Expected:**
- [ ] Legend box appears at click location
- [ ] Lists all visible measurements
- [ ] Shows measurement type, label, and value
- [ ] Color-coded by layer/type
- [ ] Auto-updates when measurements change

**Pass Criteria:** Legend generated with all measurements

---

## Test Suite 12: Export/Download Tool

### TC12.1: Export - CSV Format
**Steps:**
1. Create multiple measurements (5+ different types)
2. Open Download popover, select "CSV"
3. Download file

**Expected:**
- [ ] CSV file downloads immediately
- [ ] Filename includes project ID and timestamp
- [ ] CSV contains headers: id, type, pageIndex, scaleId, geometry, value, units, label, createdAt
- [ ] All visible measurements included
- [ ] Hidden measurements excluded
- [ ] Values match expected calculations
- [ ] Opens correctly in Excel/Sheets

**Pass Criteria:** CSV exports with all required fields

---

### TC12.2: Export - Image Snapshot
**Steps:**
1. Navigate to page with measurements
2. Zoom to specific area
3. Open Download popover, select "Image Snapshot"
4. Download file

**Expected:**
- [ ] PNG image downloads
- [ ] Image shows current viewport exactly
- [ ] Measurements visible in image
- [ ] Filename includes timestamp
- [ ] Resolution appropriate (matches canvas)
- [ ] Hidden measurements not in image

**Pass Criteria:** Image captures current view

---

### TC12.3: Export - Annotated PDF
**Steps:**
1. Create measurements on multiple pages
2. Open Download popover, select "Annotated PDF"
3. Download file

**Expected:**
- [ ] PDF file downloads
- [ ] Original PDF preserved
- [ ] Measurements overlaid on each page
- [ ] Dimension lines visible
- [ ] Labels readable
- [ ] File size reasonable
- [ ] Opens in PDF reader

**Pass Criteria:** PDF exports with annotations (Note: Requires pdf-lib implementation)

---

## Test Suite 13: Undo/Redo

### TC13.1: Undo Measurement Creation
**Steps:**
1. Create area measurement
2. Note measurement count
3. Click Undo button (or Ctrl+Z)

**Expected:**
- [ ] Measurement disappears from canvas
- [ ] Measurement removed from items panel
- [ ] Measurement count decrements
- [ ] Canvas redraws without measurement

**Pass Criteria:** Undo removes measurement

---

### TC13.2: Redo Measurement Creation
**Steps:**
1. Create and undo measurement
2. Click Redo button (or Ctrl+Y)

**Expected:**
- [ ] Measurement reappears
- [ ] Same ID as original
- [ ] Same position and values
- [ ] Items panel updated

**Pass Criteria:** Redo restores measurement

---

### TC13.3: Undo/Redo Multiple Operations
**Steps:**
1. Create 5 measurements
2. Delete 2 measurements
3. Undo 3 times
4. Redo 2 times

**Expected:**
- [ ] Each undo reverses one operation
- [ ] State matches expected at each step
- [ ] Redo moves forward correctly
- [ ] History stack maintains order
- [ ] No errors in console

**Pass Criteria:** Multiple undo/redo operations work correctly

---

## Test Suite 14: Measurement Properties

### TC14.1: Lock Measurement
**Steps:**
1. Create measurement
2. Select measurement
3. Click lock icon in items panel
4. Attempt to drag or edit

**Expected:**
- [ ] Lock icon changes to locked state
- [ ] Measurement cannot be dragged
- [ ] Control points not editable
- [ ] Delete button disabled
- [ ] Can still be selected and viewed

**Pass Criteria:** Locked measurements cannot be edited

---

### TC14.2: Hide Measurement
**Steps:**
1. Create measurement
2. Toggle visibility off
3. Observe canvas

**Expected:**
- [ ] Measurement disappears from canvas
- [ ] Still listed in items panel (grayed out)
- [ ] Eye icon shows "hidden" state
- [ ] Not included in summary totals
- [ ] Not included in exports

**Pass Criteria:** Hidden measurements not visible or counted

---

## Test Suite 15: Cross-Page Behavior

### TC15.1: Measurements Locked to Page
**Steps:**
1. Create measurement on page 0
2. Navigate to page 1
3. Observe canvas

**Expected:**
- [ ] Page 0 measurement not visible on page 1
- [ ] Items panel only shows page 1 measurements
- [ ] Summary totals only for current page
- [ ] No cross-page rendering

**Pass Criteria:** Measurements strictly per-page

---

### TC15.2: Scale Independence
**Steps:**
1. Set scale on page 0: 20 pxPerFoot
2. Create measurement on page 0: should use scale
3. Navigate to page 1 (no scale set)
4. Create measurement on page 1

**Expected:**
- [ ] Page 0 measurement shows values in feet
- [ ] Page 1 measurement shows "No scale" warning or pixel values
- [ ] Each measurement stores its scaleId
- [ ] Changing page 0 scale doesn't affect page 1

**Pass Criteria:** Per-page scale independence maintained

---

## Summary Report Template

```
Test Execution Date: __________
Tester Name: __________
Build Version: __________

Total Tests: 75
Passed: ____ / 75
Failed: ____ / 75
Blocked: ____ / 75

Critical Issues: ____
Major Issues: ____
Minor Issues: ____

Overall Status: PASS / FAIL / BLOCKED

Notes:
___________________________________
___________________________________
```

## Critical Pass Criteria

For production release, ALL of the following MUST pass:
- [ ] Toolbar renders with all 10 tools
- [ ] Scale calibration works (both modes)
- [ ] Area, Linear, Count tools create measurements
- [ ] Measurements calculate correctly with scales
- [ ] Undo/Redo functions without errors
- [ ] CSV export contains correct data
- [ ] No console errors during normal operation
- [ ] Measurements locked to correct page
- [ ] Build completes without errors
- [ ] No security vulnerabilities (CodeQL)
