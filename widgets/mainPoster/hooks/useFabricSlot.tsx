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

type SlotFrameState = {
  width: number;
  height: number;
  left: number;
  top: number;
  angle: number;
};

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
const SLOT_IMAGE_SCALE_MIN = 100;
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

const getSlotFrameState = (target: FabricObject): SlotFrameState => {
  const slotImage = target as FabricImageWithLock;
  const center = target.getCenterPoint();

  return {
    width: slotImage.slotFrameWidth ?? target.getScaledWidth(),
    height: slotImage.slotFrameHeight ?? target.getScaledHeight(),
    left: slotImage.slotFrameLeft ?? center.x,
    top: slotImage.slotFrameTop ?? center.y,
    angle: slotImage.slotFrameAngle ?? target.angle ?? 0,
  };
};

const getSlotCoverScale = (
  frameWidth: number,
  frameHeight: number,
  sourceWidth: number,
  sourceHeight: number
) => Math.max(frameWidth / sourceWidth, frameHeight / sourceHeight);

const getSlotWorldOffset = (
  frame: SlotFrameState,
  offsetX: number,
  offsetY: number
) => {
  const offsetXPx = (frame.width * offsetX) / 100;
  const offsetYPx = (frame.height * offsetY) / 100;
  const radians = (frame.angle * Math.PI) / 180;

  return {
    x: offsetXPx * Math.cos(radians) - offsetYPx * Math.sin(radians),
    y: offsetXPx * Math.sin(radians) + offsetYPx * Math.cos(radians),
  };
};

const createSlotClipPath = (frame: SlotFrameState) =>
  new Rect({
    left: frame.left,
    top: frame.top,
    width: frame.width,
    height: frame.height,
    angle: frame.angle,
    originX: 'center',
    originY: 'center',
    absolutePositioned: true,
  });

const getSlotFrameCoords = (frame: SlotFrameState): Point[] => {
  const radians = (frame.angle * Math.PI) / 180;
  const halfWidth = frame.width / 2;
  const halfHeight = frame.height / 2;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const corners = [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight },
  ];

  return corners.map(
    corner =>
      new Point(
        frame.left + corner.x * cos - corner.y * sin,
        frame.top + corner.x * sin + corner.y * cos
      )
  );
};

const getSlotBoundingBox = (frame: SlotFrameState) => {
  const radians = (frame.angle * Math.PI) / 180;
  const absCos = Math.abs(Math.cos(radians));
  const absSin = Math.abs(Math.sin(radians));
  const width = frame.width * absCos + frame.height * absSin;
  const height = frame.width * absSin + frame.height * absCos;

  return {
    left: frame.left - width / 2,
    top: frame.top - height / 2,
    width,
    height,
  };
};

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

  if (!runtime.movingHandler && !runtime.modifiedHandler) {
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
  const baseScale = transformOverride?.baseScale ?? resolved.baseScale;
  const appliedScale = baseScale * (zoomScale / 100);
  const worldOffset = getSlotWorldOffset(frame, offsetX, offsetY);

  image.set({
    originX: 'center',
    originY: 'center',
    left: frame.left + worldOffset.x,
    top: frame.top + worldOffset.y,
    angle: frame.angle,
    width: resolved.sourceWidth,
    height: resolved.sourceHeight,
    cropX: 0,
    cropY: 0,
    scaleX: appliedScale,
    scaleY: appliedScale,
    objectCaching: false,
    selectable: true,
    evented: true,
    isLocked: slotImage.isLocked ?? false,
    slotFrameWidth: frame.width,
    slotFrameHeight: frame.height,
    slotFrameLeft: frame.left,
    slotFrameTop: frame.top,
    slotFrameAngle: frame.angle,
    slotImageBaseScale: baseScale,
    slotImageOffsetX: offsetX,
    slotImageOffsetY: offsetY,
    slotZoomScale: zoomScale,
    ...getSlotInteractionState(slotImage),
  });

  image.clipPath = createSlotClipPath(frame);
  applySlotFrameControlVisibility(slotImage);
  image.setCoords();

  return true;
};

