import { Canvas, FabricImage, FabricObject, Pattern, Rect } from 'fabric';
import { useEffect } from 'react';

import {
  SLOT_UPLOAD_ICON_SVG,
  SLOT_UPLOAD_SMALL_ICON_SVG,
} from '../constants/fabric';
import {
  createFabricControlImage,
  isImageReadyForCanvas,
} from '../utils/fabricUtils';
import { ImageSlotMeta, SlotTargetObject } from '../utils/imageSlot';

interface Props {
  canvas: Canvas | null;
  saveHistory: () => void;
  syncActiveObjectInfo?: (canvas: Canvas) => void;
}

type SlotRect = Rect & {
  slot?: ImageSlotMeta;
};

type SlotPlaceholderRect = SlotRect & {
  _render: (ctx: CanvasRenderingContext2D) => void;
  __slotPlaceholderBaseRender?: (ctx: CanvasRenderingContext2D) => void;
  __slotPlaceholderModifiedHandler?: () => void;
};

const PATTERN_BASE_WIDTH = 335;
const PATTERN_VISIBLE_COLUMNS = 9;
const ICON_SWITCH_SIZE = 44;
const ICON_DEFAULT_SIZE = 44;
const ICON_SMALL_SIZE = 24;
const ICON_PADDING = 8;

let slotUploadIconImage: HTMLImageElement | null = null;
let slotUploadSmallIconImage: HTMLImageElement | null = null;

const getSlotPatternScale = (rect: Rect) =>
  Math.max(
    0.001,
    (rect.getScaledWidth() * 2) / (PATTERN_BASE_WIDTH * PATTERN_VISIBLE_COLUMNS)
  );

const createSlotPattern = (scale: number) => {
  const patternCanvas = document.createElement('canvas');
  patternCanvas.width = PATTERN_BASE_WIDTH;
  patternCanvas.height = PATTERN_BASE_WIDTH;
  const ctx = patternCanvas.getContext('2d');

  if (!ctx) {
    return '#E5E7EB';
  }

  ctx.fillStyle = '#F3F4F6';
  ctx.fillRect(0, 0, PATTERN_BASE_WIDTH, PATTERN_BASE_WIDTH);
  ctx.fillStyle = '#D1D5DB';
  ctx.fillRect(0, 0, PATTERN_BASE_WIDTH / 2, PATTERN_BASE_WIDTH / 2);
  ctx.fillRect(
    PATTERN_BASE_WIDTH / 2,
    PATTERN_BASE_WIDTH / 2,
    PATTERN_BASE_WIDTH / 2,
    PATTERN_BASE_WIDTH / 2
  );

  return new Pattern({
    source: patternCanvas,
    repeat: 'repeat',
    patternTransform: [scale, 0, 0, scale, 0, 0],
  });
};

const ensureSlotIconImage = (useSmallIcon: boolean) => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (useSmallIcon) {
    slotUploadSmallIconImage ??= createFabricControlImage(
      SLOT_UPLOAD_SMALL_ICON_SVG
    );

    return slotUploadSmallIconImage;
  }

  slotUploadIconImage ??= createFabricControlImage(SLOT_UPLOAD_ICON_SVG);

  return slotUploadIconImage;
};

const getSlotIconSize = (rect: Rect, useSmallIcon: boolean) => {
  const width = rect.width || 0;
  const height = rect.height || 0;
  const preferredSize = useSmallIcon ? ICON_SMALL_SIZE : ICON_DEFAULT_SIZE;

  return Math.max(
    0,
    Math.min(preferredSize, width - ICON_PADDING, height - ICON_PADDING)
  );
};

