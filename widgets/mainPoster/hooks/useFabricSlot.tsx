import {
  Canvas,
  FabricImage,
  FabricObject,
  Intersection,
  Pattern,
  Point,
  Rect,
} from 'fabric';
import { useEffect } from 'react';

import {
  SLOT_UPLOAD_ICON_SVG,
  SLOT_UPLOAD_SMALL_ICON_SVG,
} from '../constants/fabric';
import {
  SLOT_IMAGE_SCALE_MIN,
  createSlotClipPath,
  getSlotBoundingBox,
  getSlotCoverScale,
  getSlotFrameCoords,
  getSlotFrameState,
  getSlotSourceSize as getImageSourceSize,
  getSlotWorldOffset,
  resolveSlotImagePlacement,
} from '../slot/frameGeometry';
import {
  applySlotEntityToObject,
  getSlotMeta,
  toSlotFrameFields,
  toSlotImageTransformFields,
} from '../slot/objectFields';
import {
  findPrimarySlotTargetBySlotId,
  getSlotEntityByTarget,
} from '../slot/queries';
import {
  clearSlotCanvasRuntime,
  clearSlotImageRuntime,
  clearSlotPlaceholderRuntime,
  ensureSlotCanvasRuntime,
  ensureSlotImageRuntime,
  ensureSlotPlaceholderRuntime,
  getSlotCanvasRuntime,
  getSlotImageRuntime,
  getSlotPlaceholderRuntime,
} from '../slot/runtime';
import { FabricImageWithLock } from '../types/fabric';
import {
  createFabricControlImage,
  isImageReadyForCanvas,
} from '../utils/fabricUtils';
import {
  ImageSlotMeta,
  isPointInsideSlotFrame,
  isReplaceableSlotImage,
  SlotTargetObject,
} from '../utils/imageSlot';
import { getPreviewExportMultiplier } from '../utils/previewExport';

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
};

type SlotImageBehaviorObject = FabricImageWithLock;

type SlotFrameState = import('../slot/types').SlotFrame;

type CanvasSelectionAreaPatched = {
  _pointIsInObjectSelectionArea?: (obj: FabricObject, point: Point) => boolean;
  getZoom: () => number;
};
const PATTERN_BASE_WIDTH = 335;
const PATTERN_VISIBLE_COLUMNS = 9;
const ICON_SWITCH_SIZE = 44;
const ICON_DEFAULT_SIZE = 44;
const ICON_SMALL_SIZE = 24;
const ICON_PADDING = 8;
const SLOT_IMAGE_POSITION_MIN = -50;
const SLOT_IMAGE_POSITION_MAX = 50;
const SLOT_IMAGE_SCALE_MAX = 400;

const clampSlotImageOffset = (value: number) =>
  Math.min(SLOT_IMAGE_POSITION_MAX, Math.max(SLOT_IMAGE_POSITION_MIN, value));

const clampSlotImageScale = (value: number) =>
  Math.min(SLOT_IMAGE_SCALE_MAX, Math.max(SLOT_IMAGE_SCALE_MIN, value));

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

const preloadSlotIconImages = (onReady?: () => void) => {
  const largeIcon = ensureSlotIconImage(false);
  const smallIcon = ensureSlotIconImage(true);
  const icons = [largeIcon, smallIcon].filter(
    (icon): icon is HTMLImageElement => Boolean(icon)
  );

  icons.forEach(icon => {
    if (isImageReadyForCanvas(icon)) {
      return;
    }

    icon.addEventListener('load', () => onReady?.(), { once: true });
  });
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
    iconImage.addEventListener('load', () => rect.canvas?.requestRenderAll(), {
      once: true,
    });
    return;
  }

  const iconSize = getSlotIconSize(rect, useSmallIcon);
  if (iconSize <= 0) {
    return;
  }

  ctx.drawImage(iconImage, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
};

