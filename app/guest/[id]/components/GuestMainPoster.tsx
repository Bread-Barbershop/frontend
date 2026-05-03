'use client';
import { StaticCanvas, IText, Textbox } from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';

import '@/widgets/mainPoster/libs/customImage-filter';
import { preloadFonts } from '@/widgets/mainPoster/hooks/useTemplate';

const POSTER_BASE_WIDTH = 375;
const POSTER_BASE_HEIGHT = 750;

export const GuestMainPoster = ({ json }: { json: unknown }) => {
  const [canvas, setCanvas] = useState<StaticCanvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderStartTime] = useState(() => performance.now());
  const canvasInitTime = useRef<number>(0);

  const updateCanvasSize = useCallback(() => {
    if (!canvas || !containerRef.current) return;

    const width = containerRef.current.clientWidth || POSTER_BASE_WIDTH;
    const scale = width / POSTER_BASE_WIDTH;

    canvas.setDimensions({
      width,
      height: POSTER_BASE_HEIGHT * scale,
    });
    canvas.setZoom(scale);
    canvas.requestRenderAll();
  }, [canvas]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const startInit = performance.now();
    const fabricCanvas = new StaticCanvas(canvasRef.current, {
      width: POSTER_BASE_WIDTH,
      height: POSTER_BASE_HEIGHT,
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
    if (!canvas || !containerRef.current) return;

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [canvas, updateCanvasSize]);

  useEffect(() => {
    if (!canvas || !json) return;

    const loadTemplate = async () => {
      const loadStart = performance.now();

      await preloadFonts(json);
      await canvas.loadFromJSON(json);

      canvas.getObjects().forEach(obj => {
        if (
          obj.isType('textbox') ||
          obj.isType('itext') ||
          obj.isType('text')
        ) {
          const textObj = obj as Textbox | IText;
          textObj.set({
            dirty: true,
            objectCaching: false,
          });
          if ('_initDimensions' in textObj) {
            (textObj as any)._initDimensions();
          } else if ('initDimensions' in textObj) {
            (textObj as any).initDimensions();
          }
          textObj.setCoords();
        }
      });

      updateCanvasSize();
      canvas.requestRenderAll();

      await new Promise(resolve => requestAnimationFrame(resolve));
      canvas.requestRenderAll();

      window.requestAnimationFrame(() => {
        window.dispatchEvent(new Event('guest-main-poster-ready'));
      });

      const loadEnd = performance.now();
      const totalTime = loadEnd - renderStartTime;
      const jsonLoadTime = loadEnd - loadStart;

      console.info('🎨 Fabric Poster Render Metrics');
      console.info(`- Total Render Time: ${totalTime.toFixed(2)}ms`);
      console.info(
        `- Canvas Init Time: ${canvasInitTime.current.toFixed(2)}ms`
      );
      console.info(`- JSON Load Time: ${jsonLoadTime.toFixed(2)}ms`);
    };

    loadTemplate();
  }, [canvas, json, renderStartTime, updateCanvasSize]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
};