const attachSlotImageBehavior = (image: FabricImage) => {
  const slotImage = image as SlotImageBehaviorObject;
  const runtime = getSlotImageRuntime(slotImage);

  if (runtime?.movingHandler || runtime?.modifiedHandler) {
    return;
  }

  const nextRuntime = ensureSlotImageRuntime(slotImage);
  nextRuntime.movingHandler = () => {
    if (slotImage.isLocked) {
      return;
    }

    const frame = getSlotFrameState(slotImage);
    const center = slotImage.getCenterPoint();
    const currentFrameLeft = frame.left;
    const currentFrameTop = frame.top;
    const lastFrameLeft = nextRuntime.dragLastFrameLeft ?? currentFrameLeft;
    const lastFrameTop = nextRuntime.dragLastFrameTop ?? currentFrameTop;
    const worldOffset = getSlotWorldOffset(
      frame,
      clampSlotImageOffset(slotImage.slotImageOffsetX ?? 0),
      clampSlotImageOffset(slotImage.slotImageOffsetY ?? 0)
    );
    const expectedImageLeft = currentFrameLeft + worldOffset.x;
    const expectedImageTop = currentFrameTop + worldOffset.y;
    const deltaX = center.x - expectedImageLeft;
    const deltaY = center.y - expectedImageTop;
    const nextFrameLeft = lastFrameLeft + deltaX;
    const nextFrameTop = lastFrameTop + deltaY;

    applySlotImageTransform(slotImage, {
      left: nextFrameLeft,
      top: nextFrameTop,
    });
    nextRuntime.dragLastFrameLeft = nextFrameLeft;
    nextRuntime.dragLastFrameTop = nextFrameTop;
    slotImage.canvas?.requestRenderAll();
  };

  nextRuntime.modifiedHandler = () => {
    if (slotImage.isLocked) {
      return;
    }

    const frame = getSlotFrameState(slotImage);
    const resizedFrame = getResizedSlotFrameFromImage(slotImage, frame);
    const sourceSize = getImageSourceSize(slotImage);
    const resizedBaseScale = getSlotCoverScale(
      resizedFrame.width,
      resizedFrame.height,
      sourceSize.width,
      sourceSize.height
    );

    delete nextRuntime.dragLastFrameLeft;
    delete nextRuntime.dragLastFrameTop;

    applySlotImageTransform(slotImage, resizedFrame, {
      baseScale: resizedBaseScale,
      zoomScale: slotImage.slotZoomScale,
      offsetX: slotImage.slotImageOffsetX,
      offsetY: slotImage.slotImageOffsetY,
    });

    slotImage.canvas?.requestRenderAll();
  };

  slotImage.on('moving', nextRuntime.movingHandler);
  slotImage.on('modified', nextRuntime.modifiedHandler);
};

const detachSlotImageBehavior = (image: FabricImage) => {
  const runtime = getSlotImageRuntime(image);

  if (runtime?.movingHandler) {
    image.off('moving', runtime.movingHandler);
    delete runtime.movingHandler;
  }

  if (runtime?.modifiedHandler) {
    image.off('modified', runtime.modifiedHandler);
    delete runtime.modifiedHandler;
  }

  if (runtime) {
    delete runtime.dragLastFrameLeft;
    delete runtime.dragLastFrameTop;
  }

  if (
    runtime &&
    !runtime.originalContainsPoint &&
    !runtime.movingHandler &&
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
    const slot = ((targetImage as SlotTargetObject).slot ||
      {}) as ImageSlotMeta;
    const targetSlotImage =
      targetImage instanceof FabricImage
        ? getSlotImageState(targetImage)
        : null;
    const nextImage = await FabricImage.fromURL(url, {
      crossOrigin: 'anonymous',
    });

    nextImage.set({
      id: targetImage.get('id'),
      slot: {
        ...slot,
        filled: true,
      },
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

    const slot = (targetImage as SlotTargetObject).slot;
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

    placeholder.slot = {
      ...slot,
      filled: false,
    };

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

  // 현재 페브릭 객체에서 슬롯 도메인 데이터를 읽어오기
  const getSlotEntity = (target?: FabricObject | null) => {
    if (!target) {
      return null;
    }

    return getSlotEntityByTarget(target);
  };

  // 액티브된 캔버스의 선택 객체를 슬롯 엔티티로 읽어오기
  const getActiveSlotEntity = () => {
    if (!canvas) {
      return null;
    }

    return getSlotEntity(canvas.getActiveObject());
  };

  // 슬롯 id를 기반으로 슬롯 도메인 객체를 찾아 반환
  const findSlotTargetBySlotId = (slotId: string) => {
    if (!canvas) {
      return null;
    }

    return findPrimarySlotTargetBySlotId(canvas, slotId);
  };

  // 슬롯 id를 기반으로 렌더링된 이미지 객체를 찾아 반환
  const findSlotImageBySlotId = (slotId: string) => {
    const target = findSlotTargetBySlotId(slotId);

    return target instanceof FabricImage ? target : null;
  };

  // 이미지 교체를 슬롯 아이디를 기반으로 수행하는 엔트리 포인트
  const replaceSlotImageBySlot = async (slotId: string, url: string) => {
    const target = findSlotTargetBySlotId(slotId);
    if (!target) {
      return null;
    }

    return replaceSlotImage(target, url);
  };

  // 플레이스홀더 복원을 슬롯 아이디를 기반으로 수행하는 엔트리 포인트
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

  // 슬롯 아이디를 기반으로 위치를 읽어오는 엔트리 포인트
  const getSlotImagePositionBySlot = (slotId: string) => {
    const image = findSlotImageBySlotId(slotId);

    return image ? getSlotImagePosition(image) : null;
  };

  // 슬롯 아이디를 기반으로 이미지 스케일을 읽어오는 엔트리 포인트
  const getSlotImageScaleBySlot = (slotId: string) => {
    const image = findSlotImageBySlotId(slotId);

    return image ? getSlotImageScale(image) : null;
  };

  // 슬롯 아이디를 기반으로 이미지 스케일을 업데이트하는 엔트리 포인트
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

  // 슬롯 아이디를 기반으로 이미지 위치를 업데이트하는 엔트리 포인트
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

  // 슬롯 아이디를 기반으로 이미지 프리뷰를 내보내는 엔트리 포인트
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

    // 레거시를 위한 Object 기반 API
    replaceSlotImage,
    restoreSlotPlaceholder,
    getSlotImagePosition,
    updateSlotImagePosition,
    getSlotImageScale,
    updateSlotImageScale,
    exportSlotImagePreview,

    // 슬롯 ID 기반 API
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
