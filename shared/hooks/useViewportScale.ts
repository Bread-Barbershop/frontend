'use client';

import { useEffect, useState } from 'react';

type UseViewportScaleOptions = {
  designWidth?: number;
  minScale?: number;
  maxScale?: number;
};

export function useViewportScale({
  designWidth = 1920,
  minScale = 0.42,
  maxScale = 1,
}: UseViewportScaleOptions = {}) {
  const [scale, setScale] = useState(maxScale);

  useEffect(() => {
    const updateScale = () => {
      const nextScale = Math.min(
        maxScale,
        Math.max(minScale, window.innerWidth / designWidth)
      );

      setScale(prevScale =>
        Object.is(prevScale, nextScale) ? prevScale : nextScale
      );
    };

    updateScale();
    window.addEventListener('resize', updateScale);

    return () => {
      window.removeEventListener('resize', updateScale);
    };
  }, [designWidth, maxScale, minScale]);

  return scale;
}