const attachSlotPlaceholderRender = (rect: SlotPlaceholderRect) => {
  const runtime = getSlotPlaceholderRuntime(rect);
  if (runtime?.baseRender) {
    return;
  }

  const nextRuntime = ensureSlotPlaceholderRuntime(rect);
  nextRuntime.baseRender = rect._render.bind(rect);
  rect._render = (ctx: CanvasRenderingContext2D) => {
    nextRuntime.baseRender?.(ctx);
    renderSlotPlaceholderIcon(rect, ctx);
  };
};

const detachSlotPlaceholderRender = (rect: SlotPlaceholderRect) => {
  const runtime = getSlotPlaceholderRuntime(rect);
  if (!runtime?.baseRender) {
    return;
  }

  rect._render = runtime.baseRender;
  delete runtime.baseRender;

  if (!runtime.modifiedHandler) {
    clearSlotPlaceholderRuntime(rect);
  }
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

  const runtime = getSlotPlaceholderRuntime(slotRect);
  if (runtime?.modifiedHandler) {
    return;
  }

  const nextRuntime = ensureSlotPlaceholderRuntime(slotRect);
  nextRuntime.modifiedHandler = () => {
    normalizeSlotRectScale(slotRect);
    updateSlotRectPattern(slotRect);
  };

  slotRect.on('modified', nextRuntime.modifiedHandler);
};

const detachSlotRectBehavior = (rect: Rect) => {
  const slotRect = rect as SlotPlaceholderRect;
  const runtime = getSlotPlaceholderRuntime(slotRect);

  if (runtime?.modifiedHandler) {
    slotRect.off('modified', runtime.modifiedHandler);
    delete runtime.modifiedHandler;
  }

  detachSlotPlaceholderRender(slotRect);

  if (runtime && !runtime.baseRender && !runtime.modifiedHandler) {
    clearSlotPlaceholderRuntime(slotRect);
  }
};

const getSlotImageState = (image: FabricImage) => image as FabricImageWithLock;

const getLegacySlotTransform = (image: FabricImage, frame: SlotFrameState) => {
  const slotImage = getSlotImageState(image);
  const { width: sourceWidth, height: sourceHeight } =
    getImageSourceSize(image);
  const currentWidth = image.width || sourceWidth;
  const currentHeight = image.height || sourceHeight;

  if (!sourceWidth || !sourceHeight || !frame.width || !frame.height) {
    return null;
  }

  const currentScale = Math.abs(image.scaleX || image.scaleY || 1);
  const baseScale = getSlotCoverScale(
    frame.width,
    frame.height,
    sourceWidth,
    sourceHeight
  );
  const cropCenterX = (image.cropX ?? 0) + currentWidth / 2;
  const cropCenterY = (image.cropY ?? 0) + currentHeight / 2;
  const offsetX =
    ((sourceWidth / 2 - cropCenterX) * currentScale * 100) / frame.width;
  const offsetY =
    ((sourceHeight / 2 - cropCenterY) * currentScale * 100) / frame.height;

  return {
    baseScale: slotImage.slotImageBaseScale ?? baseScale,
    offsetX,
    offsetY,
    zoomScale: (currentScale / baseScale) * 100,
  };
};

const applySlotFrameControlVisibility = (image: FabricImageWithLock) => {
  image.setControlsVisibility({
    tl: true,
    tr: true,
    bl: true,
    br: true,
    mt: true,
    mb: true,
    ml: true,
    mr: true,
    mtr: false,
    tl_rotate: true,
    tr_rotate: true,
    bl_rotate: true,
    br_rotate: true,
  });
};

