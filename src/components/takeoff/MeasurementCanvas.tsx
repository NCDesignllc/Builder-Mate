import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Point, Measurement, TakeoffTool, TakeoffScale, LinearMeasurement, AreaMeasurement, CountMeasurement } from './types';
import { uuid } from './geometry';
import { smartSnap, snapAngle } from './snap';
import { computeMeasurement, formatNumber } from './measurementMath';

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
};

export function MeasurementCanvas({
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
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

    // Check for hover (selection tool only)
    if (tool === 'select' && !isDrawing) {
      const hovered = measurements.find((m) => {
        if (m.kind === 'count') {
          const dx = snappedPoint.x - m.point.x;
          const dy = snappedPoint.y - m.point.y;
          return Math.hypot(dx, dy) < 10;
        }
        // Check if point is near any line segment
        if (m.kind === 'linear' || m.kind === 'area') {
          for (let i = 0; i < m.points.length - 1; i++) {
            const p1 = m.points[i];
            const p2 = m.points[i + 1];
            const dist = pointToSegmentDistance(snappedPoint, p1, p2);
            if (dist < 8) return true;
          }
        }
        return false;
      });
      setHoveredId(hovered?.id ?? null);
    }
  }, [getCanvasPoint, applySnap, tool, isDrawing, measurements]);

  // Handle mouse down (start drawing or select)
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Middle mouse button (button 1) - temporarily enable pan tool
    if (e.button === 1) {
      e.preventDefault(); // Prevent default middle mouse behavior
      // Note: Pan functionality would need to be implemented in the parent viewport component
      // This canvas is for measurements only, not viewport panning
      return;
    }
    
    if (e.button !== 0) return; // Only left click for measurements

    const point = getCanvasPoint(e);
    const snappedPoint = applySnap(point, e.shiftKey);

    if (tool === 'select') {
      // Handle selection
      if (hoveredId) {
        if (e.shiftKey && onSelect) {
          // Multi-select
          const newSelection = selectedIds.includes(hoveredId)
            ? selectedIds.filter((id) => id !== hoveredId)
            : [...selectedIds, hoveredId];
          onSelect(newSelection);
        } else if (onSelect) {
          // Single select
          onSelect([hoveredId]);
        }
      } else if (onSelect) {
        // Deselect all
        onSelect([]);
      }
      return;
    }

    if (tool === 'count') {
      // Count tool: single click to place
      const countMeasurement: CountMeasurement = {
        id: uuid('count'),
        kind: 'count',
        pageIndex,
        point: snappedPoint,
        count: 1,
        createdAt: Date.now(),
      };
      onAddMeasurement(countMeasurement);
      return;
    }

    if (tool === 'linear' || tool === 'area') {
      setIsDrawing(true);
      setCurrentPoints([snappedPoint]);
    }
  }, [tool, getCanvasPoint, applySnap, pageIndex, onAddMeasurement, hoveredId, selectedIds, onSelect]);

  // Handle mouse click (add points during drawing)
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'count' || tool === 'select') return;

    const point = getCanvasPoint(e);
    const snappedPoint = applySnap(point, e.shiftKey);

    setCurrentPoints((prev) => [...prev, snappedPoint]);
  }, [isDrawing, tool, getCanvasPoint, applySnap]);

  // Handle double click (finish drawing)
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || currentPoints.length < 2) return;

    if (tool === 'linear') {
      const measurement: LinearMeasurement = {
        id: uuid('linear'),
        kind: 'linear',
        pageIndex,
        points: currentPoints,
        createdAt: Date.now(),
      };
      onAddMeasurement(measurement);
    } else if (tool === 'area' && currentPoints.length >= 3) {
      const measurement: AreaMeasurement = {
        id: uuid('area'),
        kind: 'area',
        pageIndex,
        points: currentPoints,
        createdAt: Date.now(),
      };
      onAddMeasurement(measurement);
    }

    setIsDrawing(false);
    setCurrentPoints([]);
  }, [isDrawing, currentPoints, tool, pageIndex, onAddMeasurement]);

  // Handle escape key (cancel drawing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing) {
        setIsDrawing(false);
        setCurrentPoints([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Filter measurements for current page
    const pageMeasurements = measurements.filter((m) => m.pageIndex === pageIndex);

    // Draw existing measurements
    pageMeasurements.forEach((m) => {
      const isSelected = selectedIds.includes(m.id);
      const isHovered = hoveredId === m.id;
      
      ctx.strokeStyle = isSelected ? '#FF6600' : isHovered ? '#FFA500' : layerColor;
      ctx.fillStyle = isSelected ? '#FF6600' : isHovered ? '#FFA500' : layerColor;
      ctx.lineWidth = isSelected ? 3 : isHovered ? 2.5 : 2;

      if (m.kind === 'linear') {
        drawPolyline(ctx, m.points);
        // Draw vertices
        m.points.forEach((p) => drawVertex(ctx, p, isSelected || isHovered));
        
        // Draw measurement label
        if (m.points.length >= 2 && scale) {
          const computed = computeMeasurement(m, scale);
          if (computed.kind === 'linear' && computed.value) {
            const midPoint = getMidPoint(m.points);
            drawLabel(ctx, midPoint, `${formatNumber(computed.value, 2)} ${computed.unitLabel}`);
          }
        }
      } else if (m.kind === 'area') {
        drawPolygon(ctx, m.points);
        // Draw vertices
        m.points.forEach((p) => drawVertex(ctx, p, isSelected || isHovered));
        
        // Draw measurement label
        if (m.points.length >= 3 && scale) {
          const computed = computeMeasurement(m, scale);
          if (computed.kind === 'area' && computed.value) {
            const center = getPolygonCenter(m.points);
            drawLabel(ctx, center, `${formatNumber(computed.value, 2)} ${computed.unitLabel}`);
          }
        }
      } else if (m.kind === 'count') {
        drawCountMarker(ctx, m.point, m.count, isSelected || isHovered);
      }
    });

    // Draw current drawing in progress
    if (isDrawing && currentPoints.length > 0 && mousePos) {
      ctx.strokeStyle = layerColor;
      ctx.fillStyle = layerColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      const previewPoints = [...currentPoints, mousePos];
      
      if (tool === 'linear') {
        drawPolyline(ctx, previewPoints);
      } else if (tool === 'area') {
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
  }, [width, height, measurements, pageIndex, currentPoints, mousePos, isDrawing, selectedIds, hoveredId, tool, scale, enableSnap, snapThreshold, layerColor]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
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

// Helper drawing functions
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
