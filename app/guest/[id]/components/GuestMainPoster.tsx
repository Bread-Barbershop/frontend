'use client';
import { Canvas } from 'fabric';
import { useEffect, useRef, useState } from 'react';

import '@/widgets/mainPoster/libs/customImage-filter';

export const GuestMainPoster = ({ json }: { json: unknown }) => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderStartTime] = useState(() => performance.now());
  const canvasInitTime = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const startInit = performance.now();
    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 375,
      height: 600,
      selection: false,
      skipTargetFind: true,
      renderOnAddRemove: false,
      enableRetinaScaling: false,
    });

    canvasInitTime.current = performance.now() - startInit;
    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas || !json) return;

    const loadStart = performance.now();
    canvas.loadFromJSON(json).then(() => {
      canvas.discardActiveObject();
      canvas.selection = false;
      canvas.requestRenderAll();

      const loadEnd = performance.now();
      const totalTime = loadEnd - renderStartTime;
      const jsonLoadTime = loadEnd - loadStart;

      console.info('🎨 Fabric Poster Render Metrics');
      console.info(`- Total Render Time: ${totalTime.toFixed(2)}ms`);
      console.info(
        `- Canvas Init Time: ${canvasInitTime.current.toFixed(2)}ms`
      );
      console.info(`- JSON Load Time: ${jsonLoadTime.toFixed(2)}ms`);
    });
  }, [canvas, json, renderStartTime]);

  return (
    <div className="rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
};
