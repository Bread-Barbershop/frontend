import { Canvas, Rect, Line } from 'fabric';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { convertFabricColor } from '../utils/fabricUtils';

export const useFabricShape = () => {
  const shapeConfig = useEditorStore(state => state.shapeConfig);

  const addRect = (canvas: Canvas) => {
    if (!canvas) return;

    const rect = new Rect({
      left: canvas.width ? canvas.width / 2 - 50 : 100,
      top: canvas.height ? canvas.height / 2 - 50 : 100,
      width: 100,
      height: 100,
      fill: convertFabricColor(shapeConfig.fillColor),
      stroke: convertFabricColor(shapeConfig.strokeColor),
      strokeWidth: shapeConfig.strokeWidth,
      strokeUniform: true,
    });

    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  };

  const addLine = (canvas: Canvas) => {
    if (!canvas) return;

    const line = new Line([50, 50, 150, 50], {
      left: canvas.width ? canvas.width / 2 - 50 : 100,
      top: canvas.height ? canvas.height / 2 : 100,
      stroke: convertFabricColor(shapeConfig.strokeColor),
      strokeWidth: shapeConfig.strokeWidth,
      strokeUniform: true,
    });

    line.setControlsVisibility({
      mt: false,
      mb: false,
      tl: false,
      tr: false,
      bl: false,
      br: false,
    });

    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  const updateShapeStyle = (
    canvas: Canvas,
    styles: { fill?: string; stroke?: string; strokeWidth?: number }
  ) => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach(obj => {
      if (styles.fill !== undefined) obj.set('fill', styles.fill);
      if (styles.stroke !== undefined) obj.set('stroke', styles.stroke);
      if (styles.strokeWidth !== undefined)
        obj.set('strokeWidth', styles.strokeWidth);
    });

    canvas.requestRenderAll();
    canvas.fire('object:modified');
  };

  return {
    addRect,
    addLine,
    updateShapeStyle,
  };
};