const renderSlotPlaceholderIcon = (
  rect: SlotPlaceholderRect,
  ctx: CanvasRenderingContext2D
) => {
  const useSmallIcon =
    rect.getScaledWidth() < ICON_SWITCH_SIZE ||
    rect.getScaledHeight() < ICON_SWITCH_SIZE;
  const iconImage = ensureSlotIconImage(useSmallIcon);

  if (!iconImage) {
    return;
  }

  if (!isImageReadyForCanvas(iconImage)) {
    iconImage.onload = () => rect.canvas?.requestRenderAll();
    return;
  }

  const iconSize = getSlotIconSize(rect, useSmallIcon);
  if (iconSize <= 0) {
    return;
  }

  ctx.drawImage(iconImage, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
};

const attachSlotPlaceholderRender = (rect: SlotPlaceholderRect) => {
  if (rect.__slotPlaceholderBaseRender) {
    return;
  }

  rect.__slotPlaceholderBaseRender = rect._render.bind(rect);
  rect._render = (ctx: CanvasRenderingContext2D) => {
    rect.__slotPlaceholderBaseRender?.(ctx);
    renderSlotPlaceholderIcon(rect, ctx);
  };
};

const detachSlotPlaceholderRender = (rect: SlotPlaceholderRect) => {
  if (!rect.__slotPlaceholderBaseRender) {
    return;
  }

  rect._render = rect.__slotPlaceholderBaseRender;
  delete rect.__slotPlaceholderBaseRender;
};

const updateSlotRectPattern = (rect: Rect) => {
  rect.set('fill', createSlotPattern(getSlotPatternScale(rect)));
};

const createSlotMeta = (): ImageSlotMeta => {
  const ts = Date.now();
  return {
    key: 'slot-' + ts,
    label: 'Photo Slot ' + ts,
    replaceable: true,
    aspectMode: 'cover',
    required: false,
    order: 1,
    filled: false,
  };
};

const applySlotMetadata = (rect: SlotRect) => {
  const slot = rect.slot?.replaceable ? rect.slot : createSlotMeta();

  rect.set({
    id: rect.get('id') || slot.key,
    name: 'slot-placeholder',
    stroke: null,
    strokeWidth: 0,
    strokeDashArray: null,
    slot,
  });
  updateSlotRectPattern(rect);

  return rect;
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
  const slotRect = rect as SlotPlaceholderRect;

  attachSlotPlaceholderRender(slotRect);

  if (slotRect.__slotPlaceholderModifiedHandler) {
    return;
  }

  slotRect.__slotPlaceholderModifiedHandler = () => {
    normalizeSlotRectScale(slotRect);
    updateSlotRectPattern(slotRect);
  };

  slotRect.on('modified', slotRect.__slotPlaceholderModifiedHandler);
};

const detachSlotRectBehavior = (rect: Rect) => {
  const slotRect = rect as SlotPlaceholderRect;

  if (slotRect.__slotPlaceholderModifiedHandler) {
    slotRect.off('modified', slotRect.__slotPlaceholderModifiedHandler);
    delete slotRect.__slotPlaceholderModifiedHandler;
  }

  detachSlotPlaceholderRender(slotRect);
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
  useEffect(() => {
    if (!canvas) return;

    const syncSlotPlaceholder = (target?: FabricObject | null) => {
      if (!(target instanceof Rect)) {
        return;
      }

      const slotRect = target as SlotRect;
      if (!slotRect.slot?.replaceable) {
        return;
      }

      attachSlotRectBehavior(target);
      updateSlotRectPattern(target);
    };

    canvas.getObjects().forEach(syncSlotPlaceholder);

    const handleObjectAdded = ({
      target,
    }: {
      target?: FabricObject | null;
    }) => {
      syncSlotPlaceholder(target);
    };

    canvas.on('object:added', handleObjectAdded);

    return () => {
      canvas.off('object:added', handleObjectAdded);
      canvas.getObjects().forEach(obj => {
        if (obj instanceof Rect) {
          detachSlotRectBehavior(obj);
        }
      });
    };
  }, [canvas]);

  const addSlotRect = () => {
    if (!canvas) return null;

    const rect = new Rect({
      left: canvas.width ? canvas.width / 2 : 160,
      top: canvas.height ? canvas.height / 2 : 190,
      width: 120,
      height: 180,
      objectCaching: false,
      selectable: true,
      evented: true,
      hasControls: true,
      originX: 'center',
      originY: 'center',
    });

    applySlotMetadata(rect as SlotRect);
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

    normalizeSlotRectScale(rect);
    applySlotMetadata(rect);
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
    detachSlotRectBehavior(rect);
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

  const replaceSlotImage = async (targetImage: FabricObject, url: string) => {
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
      editable: (targetImage as SlotTargetObject).editable,
      isLocked: (targetImage as SlotTargetObject).isLocked,
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