const getResolvedSlotImageTransform = (
  image: FabricImage,
  frame: SlotFrameState
) => {
  const slotImage = getSlotImageState(image);
  const { width: sourceWidth, height: sourceHeight } =
    getImageSourceSize(image);

  if (!sourceWidth || !sourceHeight || !frame.width || !frame.height) {
    return null;
  }

  const legacyTransform = getLegacySlotTransform(image, frame);
  const baseScale =
    slotImage.slotImageBaseScale ??
    legacyTransform?.baseScale ??
    getSlotCoverScale(frame.width, frame.height, sourceWidth, sourceHeight);
  const zoomScale = clampSlotImageScale(
    slotImage.slotZoomScale ??
      legacyTransform?.zoomScale ??
      SLOT_IMAGE_SCALE_MIN
  );
  const offsetX = clampSlotImageOffset(
    slotImage.slotImageOffsetX ?? legacyTransform?.offsetX ?? 0
  );
  const offsetY = clampSlotImageOffset(
    slotImage.slotImageOffsetY ?? legacyTransform?.offsetY ?? 0
  );

  return {
    sourceWidth,
    sourceHeight,
    baseScale,
    zoomScale,
    offsetX,
    offsetY,
  };
};

const getResizedSlotFrameFromImage = (
  image: FabricImage,
  frame: SlotFrameState
): SlotFrameState => {
  const resolved = getResolvedSlotImageTransform(image, frame);
  if (!resolved) {
    return frame;
  }

  const expectedScale = resolved.baseScale * (resolved.zoomScale / 100);
  if (!expectedScale) {
    return frame;
  }

  const widthScale = Math.abs(image.scaleX || expectedScale) / expectedScale;
  const heightScale = Math.abs(image.scaleY || expectedScale) / expectedScale;
  const nextFrame: SlotFrameState = {
    width: Math.max(1, frame.width * widthScale),
    height: Math.max(1, frame.height * heightScale),
    left: frame.left,
    top: frame.top,
    angle: image.angle ?? frame.angle,
  };
  const worldOffset = getSlotWorldOffset(
    nextFrame,
    resolved.offsetX,
    resolved.offsetY
  );
  const center = image.getCenterPoint();

  nextFrame.left = center.x - worldOffset.x;
  nextFrame.top = center.y - worldOffset.y;

  return nextFrame;
};

const attachSlotImageHitArea = (image: FabricImage) => {
  const runtime = getSlotImageRuntime(image);
  if (runtime?.originalContainsPoint) {
    return;
  }

  const nextRuntime = ensureSlotImageRuntime(image);
  nextRuntime.originalContainsPoint = image.containsPoint.bind(image);
  image.containsPoint = function (point: Point) {
    return isPointInsideSlotFrame(this, point);
  };
};

const detachSlotImageHitArea = (image: FabricImage) => {
  const runtime = getSlotImageRuntime(image);
  if (!runtime?.originalContainsPoint) {
    return;
  }

  image.containsPoint = runtime.originalContainsPoint;
  delete runtime.originalContainsPoint;

  if (
    !runtime.movingHandler &&
    !runtime.scalingHandler &&
    !runtime.rotatingHandler &&
    !runtime.modifiedHandler
  ) {
    clearSlotImageRuntime(image);
  }
};

const getSlotInteractionState = (image: FabricImageWithLock) => {
  if (!image.isLocked) {
    return {
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: false,
      hasControls: true,
      editable: true,
    };
  }

  return {
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    hasControls: false,
    editable: false,
  };
};

