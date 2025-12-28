import React from 'react';

type Props = {
  cx: number;
  cy: number;
  active?: boolean;
  onPointerDown: (e: React.PointerEvent<SVGCircleElement>) => void;
};

export function TakeoffHandle({ cx, cy, active = false, onPointerDown }: Props) {
  // Keep handle size constant regardless of zoom because we render in screen space.
  const r = active ? 7 : 6;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      onPointerDown={onPointerDown}
      style={{ cursor: 'grab' }}
      className={
        active
          ? 'fill-orange-500 stroke-white stroke-[2] drop-shadow'
          : 'fill-white stroke-orange-500 stroke-[2] drop-shadow'
      }
    />
  );
}
