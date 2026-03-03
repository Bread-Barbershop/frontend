'use client';
import { Canvas, FabricObject } from 'fabric';
import { useEffect, useRef, useState } from 'react';

import '@/widgets/mainPoster/libs/customImage-filter';

export const GuestMainPoster = ({ json }: { json: unknown }) => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  function lockObject(obj: FabricObject) {
    obj.set({
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      selectable: false,
      evented: false,
      hasControls: false,
      hasBorders: false,
    });
    (obj as any).editable = false;
  }

  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 375,
      height: 600,
      selection: false,
      skipTargetFind: true,
    });

    setCanvas(fabricCanvas);
    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!canvas || !json) return;

    canvas.clear();

    canvas.loadFromJSON(json).then(() => {
      canvas.getObjects().forEach(lockObject);
      canvas.discardActiveObject();
      canvas.selection = false;
      canvas.requestRenderAll();
    });
  }, [canvas, json]);
  return (
    <div className="rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full" />
    </div>
  );
};
