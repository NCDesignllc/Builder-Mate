import React, { useEffect, useRef } from 'react';

type Props = {
  src: string | null;
  autoPlay?: boolean;
  onEnded?: () => void;
};

export function AudioPlayer({ src, autoPlay = true, onEnded }: Props) {
  const ref = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!src) return;

    ref.current.src = src;
    if (autoPlay) {
      ref.current.play().catch(() => {
        // ignore autoplay restriction; user can press play.
      });
    }
  }, [src, autoPlay]);

  if (!src) return null;

  return (
    <audio
      ref={ref}
      controls
      className="w-full"
      onEnded={onEnded}
    />
  );
}
