import { Canvas, FabricImage, FabricObject, Pattern, Rect } from 'fabric';

import { ImageSlotMeta, SlotTargetObject } from '../utils/imageSlot';

interface Props {
  canvas: Canvas | null;
  saveHistory: () => void;
  syncActiveObjectInfo?: (canvas: Canvas) => void;
}

type SlotRect = Rect & {
  slot?: ImageSlotMeta;
};

const SLOT_PATTERN_COLUMNS = 9;

const createSlotPattern = (width: number, height: number) => {
  const patternCanvas = document.createElement('canvas');
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const cellSize = Math.max(1, safeWidth / SLOT_PATTERN_COLUMNS);
  const rowCount = Math.max(1, Math.ceil(safeHeight / cellSize));

  patternCanvas.width = safeWidth;
  patternCanvas.height = safeHeight;
  const ctx = patternCanvas.getContext('2d');

  if (!ctx) {
    return '#E5E7EB';
  }

  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(0, 0, safeWidth, safeHeight);

  for (let row = 0; row < rowCount; row += 1) {
    for (let column = 0; column < SLOT_PATTERN_COLUMNS; column += 1) {
      if ((row + column) % 2 !== 0) continue;

      ctx.fillStyle = '#D1D5DB';
      ctx.fillRect(
        column * cellSize,
        row * cellSize,
        cellSize,
        cellSize
      );
    }
  }

  return new Pattern({
    source: patternCanvas,
    repeat: 'repeat',
  });
};

const updateSlotRectPattern = (rect: Rect) => {
  rect.set('fill', createSlotPattern(rect.getScaledWidth(), rect.getScaledHeight()));
};

const normalizeSlotRectScale = (rect: Rect) => {
  const scaleX = rect.scaleX || 1;
  const scaleY = rect.scaleY || 1;

  if (scaleX === 1 && scaleY === 1) {
    return;
  }

  const center = rect.getCenterPoint();
  const nextWidth = (rect.width || 0) * scaleX;
  const nextHeight = (rect.height || 0) * scaleY;

  rect.set({
    width: nextWidth,
    height: nextHeight,
    scaleX: 1,
    scaleY: 1,
    left: center.x,
    top: center.y,
    originX: 'center',
    originY: 'center',
  });
  rect.setCoords();
};

const attachSlotRectBehavior = (rect: Rect) => {
  rect.on('modified', () => {
    normalizeSlotRectScale(rect);
    updateSlotRectPattern(rect);
  });
};

const getImageSourceSize = (image: FabricImage) => {
  const element = image.getElement();

  if (element instanceof HTMLImageElement) {
    return {
      width: element.naturalWidth || image.width || 0,
      height: element.naturalHeight || image.height || 0,
    };
  }

  return {
    width: image.width || 0,
    height: image.height || 0,
  };
};