const applySlotImageTransform = (
  image: FabricImage,
  frameOverride?: Partial<SlotFrameState>,
  transformOverride?: {
    offsetX?: number;
    offsetY?: number;
    zoomScale?: number;
    baseScale?: number;
  }
) => {
  const slotImage = getSlotImageState(image);
  const baseFrame = getSlotFrameState(image);
  const frame: SlotFrameState = {
    width: frameOverride?.width ?? baseFrame.width,
    height: frameOverride?.height ?? baseFrame.height,
    left: frameOverride?.left ?? baseFrame.left,
    top: frameOverride?.top ?? baseFrame.top,
    angle: frameOverride?.angle ?? baseFrame.angle,
  };
  const resolved = getResolvedSlotImageTransform(image, frame);

  if (!resolved) {
    return false;
  }

  const zoomScale = clampSlotImageScale(
    transformOverride?.zoomScale ?? resolved.zoomScale
  );
  const offsetX = clampSlotImageOffset(
    transformOverride?.offsetX ?? resolved.offsetX
  );
  const offsetY = clampSlotImageOffset(
    transformOverride?.offsetY ?? resolved.offsetY
  );
  const placement = resolveSlotImagePlacement(
    frame,
    resolved.sourceWidth,
    resolved.sourceHeight,
    zoomScale,
    offsetX,
    offsetY,
    transformOverride?.baseScale ?? resolved.baseScale
  );

  image.set({
    originX: 'center',
    originY: 'center',
    left: placement.left,
    top: placement.top,
    angle: frame.angle,
    width: resolved.sourceWidth,
    height: resolved.sourceHeight,
    cropX: 0,
    cropY: 0,
    scaleX: placement.appliedScale,
    scaleY: placement.appliedScale,
    objectCaching: false,
    selectable: true,
    evented: true,
    isLocked: slotImage.isLocked ?? false,
    ...toSlotFrameFields(frame),
    ...toSlotImageTransformFields({
      baseScale: placement.baseScale,
      zoomScale,
      offsetX,
      offsetY,
    }),
    ...getSlotInteractionState(slotImage),
  });

  image.clipPath = createSlotClipPath(frame);
  applySlotFrameControlVisibility(slotImage);
  image.setCoords();

  return true;
};

const getMovedSlotFrameFromImage = (
  image: SlotImageBehaviorObject,
  frame: SlotFrameState
): SlotFrameState => {
  const nextAngle = image.angle ?? frame.angle;
  const nextFrame = {
    ...frame,
    angle: nextAngle,
  };
  const center = image.getCenterPoint();
  const worldOffset = getSlotWorldOffset(
    nextFrame,
    clampSlotImageOffset(image.slotImageOffsetX ?? 0),
    clampSlotImageOffset(image.slotImageOffsetY ?? 0)
  );

  nextFrame.left = center.x - worldOffset.x;
  nextFrame.top = center.y - worldOffset.y;

  return nextFrame;
};

const syncSlotImageToFrame = (
  image: SlotImageBehaviorObject,
  frame: SlotFrameState
) => {
  const sourceSize = getImageSourceSize(image);
  const resizedBaseScale = getSlotCoverScale(
    frame.width,
    frame.height,
    sourceSize.width,
    sourceSize.height
  );

  applySlotImageTransform(image, frame, {
    baseScale: resizedBaseScale,
    zoomScale: image.slotZoomScale,
    offsetX: image.slotImageOffsetX,
    offsetY: image.slotImageOffsetY,
  });
};

const syncSlotFrameFromImageTransform = (
  image: SlotImageBehaviorObject,
  mode: 'move' | 'resize' | 'rotate'
) => {
  if (image.isLocked) {
    return;
  }

  const runtime = ensureSlotImageRuntime(image);
  if (runtime.isSyncingTransform) {
    return;
  }

  runtime.isSyncingTransform = true;

  try {
    const frame = getSlotFrameState(image);
    const nextFrame =
      mode === 'resize'
        ? getResizedSlotFrameFromImage(image, frame)
        : mode === 'rotate'
          ? {
              ...frame,
              angle: image.angle ?? frame.angle,
            }
          : getMovedSlotFrameFromImage(image, frame);

    syncSlotImageToFrame(image, nextFrame);
    image.canvas?.requestRenderAll();
  } finally {
    runtime.isSyncingTransform = false;
  }
};

