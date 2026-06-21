import { useLayoutEffect, useState } from 'react';
import { MIN_PREVIEW_SCALE, PREVIEW_STAGE_GUTTER } from '../presets.js';

export function usePreviewScale(stageRef, { width, shellHeight }) {
  const [previewScale, setPreviewScale] = useState(1);

  useLayoutEffect(() => {
    if (!stageRef.current) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const { width: stageWidth, height: stageHeight } = entry.contentRect;
      const availableWidth = Math.max(0, stageWidth - PREVIEW_STAGE_GUTTER);
      const availableHeight = Math.max(0, stageHeight - PREVIEW_STAGE_GUTTER);
      const nextScale = Math.min(1, availableWidth / width, availableHeight / shellHeight);
      setPreviewScale(Math.max(MIN_PREVIEW_SCALE, Number(nextScale.toFixed(3))));
    });

    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [stageRef, width, shellHeight]);

  return previewScale;
}
