import React, { useState, useCallback } from 'react';
import type { Point, TakeoffScale } from './types';
import { ScaleModal } from './ScaleModal';
import { dist } from './geometry';

type Props = {
  width: number;
  height: number;
  isDarkMode: boolean;
  onSetScale: (scale: TakeoffScale) => void;
  existingScale?: TakeoffScale | null;
};

/**
 * ScaleTool - Interactive scale calibration
 * User clicks two points on the PDF, then enters the known distance
 */
export function ScaleTool({ width, height, isDarkMode, onSetScale, existingScale }: Props) {
  const [points, setPoints] = useState<Point[]>([]);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [showModal, setShowModal] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const pixelDistance = points.length === 2 ? dist(points[0], points[1]) : null;

  const getCanvasPoint = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setMousePos(getCanvasPoint(e));
  }, [getCanvasPoint]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    
    if (points.length === 0) {
      // First point
      setPoints([point]);
    } else if (points.length === 1) {
      // Second point - show modal
      setPoints([points[0], point]);
      setShowModal(true);
    }
  }, [points, getCanvasPoint]);

  const handleApplyScale = useCallback((scale: TakeoffScale) => {
    onSetScale(scale);
    setPoints([]);
    setShowModal(false);
  }, [onSetScale]);

  const handleCancel = useCallback(() => {
    setPoints([]);
    setShowModal(false);
  }, []);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPoints([]);
        setShowModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Draw on canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw instruction text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, width - 20, 60);
    
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    if (points.length === 0) {
      ctx.fillText('Click the first point of a known distance', 20, 20);
    } else if (points.length === 1) {
      ctx.fillText('Click the second point to complete the measurement', 20, 20);
      ctx.fillText(`Distance: ${pixelDistance ? pixelDistance.toFixed(1) : '—'} pixels`, 20, 40);
    }

    // Draw existing scale info if present
    if (existingScale) {
      ctx.fillStyle = 'rgba(0, 128, 0, 0.7)';
      ctx.fillRect(10, height - 50, width - 20, 40);
      
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Current scale: ${existingScale.label}`, 20, height - 40);
      ctx.fillText(`${existingScale.pxPerUnit.toFixed(2)} px per ${existingScale.unit}`, 20, height - 22);
    }

    // Draw points and line
    if (points.length > 0) {
      ctx.strokeStyle = '#00FF00';
      ctx.fillStyle = '#00FF00';
      ctx.lineWidth = 3;

      // First point
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Line to mouse or second point
      if (points.length === 1 && mousePos) {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (points.length === 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();

        // Second point
        ctx.beginPath();
        ctx.arc(points[1].x, points[1].y, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [width, height, points, mousePos, pixelDistance, existingScale]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: 'crosshair',
        }}
      />
      
      <ScaleModal
        isOpen={showModal}
        isDarkMode={isDarkMode}
        pixelDistance={pixelDistance}
        onClose={handleCancel}
        onApply={handleApplyScale}
      />
    </>
  );
}