export const useFabricSlot = ({
  canvas,
  saveHistory,
  syncActiveObjectInfo,
}: Props) => {
  const addSlotRect = () => {
    if (!canvas) return null;

    const rect = new Rect({
      left: canvas.width ? canvas.width / 2 : 160,
      top: canvas.height ? canvas.height / 2 : 190,
      width: 120,
      height: 180,
      fill: createSlotPattern(120, 180),
      objectCaching: false,
      selectable: true,
      evented: true,
      hasControls: true,
      originX: 'center',
      originY: 'center',
    });

    attachSlotRectBehavior(rect);
    canvas.add(rect);
    canvas.setActiveObject(rect);
    rect.setCoords();
    canvas.requestRenderAll();
    syncActiveObjectInfo?.(canvas);
    saveHistory();

    return rect;
  };

  const convertActiveRectToSlot = () => {
    if (!canvas) return false;

    const activeObject = canvas.getActiveObject();
    if (!(activeObject instanceof Rect)) return false;

    const rect = activeObject as SlotRect;
    if (rect.slot?.replaceable) return false;

    const slotKey = `slot-${Date.now()}`;
    normalizeSlotRectScale(rect);
    rect.set({
      id: rect.get('id') || slotKey,
      name: 'slot-placeholder',
      fill: createSlotPattern(rect.getScaledWidth(), rect.getScaledHeight()),
      stroke: null,
      strokeWidth: 0,
      strokeDashArray: null,
      slot: {
        key: slotKey,
        label: `Photo Slot ${Date.now()}`,
        replaceable: true,
        aspectMode: 'cover',
        required: false,
        order: 1,
        filled: false,
      },
    });
    attachSlotRectBehavior(rect);
    rect.setCoords();
    canvas.requestRenderAll();
    syncActiveObjectInfo?.(canvas);
    saveHistory();

    return true;
  };

  const unregisterActiveSlot = () => {
    if (!canvas) return false;

    const activeObject = canvas.getActiveObject();
    if (!(activeObject instanceof Rect)) return false;

    const rect = activeObject as SlotRect;
    if (!rect.slot?.replaceable) return false;

    normalizeSlotRectScale(rect);
    rect.set({
      name: undefined,
      slot: undefined,
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: false,
      hasControls: true,
      editable: true,
      isLocked: false,
    });
    rect.setCoords();
    canvas.requestRenderAll();
    syncActiveObjectInfo?.(canvas);
    saveHistory();

    return true;
  };

  const replaceSlotImage = async (
    targetImage: FabricObject,
    url: string
  ) => {
    if (!canvas) return null;

    const objectIndex = canvas.getObjects().indexOf(targetImage);
    if (objectIndex < 0) return null;

    const frameWidth = targetImage.getScaledWidth();
    const frameHeight = targetImage.getScaledHeight();
    const slot = ((targetImage as SlotTargetObject).slot ||
      {}) as ImageSlotMeta;
    const nextImage = await FabricImage.fromURL(url, {
      crossOrigin: 'anonymous',
    });
    const element = nextImage.getElement();
    const sourceWidth =
      element instanceof HTMLImageElement
        ? element.naturalWidth
        : nextImage.width;
    const sourceHeight =
      element instanceof HTMLImageElement
        ? element.naturalHeight
        : nextImage.height;

    if (!sourceWidth || !sourceHeight || !frameWidth || !frameHeight) {
      return null;
    }

    const frameAspect = frameWidth / frameHeight;
    const sourceAspect = sourceWidth / sourceHeight;

    let cropWidth = sourceWidth;
    let cropHeight = sourceHeight;
    let cropX = 0;
    let cropY = 0;

    if ((slot.aspectMode ?? 'cover') === 'cover') {
      if (sourceAspect > frameAspect) {
        cropWidth = sourceHeight * frameAspect;
        cropX = (sourceWidth - cropWidth) / 2;
      } else {
        cropHeight = sourceWidth / frameAspect;
        cropY = (sourceHeight - cropHeight) / 2;
      }
    }

    nextImage.set({
      id: targetImage.get('id'),
      slot: {
        ...slot,
        filled: true,
      },
      left: targetImage.left,
      top: targetImage.top,
      originX: targetImage.originX,
      originY: targetImage.originY,
      angle: targetImage.angle,
      flipX: targetImage.flipX,
      flipY: targetImage.flipY,
      opacity: targetImage.opacity,
      visible: targetImage.visible,
      selectable: targetImage.selectable,
      evented: targetImage.evented,
      hasControls: targetImage.hasControls,
      lockMovementX: targetImage.lockMovementX,
      lockMovementY: targetImage.lockMovementY,
      lockScalingX: targetImage.lockScalingX,
      lockScalingY: targetImage.lockScalingY,
      lockRotation: targetImage.lockRotation,
      customCropRatio: frameAspect,
      cropX,
      cropY,
      width: cropWidth,
      height: cropHeight,
      scaleX: frameWidth / cropWidth,
      scaleY: frameHeight / cropHeight,
    });

    if (targetImage instanceof FabricImage && targetImage.filters?.length) {
      nextImage.filters = [...targetImage.filters];
      nextImage.applyFilters();
    }

    canvas.remove(targetImage);
    canvas.insertAt(objectIndex, nextImage);
    nextImage.setCoords();
    canvas.setActiveObject(nextImage);
    canvas.requestRenderAll();
    syncActiveObjectInfo?.(canvas);
    saveHistory();

    return nextImage;
  };

  const getSlotImagePosition = (image: FabricImage) => {
    const { width: sourceWidth, height: sourceHeight } =
      getImageSourceSize(image);
    const cropWidth = image.width || 0;
    const cropHeight = image.height || 0;
    const maxCropX = Math.max(0, sourceWidth - cropWidth);
    const maxCropY = Math.max(0, sourceHeight - cropHeight);

    return {
      x: maxCropX === 0 ? 50 : (image.cropX / maxCropX) * 100,
      y: maxCropY === 0 ? 50 : (image.cropY / maxCropY) * 100,
      canMoveX: maxCropX > 0,
      canMoveY: maxCropY > 0,
    };
  };

  const updateSlotImagePosition = (
    image: FabricImage,
    axis: 'x' | 'y',
    value: number,
    options?: {
      saveHistory?: boolean;
      syncActiveObjectInfo?: boolean;
    }
  ) => {
    if (!canvas) return;

    const { width: sourceWidth, height: sourceHeight } =
      getImageSourceSize(image);
    const cropWidth = image.width || 0;
    const cropHeight = image.height || 0;
    const maxCropX = Math.max(0, sourceWidth - cropWidth);
    const maxCropY = Math.max(0, sourceHeight - cropHeight);
    const normalized = Math.min(100, Math.max(0, value));

    if (axis === 'x' && maxCropX > 0) {
      image.set({ cropX: (maxCropX * normalized) / 100 });
    }

    if (axis === 'y' && maxCropY > 0) {
      image.set({ cropY: (maxCropY * normalized) / 100 });
    }

    image.setCoords();
    canvas.setActiveObject(image);
    canvas.requestRenderAll();
    if (options?.syncActiveObjectInfo) {
      syncActiveObjectInfo?.(canvas);
    }

    if (options?.saveHistory) {
      saveHistory();
    }
  };

  return {
    addSlotRect,
    convertActiveRectToSlot,
    unregisterActiveSlot,
    replaceSlotImage,
    getSlotImagePosition,
    updateSlotImagePosition,
  };
};
