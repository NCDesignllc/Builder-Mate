import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Measurement, Point, TakeoffTool, TakeoffScale } from "./types";
import { uuid } from "./geometry";
import { snapAngle, near } from "./snap";
import { hitTestMeasurementWorld } from "./hitTest";
import { computeMeasurement } from "./measurementMath";

type Props = {
  tool: TakeoffTool;
  measurements: Measurement[];
  pageIndex: number;
  scale: TakeoffScale | null;
  width: number;
  height: number;
  zoom: number; // visual zoom level
  labelsVisible?: boolean;
  onAddMeasurement: (m: Measurement) => void;
  onUpdateMeasurement: (id: string, patch: Partial<Measurement>) => void;
  onDeleteMeasurement: (id: string) => void;
  onScaleCalibration?: (pixelDistance: number) => void; // Triggered when scale tool completes
};

type DrawingState = {
  kind: "measure" | "area" | "count" | "scale";
  points: Point[];
  tempPoint?: Point; // for preview while mouse is moving
};

/**
 * InteractiveCanvas
 * Renders measurements as SVG overlay and handles user interaction for:
 * - Creating measurements (measure, area, count)
 * - Editing measurements (select, move points)
 * - Scale calibration
 */
export function InteractiveCanvas({
  tool,
  measurements,
  pageIndex,
  scale,
  width,
  height,
  zoom,
  labelsVisible = true,
  onAddMeasurement,
  onUpdateMeasurement,
  onDeleteMeasurement,
  onScaleCalibration,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  // Current drawing in progress
  const [drawing, setDrawing] = useState<DrawingState | null>(null);
  
  // Selection state
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dragPointIndex, setDragPointIndex] = useState<number | null>(null);
  
  // Snapping state
  const [shiftHeld, setShiftHeld] = useState(false);
  
  // Filter measurements for current page only
  const visibleMeasurements = measurements.filter(m => m.pageIndex === pageIndex);
  
  // Keyboard handlers for snapping
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(true);
      if (e.key === "Escape") {
        setDrawing(null);
        setSelectedId(null);
        setDragPointIndex(null);
      }
      if (e.key === "Backspace" && drawing && drawing.points.length > 0) {
        e.preventDefault();
        setDrawing({ ...drawing, points: drawing.points.slice(0, -1) });
      }
      if (e.key === "Delete" && selectedId) {
        e.preventDefault();
        onDeleteMeasurement(selectedId);
        setSelectedId(null);
      }
    };
    
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftHeld(false);
    };
    
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [drawing, selectedId, onDeleteMeasurement]);
  
  // Get SVG coordinates from mouse event
  const getPoint = useCallback((e: React.MouseEvent<SVGSVGElement>): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  }, [zoom]);
  
  // Snap to nearby endpoints
  const snapToEndpoint = useCallback((p: Point): Point => {
    const threshold = 10 / zoom; // 10px in screen space
    
    // Check all measurement endpoints
    for (const m of visibleMeasurements) {
      for (const pt of m.points) {
        if (near(p, pt, threshold)) return pt;
      }
    }
    
    // Check drawing points
    if (drawing) {
      for (const pt of drawing.points) {
        if (near(p, pt, threshold)) return pt;
      }
    }
    
    return p;
  }, [visibleMeasurements, drawing, zoom]);
  
  // Handle mouse down - start drawing or select
  const onMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (tool === "pan") return;
    
    const point = getPoint(e);
    
    if (tool === "select") {
      // Check if clicking on an existing measurement
      const hitId = hitTestMeasurementWorld(visibleMeasurements, point, 8 / zoom);
      setSelectedId(hitId);
      
      if (hitId) {
        // Check if clicking on a point
        const m = visibleMeasurements.find(m => m.id === hitId);
        if (m) {
          const threshold = 8 / zoom;
          const pointIndex = m.points.findIndex(pt => near(point, pt, threshold));
          if (pointIndex >= 0) {
            setDragPointIndex(pointIndex);
          }
        }
      }
      return;
    }
    
    if (tool === "measure" || tool === "scale") {
      // Start line measurement
      const snapped = snapToEndpoint(point);
      setDrawing({ kind: tool === "measure" ? "measure" : "scale", points: [snapped] });
      return;
    }
    
    if (tool === "area") {
      // Start polygon
      const snapped = snapToEndpoint(point);
      if (!drawing) {
        setDrawing({ kind: "area", points: [snapped] });
      } else {
        // Add point to polygon
        setDrawing({ ...drawing, points: [...drawing.points, snapped] });
      }
      return;
    }
    
    if (tool === "count") {
      // Single-click count marker
      const m: Measurement = {
        id: uuid("count"),
        kind: "count",
        points: [point],
        pageIndex,
        createdAt: Date.now(),
      };
      onAddMeasurement(m);
      return;
    }
  }, [tool, visibleMeasurements, drawing, pageIndex, zoom, getPoint, snapToEndpoint, onAddMeasurement]);
  
  // Handle mouse move - preview, snap, drag
  const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const point = getPoint(e);
    
    // Update hover state for select tool
    if (tool === "select") {
      const hitId = hitTestMeasurementWorld(visibleMeasurements, point, 8 / zoom);
      setHoveredId(hitId);
      
      // Handle point dragging
      if (dragPointIndex !== null && selectedId) {
        const m = visibleMeasurements.find(m => m.id === selectedId);
        if (m) {
          const newPoints = [...m.points];
          newPoints[dragPointIndex] = point;
          onUpdateMeasurement(selectedId, { points: newPoints });
        }
      }
      return;
    }
    
    // Update temp point for drawing preview
    if (drawing) {
      let snapped = snapToEndpoint(point);
      
      // Apply angle snapping if shift is held and we have at least one point
      if (shiftHeld && drawing.points.length > 0) {
        const origin = drawing.points[drawing.points.length - 1];
        snapped = snapAngle(origin, snapped);
      }
      
      setDrawing({ ...drawing, tempPoint: snapped });
    }
  }, [tool, visibleMeasurements, drawing, selectedId, dragPointIndex, shiftHeld, zoom, getPoint, snapToEndpoint, onUpdateMeasurement]);
  
  // Handle mouse up - complete line or end drag
  const onMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (dragPointIndex !== null) {
      setDragPointIndex(null);
      return;
    }
    
    if (!drawing) return;
    
    const point = getPoint(e);
    let snapped = snapToEndpoint(point);
    
    // Apply angle snapping if shift is held
    if (shiftHeld && drawing.points.length > 0) {
      const origin = drawing.points[drawing.points.length - 1];
      snapped = snapAngle(origin, snapped);
    }
    
    if (drawing.kind === "measure" || drawing.kind === "scale") {
      // Complete line measurement
      if (drawing.points.length === 1) {
        if (drawing.kind === "measure") {
          const m: Measurement = {
            id: uuid("measure"),
            kind: "length",
            points: [drawing.points[0], snapped],
            pageIndex,
            createdAt: Date.now(),
          };
          onAddMeasurement(m);
        } else {
          // For scale, calculate pixel distance and trigger calibration
          const dx = snapped.x - drawing.points[0].x;
          const dy = snapped.y - drawing.points[0].y;
          const pixelDistance = Math.sqrt(dx * dx + dy * dy);
          
          if (onScaleCalibration) {
            onScaleCalibration(pixelDistance);
          }
        }
        
        setDrawing(null);
      }
    }
  }, [drawing, shiftHeld, pageIndex, dragPointIndex, getPoint, snapToEndpoint, onAddMeasurement]);
  
  // Handle double-click - complete polygon
  const onDoubleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    
    if (drawing && drawing.kind === "area" && drawing.points.length >= 3) {
      const m: Measurement = {
        id: uuid("area"),
        kind: "area",
        points: drawing.points,
        pageIndex,
        createdAt: Date.now(),
      };
      onAddMeasurement(m);
      setDrawing(null);
    }
  }, [drawing, pageIndex, onAddMeasurement]);
  
  // Render a measurement
  const renderMeasurement = useCallback((m: Measurement) => {
    const isSelected = m.id === selectedId;
    const isHovered = m.id === hoveredId;
    const strokeWidth = 2 / zoom;
    const pointRadius = 4 / zoom;
    
    const color = m.color || (m.kind === "length" ? "#3b82f6" : m.kind === "area" ? "#10b981" : "#f59e0b");
    const opacity = isSelected ? 1 : isHovered ? 0.9 : 0.7;
    
    if (m.kind === "count") {
      // Render count marker
      return (
        <g key={m.id}>
          <circle
            cx={m.points[0].x}
            cy={m.points[0].y}
            r={8 / zoom}
            fill={color}
            fillOpacity={opacity}
            stroke="white"
            strokeWidth={strokeWidth}
          />
          {labelsVisible && (
            <text
              x={m.points[0].x}
              y={m.points[0].y - 12 / zoom}
              fontSize={12 / zoom}
              fill={color}
              textAnchor="middle"
              fontWeight="bold"
            >
              {m.label || "1"}
            </text>
          )}
        </g>
      );
    }
    
    if (m.kind === "length" && m.points.length >= 2) {
      const [p1, p2] = m.points;
      const computed = computeMeasurement(m, scale);
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      
      return (
        <g key={m.id}>
          <line
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeOpacity={opacity}
          />
          {isSelected && m.points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={pointRadius}
              fill="white"
              stroke={color}
              strokeWidth={strokeWidth}
            />
          ))}
          {labelsVisible && computed.value !== null && (
            <text
              x={midX}
              y={midY - 8 / zoom}
              fontSize={12 / zoom}
              fill={color}
              textAnchor="middle"
              fontWeight="bold"
              stroke="white"
              strokeWidth={0.5 / zoom}
              paintOrder="stroke"
            >
              {computed.value.toFixed(2)} {computed.unitLabel}
            </text>
          )}
        </g>
      );
    }
    
    if (m.kind === "area" && m.points.length >= 3) {
      const computed = computeMeasurement(m, scale);
      const pathD = m.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
      
      // Calculate centroid for label
      const centroidX = m.points.reduce((sum, p) => sum + p.x, 0) / m.points.length;
      const centroidY = m.points.reduce((sum, p) => sum + p.y, 0) / m.points.length;
      
      return (
        <g key={m.id}>
          <path
            d={pathD}
            fill={color}
            fillOpacity={0.2 * opacity}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeOpacity={opacity}
          />
          {isSelected && m.points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={pointRadius}
              fill="white"
              stroke={color}
              strokeWidth={strokeWidth}
            />
          ))}
          {labelsVisible && computed.value !== null && (
            <text
              x={centroidX}
              y={centroidY}
              fontSize={12 / zoom}
              fill={color}
              textAnchor="middle"
              fontWeight="bold"
              stroke="white"
              strokeWidth={0.5 / zoom}
              paintOrder="stroke"
            >
              {computed.value.toFixed(2)} {computed.unitLabel}
            </text>
          )}
        </g>
      );
    }
    
    return null;
  }, [selectedId, hoveredId, scale, labelsVisible, zoom]);
  
  // Render drawing in progress
  const renderDrawing = useCallback(() => {
    if (!drawing) return null;
    
    const color = drawing.kind === "measure" || drawing.kind === "scale" ? "#3b82f6" : "#10b981";
    const strokeWidth = 2 / zoom;
    const pointRadius = 4 / zoom;
    
    if (drawing.kind === "measure" || drawing.kind === "scale") {
      if (drawing.points.length === 1 && drawing.tempPoint) {
        return (
          <g>
            <line
              x1={drawing.points[0].x}
              y1={drawing.points[0].y}
              x2={drawing.tempPoint.x}
              y2={drawing.tempPoint.y}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${5 / zoom} ${3 / zoom}`}
              strokeOpacity={0.7}
            />
            <circle cx={drawing.points[0].x} cy={drawing.points[0].y} r={pointRadius} fill={color} />
            <circle cx={drawing.tempPoint.x} cy={drawing.tempPoint.y} r={pointRadius} fill={color} fillOpacity={0.5} />
          </g>
        );
      }
    }
    
    if (drawing.kind === "area") {
      const allPoints = drawing.tempPoint ? [...drawing.points, drawing.tempPoint] : drawing.points;
      if (allPoints.length < 2) return null;
      
      const pathD = allPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
      const closedPathD = allPoints.length >= 3 ? pathD + " Z" : pathD;
      
      return (
        <g>
          <path
            d={closedPathD}
            fill={color}
            fillOpacity={0.1}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${5 / zoom} ${3 / zoom}`}
            strokeOpacity={0.7}
          />
          {drawing.points.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r={pointRadius} fill={color} />
          ))}
          {drawing.tempPoint && (
            <circle cx={drawing.tempPoint.x} cy={drawing.tempPoint.y} r={pointRadius} fill={color} fillOpacity={0.5} />
          )}
        </g>
      );
    }
    
    return null;
  }, [drawing, zoom]);
  
  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-auto"
      style={{ width, height, transform: `scale(${zoom})`, transformOrigin: "0 0" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onDoubleClick={onDoubleClick}
    >
      {visibleMeasurements.map(renderMeasurement)}
      {renderDrawing()}
    </svg>
  );
}
