/**
 * Enhanced MeasurementCanvas with support for all measurement types
 * 
 * Adds support for:
 * - Wall Area tool
 * - Slope tool  
 * - Volume tool
 * - Enhanced Area modes (Two Points, Oval)
 * - Enhanced Linear modes (Line, Curve)
 * - Enhanced Count modes
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Point, Measurement, TakeoffTool, TakeoffScale } from './types';
import type { 
  WallAreaMeasurement, 
  SlopeMeasurement, 
  VolumeMeasurement,
  AreaMode,
  LinearMode,
  CountMode 
} from '../../types/measurements';
import { uuid } from './geometry';
import { smartSnap, snapAngle } from './snap';
import { computeMeasurement, formatNumber } from './measurementMath';
import { pixelsToFeet, calculateSlope } from '../../services/scaleUtils';

type Props = {
  width: number;
  height: number;
  tool: TakeoffTool;
  pageIndex: number;
  scale: TakeoffScale | null;
  measurements: Measurement[];
  onAddMeasurement: (m: Measurement) => void;
  onUpdateMeasurement: (id: string, patch: Partial<Measurement>) => void;
  selectedIds?: string[];
  onSelect?: (ids: string[]) => void;
  snapThreshold?: number;
  enableSnap?: boolean;
  layerColor?: string;
  // Enhanced modes
  areaMode?: AreaMode;
  linearMode?: LinearMode;
  countMode?: CountMode;
  defaultWallHeight?: number;
};

type DrawingState = 'idle' | 'drawing' | 'capturing';

export function MeasurementCanvasEnhanced({
  width,
  height,
  tool,
  pageIndex,
  scale,
  measurements,
  onAddMeasurement,
  onUpdateMeasurement,
  selectedIds = [],
  onSelect,
  snapThreshold = 10,
  enableSnap = true,
  layerColor = '#FFD700',
  areaMode = 'multiPoint',
  linearMode = 'segment',
  countMode = 'multiPoint',
  defaultWallHeight = 9,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>('idle');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);

  // Get canvas coordinates from mouse event
  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // Apply snapping if enabled
  const applySnap = useCallback((point: Point, shiftKey: boolean): Point => {
    if (!enableSnap && !shiftKey) return point;

    // Angle snap with Shift key
    if (shiftKey && currentPoints.length > 0) {
      const origin = currentPoints[currentPoints.length - 1];
      return snapAngle(origin, point, false);
    }

    // Smart snap to endpoints/intersections
    if (enableSnap) {
      const snapResult = smartSnap(point, measurements, snapThreshold, false);
      if (snapResult) return snapResult.point;
    }

    return point;
  }, [enableSnap, currentPoints, measurements, snapThreshold]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rawPoint = getCanvasPoint(e);
    const snappedPoint = applySnap(rawPoint, e.shiftKey);
    setMousePos(snappedPoint);

    // Update drag for oval mode
    if (isDragging && dragStart && tool === 'area' && areaMode === 'oval') {
      setCurrentPoints([dragStart, snappedPoint]);
    }

    // Check for hover (selection tool only)
    if (tool === 'select' && drawingState === 'idle') {
      const hovered = measurements.find((m) => {
        // @ts-ignore - handle both old and new measurement types
        if (m.kind === 'count' || m.type === 'count') {
          // @ts-ignore
          const pt = m.point || (m.points && m.points[0]);
          if (pt) {
            const dx = snappedPoint.x - pt.x;
            const dy = snappedPoint.y - pt.y;
            return Math.hypot(dx, dy) < 10;
          }
        }
        // Check if point is near any line segment
        // @ts-ignore - handle both old and new measurement types
        const points = m.points;
        if (points && Array.isArray(points)) {
          for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const dist = pointToSegmentDistance(snappedPoint, p1, p2);
            if (dist < 8) return true;
          }
        }
        return false;
      });
      setHoveredId(hovered?.id ?? null);
    }
  }, [getCanvasPoint, applySnap, tool, drawingState, measurements, isDragging, dragStart, areaMode]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only left click

    const point = getCanvasPoint(e);
    const snappedPoint = applySnap(point, e.shiftKey);

    if (tool === 'select') {
      // Handle selection
      if (hoveredId) {
        if (e.shiftKey && onSelect) {
          const newSelection = selectedIds.includes(hoveredId)
            ? selectedIds.filter((id) => id !== hoveredId)
            : [...selectedIds, hoveredId];
          onSelect(newSelection);
        } else if (onSelect) {
          onSelect([hoveredId]);
        }
      } else if (onSelect) {
        onSelect([]);
      }
      return;
    }

    // Oval mode - start drag
    if (tool === 'area' && areaMode === 'oval') {
      setIsDragging(true);
      setDragStart(snappedPoint);
      setCurrentPoints([snappedPoint]);
      setDrawingState('drawing');
      return;
    }

    // Count tool - single click placement for multiPoint mode
    if (tool === 'count' && countMode === 'multiPoint') {
      setCurrentPoints([...currentPoints, snappedPoint]);
      return;
    }

    // Start drawing for other tools
    if (tool === 'linear' || tool === 'area' || tool === 'wallArea' || tool === 'slope' || tool === 'volume') {
      setDrawingState('drawing');
      setCurrentPoints([snappedPoint]);
    }
  }, [tool, getCanvasPoint, applySnap, pageIndex, hoveredId, selectedIds, onSelect, areaMode, countMode, currentPoints]);

  // Handle mouse up
  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Oval mode - finish drag
    if (isDragging && tool === 'area' && areaMode === 'oval' && dragStart && currentPoints.length === 2) {
      const center = dragStart;
      const edge = currentPoints[1];
      const rx = Math.abs(edge.x - center.x);
      const ry = Math.abs(edge.y - center.y);
      
      // Create ellipse measurement
      const measurement: any = {
        id: uuid(),
        type: 'area',
        mode: 'oval',
        pageIndex,
        scaleId: null,
        points: [center, { x: center.x + rx, y: center.y + ry }], // Store as center + radii
        locked: false,
        visible: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      onAddMeasurement(measurement);
      setIsDragging(false);
      setDragStart(null);
      setCurrentPoints([]);
      setDrawingState('idle');
    }
  }, [isDragging, tool, areaMode, dragStart, currentPoints, pageIndex, onAddMeasurement]);

  // Handle click
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'count' || tool === 'select') return;
    if (drawingState !== 'drawing') return;

    const point = getCanvasPoint(e);
    const snappedPoint = applySnap(point, e.shiftKey);

    // Slope tool - two points only
    if (tool === 'slope') {
      if (currentPoints.length === 0) {
        setCurrentPoints([snappedPoint]);
      } else {
        // Second point - create slope measurement
        const pt1 = currentPoints[0];
        const dx = Math.abs(snappedPoint.x - pt1.x);
        const dy = Math.abs(snappedPoint.y - pt1.y);
        
        const runFt = scale ? pixelsToFeet(dx, { pxPerFoot: scale.pxPerUnit * 12 }) : 0;
        const riseFt = scale ? pixelsToFeet(dy, { pxPerFoot: scale.pxPerUnit * 12 }) : 0;
        const { percent, pitch } = calculateSlope(riseFt, runFt);
        
        const measurement: SlopeMeasurement = {
          id: uuid(),
          type: 'slope',
          pageIndex,
          scaleId: null,
          points: [pt1, snappedPoint],
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
        setDrawingState('idle');
      }
      return;
    }

    // Two Points rectangle mode for area
    if (tool === 'area' && areaMode === 'twoPoints') {
      if (currentPoints.length === 0) {
        setCurrentPoints([snappedPoint]);
      } else {
        // Second point - create rectangle
        const pt1 = currentPoints[0];
        const rectPoints = [
          pt1,
          { x: snappedPoint.x, y: pt1.y },
          snappedPoint,
          { x: pt1.x, y: snappedPoint.y },
        ];
        
        const measurement: any = {
          id: uuid(),
          type: 'area',
          mode: 'twoPoints',
          pageIndex,
          scaleId: null,
          points: rectPoints,
          locked: false,
          visible: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        onAddMeasurement(measurement);
        setCurrentPoints([]);
        setDrawingState('idle');
      }
      return;
    }

    // Line mode for linear - just two points
    if (tool === 'linear' && linearMode === 'line') {
      if (currentPoints.length === 0) {
        setCurrentPoints([snappedPoint]);
      } else {
        const measurement: any = {
          id: uuid(),
          type: 'linear',
          mode: 'line',
          pageIndex,
          scaleId: null,
          points: [currentPoints[0], snappedPoint],
          locked: false,
          visible: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        onAddMeasurement(measurement);
        setCurrentPoints([]);
        setDrawingState('idle');
      }
      return;
    }

    // Multi-point modes - add point
    setCurrentPoints([...currentPoints, snappedPoint]);
  }, [tool, drawingState, getCanvasPoint, applySnap, currentPoints, areaMode, linearMode, pageIndex, scale, onAddMeasurement]);

  // Handle double click (finish drawing)
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (drawingState !== 'drawing' || currentPoints.length < 2) return;

    if (tool === 'linear' && (linearMode === 'segment' || linearMode === 'curve')) {
      const measurement: any = {
        id: uuid(),
        type: 'linear',
        mode: linearMode,
        pageIndex,
        scaleId: null,
        points: currentPoints,
        locked: false,
        visible: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      onAddMeasurement(measurement);
    } else if (tool === 'area' && areaMode === 'multiPoint' && currentPoints.length >= 3) {
      const measurement: any = {
        id: uuid(),
        type: 'area',
        mode: 'multiPoint',
        pageIndex,
        scaleId: null,
        points: currentPoints,
        locked: false,
        visible: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      onAddMeasurement(measurement);
    } else if (tool === 'wallArea' && currentPoints.length >= 2) {
      // Prompt for height
      const heightStr = prompt('Enter wall height (feet):', String(defaultWallHeight));
      if (heightStr) {
        const height = parseFloat(heightStr);
        const measurement: WallAreaMeasurement = {
          id: uuid(),
          type: 'wallArea',
          pageIndex,
          scaleId: null,
          points: currentPoints,
          height,
          locked: false,
          visible: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        onAddMeasurement(measurement);
      }
    } else if (tool === 'volume' && currentPoints.length >= 3) {
      // Prompt for height
      const heightStr = prompt('Enter volume height/depth (feet):', '1');
      if (heightStr) {
        const height = parseFloat(heightStr);
        const measurement: VolumeMeasurement = {
          id: uuid(),
          type: 'volume',
          volumeType: 'slab',
          pageIndex,
          scaleId: null,
          areaPoints: currentPoints,
          height,
          locked: false,
          visible: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        onAddMeasurement(measurement);
      }
    }

    setDrawingState('idle');
    setCurrentPoints([]);
  }, [drawingState, currentPoints, tool, linearMode, areaMode, pageIndex, defaultWallHeight, onAddMeasurement]);

  // Handle Enter key (finish count or cancel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawingState === 'drawing') {
        setDrawingState('idle');
        setCurrentPoints([]);
        setIsDragging(false);
        setDragStart(null);
      } else if (e.key === 'Enter') {
        // Finish count measurement
        if (tool === 'count' && countMode === 'multiPoint' && currentPoints.length > 0) {
          const measurement: any = {
            id: uuid(),
            type: 'count',
            mode: countMode,
            pageIndex,
            scaleId: null,
            points: currentPoints,
            count: currentPoints.length,
            locked: false,
            visible: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          onAddMeasurement(measurement);
          setCurrentPoints([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawingState, tool, countMode, currentPoints, pageIndex, onAddMeasurement]);

  // Render canvas (simplified - keep existing rendering logic from original file)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Filter measurements for current page
    const pageMeasurements = measurements.filter((m) => {
      // @ts-ignore - handle both old and new types
      return m.pageIndex === pageIndex;
    });

    // Draw existing measurements (use original rendering logic)
    pageMeasurements.forEach((m) => {
      const isSelected = selectedIds.includes(m.id);
      const isHovered = hoveredId === m.id;
      
      ctx.strokeStyle = isSelected ? '#FF6600' : isHovered ? '#FFA500' : layerColor;
      ctx.fillStyle = isSelected ? '#FF6600' : isHovered ? '#FFA500' : layerColor;
      ctx.lineWidth = isSelected ? 3 : isHovered ? 2.5 : 2;

      // @ts-ignore - handle both old and new types
      const mType = m.kind || m.type;
      // @ts-ignore
      const points = m.points || (m.point ? [m.point] : []);

      if (mType === 'linear') {
        drawPolyline(ctx, points);
        points.forEach((p: Point) => drawVertex(ctx, p, isSelected || isHovered));
        
        if (points.length >= 2 && scale) {
          const computed = computeMeasurement(m, scale);
          // @ts-ignore
          if (computed.kind === 'linear' && computed.value) {
            const midPoint = getMidPoint(points);
            // @ts-ignore
            drawLabel(ctx, midPoint, `${formatNumber(computed.value, 2)} ${computed.unitLabel}`);
          }
        }
      } else if (mType === 'area') {
        drawPolygon(ctx, points);
        points.forEach((p: Point) => drawVertex(ctx, p, isSelected || isHovered));
        
        if (points.length >= 3 && scale) {
          const computed = computeMeasurement(m, scale);
          // @ts-ignore
          if (computed.kind === 'area' && computed.value) {
            const center = getPolygonCenter(points);
            // @ts-ignore
            drawLabel(ctx, center, `${formatNumber(computed.value, 2)} ${computed.unitLabel}`);
          }
        }
      } else if (mType === 'count') {
        // @ts-ignore
        const pt = m.point || points[0];
        // @ts-ignore
        if (pt) drawCountMarker(ctx, pt, m.count || 1, isSelected || isHovered);
      } else if (mType === 'wallArea') {
        drawPolyline(ctx, points);
        points.forEach((p: Point) => drawVertex(ctx, p, isSelected || isHovered));
        // @ts-ignore
        if (m.areaSqFt) {
          const midPoint = getMidPoint(points);
          // @ts-ignore
          drawLabel(ctx, midPoint, `${m.areaSqFt.toFixed(1)} sq ft`);
        }
      } else if (mType === 'slope') {
        if (points.length === 2) {
          drawPolyline(ctx, points);
          points.forEach((p: Point) => drawVertex(ctx, p, isSelected || isHovered));
          // @ts-ignore
          if (m.slopePercent !== undefined) {
            const midPoint = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 };
            // @ts-ignore
            drawLabel(ctx, midPoint, `${m.slopePercent.toFixed(1)}% (${m.pitch || ''})`);
          }
        }
      } else if (mType === 'volume') {
        // @ts-ignore
        const volPoints = m.areaPoints || points;
        drawPolygon(ctx, volPoints);
        volPoints.forEach((p: Point) => drawVertex(ctx, p, isSelected || isHovered));
        // @ts-ignore
        if (m.volumeCuYd) {
          const center = getPolygonCenter(volPoints);
          // @ts-ignore
          drawLabel(ctx, center, `${m.volumeCuYd.toFixed(2)} cu yd`);
        }
      }
    });

    // Draw current drawing in progress
    if (drawingState === 'drawing' && currentPoints.length > 0 && mousePos) {
      ctx.strokeStyle = layerColor;
      ctx.fillStyle = layerColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      const previewPoints = [...currentPoints, mousePos];
      
      if (tool === 'linear' || tool === 'wallArea') {
        drawPolyline(ctx, previewPoints);
      } else if (tool === 'area' && areaMode !== 'oval') {
        drawPolygon(ctx, previewPoints);
      } else if (tool === 'area' && areaMode === 'oval' && currentPoints.length === 2) {
        // Draw ellipse preview
        const center = currentPoints[0];
        const edge = currentPoints[1];
        const rx = Math.abs(edge.x - center.x);
        const ry = Math.abs(edge.y - center.y);
        ctx.beginPath();
        ctx.ellipse(center.x, center.y, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === 'slope' && currentPoints.length === 1) {
        drawPolyline(ctx, [currentPoints[0], mousePos]);
      } else if (tool === 'volume') {
        drawPolygon(ctx, previewPoints);
      }

      ctx.setLineDash([]);
      
      // Draw vertices
      currentPoints.forEach((p) => drawVertex(ctx, p, true));
    }

    // Draw snap indicator
    if (mousePos && enableSnap && tool !== 'select') {
      const snapResult = smartSnap(mousePos, pageMeasurements, snapThreshold, false);
      if (snapResult) {
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(snapResult.point.x, snapResult.point.y, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [width, height, measurements, pageIndex, currentPoints, mousePos, drawingState, selectedIds, hoveredId, tool, scale, enableSnap, snapThreshold, layerColor, areaMode, linearMode]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        cursor: tool === 'pan' ? 'grab' : tool === 'select' ? 'default' : 'crosshair',
        pointerEvents: tool === 'pan' ? 'none' : 'auto',
      }}
    />
  );
}

// Helper drawing functions (reuse from original)
function drawPolyline(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

function drawPolygon(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.globalAlpha = 0.2;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.stroke();
}

function drawVertex(ctx: CanvasRenderingContext2D, point: Point, highlighted: boolean) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, highlighted ? 5 : 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawCountMarker(ctx: CanvasRenderingContext2D, point: Point, count: number, highlighted: boolean) {
  const size = highlighted ? 20 : 16;
  ctx.beginPath();
  ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#000';
  ctx.font = `bold ${size - 4}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(count.toString(), point.x, point.y);
}

function drawLabel(ctx: CanvasRenderingContext2D, point: Point, text: string) {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const metrics = ctx.measureText(text);
  const padding = 4;
  const bgWidth = metrics.width + padding * 2;
  const bgHeight = 16;
  
  ctx.fillRect(point.x - bgWidth / 2, point.y - bgHeight / 2, bgWidth, bgHeight);
  
  ctx.fillStyle = '#FFF';
  ctx.fillText(text, point.x, point.y);
  ctx.restore();
}

function getMidPoint(points: Point[]): Point {
  const totalLength = points.reduce((sum, p, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    return sum + Math.hypot(p.x - prev.x, p.y - prev.y);
  }, 0);
  
  const halfLength = totalLength / 2;
  let accum = 0;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const segLen = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    
    if (accum + segLen >= halfLength) {
      const t = (halfLength - accum) / segLen;
      return {
        x: prev.x + t * (curr.x - prev.x),
        y: prev.y + t * (curr.y - prev.y),
      };
    }
    accum += segLen;
  }
  
  return points[Math.floor(points.length / 2)];
}

function getPolygonCenter(points: Point[]): Point {
  const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  return { x, y };
}

function pointToSegmentDistance(point: Point, p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lengthSq = dx * dx + dy * dy;
  
  if (lengthSq === 0) {
    return Math.hypot(point.x - p1.x, point.y - p1.y);
  }
  
  let t = ((point.x - p1.x) * dx + (point.y - p1.y) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  
  const projX = p1.x + t * dx;
  const projY = p1.y + t * dy;
  
  return Math.hypot(point.x - projX, point.y - projY);
}