const attachSlotImageBehavior = (image: FabricImage) => {
  const slotImage = image as SlotImageBehaviorObject;
  const runtime = getSlotImageRuntime(slotImage);

  if (
    runtime?.movingHandler ||
    runtime?.scalingHandler ||
    runtime?.rotatingHandler ||
    runtime?.modifiedHandler
  ) {
    return;
  }

  const nextRuntime = ensureSlotImageRuntime(slotImage);
  nextRuntime.movingHandler = () => {
    nextRuntime.lastTransformMode = 'move';
    syncSlotFrameFromImageTransform(slotImage, 'move');
  };
  nextRuntime.scalingHandler = () => {
    nextRuntime.lastTransformMode = 'resize';
    syncSlotFrameFromImageTransform(slotImage, 'resize');
  };
  nextRuntime.rotatingHandler = () => {
    nextRuntime.lastTransformMode = 'rotate';
    syncSlotFrameFromImageTransform(slotImage, 'rotate');
  };
  nextRuntime.modifiedHandler = () => {
    syncSlotFrameFromImageTransform(
      slotImage,
      nextRuntime.lastTransformMode ?? 'resize'
    );
    delete nextRuntime.lastTransformMode;
  };

  slotImage.on('moving', nextRuntime.movingHandler);
  slotImage.on('scaling', nextRuntime.scalingHandler);
  slotImage.on('rotating', nextRuntime.rotatingHandler);
  slotImage.on('modified', nextRuntime.modifiedHandler);
};

const detachSlotImageBehavior = (image: FabricImage) => {
  const runtime = getSlotImageRuntime(image);

  if (runtime?.movingHandler) {
    image.off('moving', runtime.movingHandler);
    delete runtime.movingHandler;
  }

  if (runtime?.scalingHandler) {
    image.off('scaling', runtime.scalingHandler);
    delete runtime.scalingHandler;
  }

  if (runtime?.rotatingHandler) {
    image.off('rotating', runtime.rotatingHandler);
    delete runtime.rotatingHandler;
  }

  if (runtime?.modifiedHandler) {
    image.off('modified', runtime.modifiedHandler);
    delete runtime.modifiedHandler;
  }

  if (runtime) {
    delete runtime.isSyncingTransform;
    delete runtime.lastTransformMode;
  }

  if (
    runtime &&
    !runtime.originalContainsPoint &&
    !runtime.movingHandler &&
    !runtime.scalingHandler &&
    !runtime.rotatingHandler &&
    !runtime.modifiedHandler
  ) {
    clearSlotImageRuntime(image);
  }
};

const getCanvasSelectionAreaMethod = (
  canvas: CanvasSelectionAreaPatched
): ((obj: FabricObject, point: Point) => boolean) | null => {
  const method = canvas._pointIsInObjectSelectionArea;

  if (typeof method !== 'function') {
    return null;
  }

  return method.bind(canvas);
};

const attachSlotSelectionAreaPatch = (canvas: Canvas) => {
  const selectionCanvas = canvas as unknown as CanvasSelectionAreaPatched;
  const runtime = getSlotCanvasRuntime(canvas);
  if (runtime?.originalPointIsInObjectSelectionArea) {
    return;
  }

  const originalSelectionAreaMethod =
    getCanvasSelectionAreaMethod(selectionCanvas);
  if (!originalSelectionAreaMethod) {
    return;
  }

  const nextRuntime = ensureSlotCanvasRuntime(canvas);
  nextRuntime.originalPointIsInObjectSelectionArea =
    originalSelectionAreaMethod;
  selectionCanvas._pointIsInObjectSelectionArea = function (
    obj: FabricObject,
    point: Point
  ) {
    if (obj instanceof FabricImage && isReplaceableSlotImage(obj)) {
      const frame = getSlotFrameState(obj);
      const coords = getSlotFrameCoords(frame);
      const padding = (obj.padding || 0) / this.getZoom();

      if (padding) {
        const [tl, tr, br, bl] = coords;
        const angleRadians = Math.atan2(tr.y - tl.y, tr.x - tl.x);
        const cosP = Math.cos(angleRadians) * padding;
        const sinP = Math.sin(angleRadians) * padding;
        const cosPSinP = cosP + sinP;
        const cosPMinusSinP = cosP - sinP;

        return Intersection.isPointInPolygon(point, [
          new Point(tl.x - cosPMinusSinP, tl.y - cosPSinP),
          new Point(tr.x + cosPSinP, tr.y - cosPMinusSinP),
          new Point(br.x + cosPMinusSinP, br.y + cosPSinP),
          new Point(bl.x - cosPSinP, bl.y + cosPMinusSinP),
        ]);
      }

      return Intersection.isPointInPolygon(point, coords);
    }

    return (
      nextRuntime.originalPointIsInObjectSelectionArea?.(obj, point) ?? false
    );
  };
};

const detachSlotSelectionAreaPatch = (canvas: Canvas) => {
  const selectionCanvas = canvas as unknown as CanvasSelectionAreaPatched;
  const runtime = getSlotCanvasRuntime(canvas);
  if (!runtime?.originalPointIsInObjectSelectionArea) {
    return;
  }

  selectionCanvas._pointIsInObjectSelectionArea =
    runtime.originalPointIsInObjectSelectionArea;
  clearSlotCanvasRuntime(canvas);
};

export const useFabricSlot = ({
  canvas,
  saveHistory,
  syncActiveObjectInfo,
}: Props) => {
  useEffect(() => {
    if (!canvas) return;

    attachSlotSelectionAreaPatch(canvas);
    preloadSlotIconImages(() => canvas.requestRenderAll());

    return () => {
      detachSlotSelectionAreaPatch(canvas);
    };
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;

    const syncSlotObject = (target?: FabricObject | null) => {
      if (target instanceof Rect) {
        const slotRect = target as SlotRect;
        if (!slotRect.slot?.replaceable) {
          return;
        }

        attachSlotRectBehavior(target);
        updateSlotRectPattern(target);
        return;
      }

      if (target instanceof FabricImage) {
        const slotImage = target as SlotTargetObject;
        if (!slotImage.slot?.replaceable) {
          return;
        }

        applySlotImageTransform(target);
        attachSlotImageHitArea(target);
        attachSlotImageBehavior(target);
      }
    };

    canvas.getObjects().forEach(syncSlotObject);

    const handleObjectAdded = ({
      target,
    }: {
      target?: FabricObject | null;
    }) => {
      syncSlotObject(target);
    };

    canvas.on('object:added', handleObjectAdded);

    return () => {
      canvas.off('object:added', handleObjectAdded);
      canvas.getObjects().forEach(obj => {
        if (obj instanceof Rect) {
          detachSlotRectBehavior(obj);
        }

        if (obj instanceof FabricImage) {
          detachSlotImageBehavior(obj);
          detachSlotImageHitArea(obj);
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

    const frame = getSlotFrameState(targetImage);
    const slot = getSlotMeta(targetImage);
    if (!slot) return null;
    const targetSlotImage =
      targetImage instanceof FabricImage
        ? getSlotImageState(targetImage)
        : null;
    const nextImage = await FabricImage.fromURL(url, {
      crossOrigin: 'anonymous',
    });

    applySlotEntityToObject(nextImage as SlotTargetObject, {
      slotId: slot.key,
      meta: {
        ...slot,
        filled: true,
      },
      frame,
      image: {
        baseScale: 1,
        zoomScale: SLOT_IMAGE_SCALE_MIN,
        offsetX: 0,
        offsetY: 0,
      },
      imageObjectId: String(targetImage.get('id') ?? slot.key),
    });

    nextImage.set({
      id: targetImage.get('id'),
      flipX: targetImage.flipX,
      flipY: targetImage.flipY,
      opacity: targetImage.opacity,
      visible: targetImage.visible,
      isLocked: targetSlotImage?.isLocked ?? false,
    });

    if (targetImage instanceof FabricImage && targetImage.filters?.length) {
      nextImage.filters = [...targetImage.filters];
      nextImage.applyFilters();
    }

    applySlotImageTransform(nextImage, frame, {
      offsetX: 0,
      offsetY: 0,
      zoomScale: SLOT_IMAGE_SCALE_MIN,
    });

    canvas.remove(targetImage);
    canvas.insertAt(objectIndex, nextImage);
    nextImage.setCoords();
    canvas.setActiveObject(nextImage);
    canvas.requestRenderAll();
    syncActiveObjectInfo?.(canvas);
    saveHistory();

    return nextImage;
  };

  const restoreSlotPlaceholder = (
    targetImage: FabricObject,
    options?: {
      saveHistory?: boolean;
      syncActiveObjectInfo?: boolean;
    }
  ) => {
    if (!canvas) return null;

    const slot = getSlotMeta(targetImage);
    if (!slot?.replaceable) return null;

    const objectIndex = canvas.getObjects().indexOf(targetImage);
    if (objectIndex < 0) return null;

    const frame = getSlotFrameState(targetImage);
    const placeholder = new Rect({
      left: frame.left,
      top: frame.top,
      width: frame.width,
      height: frame.height,
      angle: frame.angle,
      originX: 'center',
      originY: 'center',
      objectCaching: false,
      selectable: true,
      evented: true,
      hasControls: true,
    }) as SlotRect;

    applySlotEntityToObject(placeholder, {
      slotId: slot.key,
      meta: {
        ...slot,
        filled: false,
      },
      frame,
      image: {
        baseScale: 1,
        zoomScale: SLOT_IMAGE_SCALE_MIN,
        offsetX: 0,
        offsetY: 0,
      },
    });

    applySlotMetadata(placeholder);
    attachSlotRectBehavior(placeholder as Rect);

    canvas.remove(targetImage);
    canvas.insertAt(objectIndex, placeholder);
    placeholder.setCoords();
    canvas.requestRenderAll();

    if (options?.syncActiveObjectInfo) {
      syncActiveObjectInfo?.(canvas);
    }

    if (options?.saveHistory) {
      saveHistory();
    }

    return placeholder;
  };

  const getSlotImagePosition = (image: FabricImage) => {
    const slotImage = getSlotImageState(image);

    return {
      x: clampSlotImageOffset(slotImage.slotImageOffsetX ?? 0),
      y: clampSlotImageOffset(slotImage.slotImageOffsetY ?? 0),
    };
  };

  const getSlotImageScale = (image: FabricImage) => {
    return getSlotImageState(image).slotZoomScale ?? SLOT_IMAGE_SCALE_MIN;
  };

  const updateSlotImageScale = (
    image: FabricImage,
    value: number,
    options?: {
      saveHistory?: boolean;
      syncActiveObjectInfo?: boolean;
    }
  ) => {
    if (!canvas) return;

    if (
      !applySlotImageTransform(image, undefined, {
        zoomScale: value,
      })
    ) {
      return;
    }

    canvas.setActiveObject(image);
    canvas.requestRenderAll();

    if (options?.syncActiveObjectInfo) {
      syncActiveObjectInfo?.(canvas);
    }

    if (options?.saveHistory) {
      saveHistory();
    }
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

    const slotImage = getSlotImageState(image);
    const nextOffset = clampSlotImageOffset(value);

    if (
      !applySlotImageTransform(image, undefined, {
        offsetX: axis === 'x' ? nextOffset : slotImage.slotImageOffsetX,
        offsetY: axis === 'y' ? nextOffset : slotImage.slotImageOffsetY,
      })
    ) {
      return;
    }

    canvas.setActiveObject(image);
    canvas.requestRenderAll();

    if (options?.syncActiveObjectInfo) {
      syncActiveObjectInfo?.(canvas);
    }

    if (options?.saveHistory) {
      saveHistory();
    }
  };

  const getSlotEntity = (target?: FabricObject | null) => {
    if (!target) {
      return null;
    }

    return getSlotEntityByTarget(target);
  };

  const getActiveSlotEntity = () => {
    if (!canvas) {
      return null;
    }

    return getSlotEntity(canvas.getActiveObject());
  };

  const findSlotTargetBySlotId = (slotId: string) => {
    if (!canvas) {
      return null;
    }

    return findPrimarySlotTargetBySlotId(canvas, slotId);
  };

  const findSlotImageBySlotId = (slotId: string) => {
    const target = findSlotTargetBySlotId(slotId);

    return target instanceof FabricImage ? target : null;
  };

  const replaceSlotImageBySlot = async (slotId: string, url: string) => {
    const target = findSlotTargetBySlotId(slotId);
    if (!target) {
      return null;
    }

    return replaceSlotImage(target, url);
  };

  const restoreSlotPlaceholderBySlot = (
    slotId: string,
    options?: {
      saveHistory?: boolean;
      syncActiveObjectInfo?: boolean;
    }
  ) => {
    const target = findSlotTargetBySlotId(slotId);
    if (!target) {
      return null;
    }

    return restoreSlotPlaceholder(target, options);
  };

  const getSlotImagePositionBySlot = (slotId: string) => {
    const image = findSlotImageBySlotId(slotId);

    return image ? getSlotImagePosition(image) : null;
  };

  const getSlotImageScaleBySlot = (slotId: string) => {
    const image = findSlotImageBySlotId(slotId);

    return image ? getSlotImageScale(image) : null;
  };

  const updateSlotImageScaleBySlot = (
    slotId: string,
    value: number,
    options?: {
      saveHistory?: boolean;
      syncActiveObjectInfo?: boolean;
    }
  ) => {
    const image = findSlotImageBySlotId(slotId);
    if (!image) {
      return false;
    }

    updateSlotImageScale(image, value, options);

    return true;
  };

  const updateSlotImagePositionBySlot = (
    slotId: string,
    axis: 'x' | 'y',
    value: number,
    options?: {
      saveHistory?: boolean;
      syncActiveObjectInfo?: boolean;
    }
  ) => {
    const image = findSlotImageBySlotId(slotId);
    if (!image) {
      return false;
    }

    updateSlotImagePosition(image, axis, value, options);

    return true;
  };

  const exportSlotImagePreviewBySlot = (slotId: string) => {
    const image = findSlotImageBySlotId(slotId);

    return image ? exportSlotImagePreview(image) : '';
  };

  const exportSlotImagePreview = (image: FabricImage) => {
    if (!canvas) return '';

    const frame = getSlotFrameState(image);
    if (!frame.width || !frame.height) return '';

    const bounds = getSlotBoundingBox(frame);
    const objectsToHide = canvas.getObjects().filter(obj => obj !== image);
    const visibilitySnapshot = objectsToHide.map(obj => obj.visible);
    const activeObject = canvas.getActiveObject();

    if (activeObject && activeObject !== image) {
      canvas.discardActiveObject();
    }

    objectsToHide.forEach(obj => {
      obj.set('visible', false);
    });

    canvas.requestRenderAll();

    const previewDataUrl = canvas.toDataURL({
      format: 'webp',
      quality: 0.8,
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
      multiplier: getPreviewExportMultiplier(bounds.width, bounds.height),
    });

    objectsToHide.forEach((obj, index) => {
      obj.set('visible', visibilitySnapshot[index]);
    });

    if (activeObject && activeObject !== image) {
      canvas.setActiveObject(activeObject);
    }

    canvas.requestRenderAll();

    return previewDataUrl;
  };

  return {
    addSlotRect,
    convertActiveRectToSlot,
    unregisterActiveSlot,

    replaceSlotImage,
    restoreSlotPlaceholder,
    getSlotImagePosition,
    updateSlotImagePosition,
    getSlotImageScale,
    updateSlotImageScale,
    exportSlotImagePreview,

    replaceSlotImageBySlot,
    restoreSlotPlaceholderBySlot,
    getSlotImagePositionBySlot,
    updateSlotImagePositionBySlot,
    getSlotImageScaleBySlot,
    updateSlotImageScaleBySlot,
    exportSlotImagePreviewBySlot,
    getSlotEntity,
    getActiveSlotEntity,
  };
};
