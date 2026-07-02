import { Canvas, FabricImage, FabricObject, Intersection, Pattern, Point, Rect } from 'fabric';
import { useEffect } from 'react';

import {
  SLOT_UPLOAD_ICON_SVG,
  SLOT_UPLOAD_SMALL_ICON_SVG,
} from '../constants/fabric';
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
  __slotPlaceholderBaseRender?: (ctx: CanvasRenderingContext2D) => void;
  __slotPlaceholderModifiedHandler?: () => void;
};

type SlotImageBehaviorObject = FabricImageWithLock & {
  __slotImageMovingHandler?: () => void;
  __slotImageModifiedHandler?: () => void;
  __slotDragLastFrameLeft?: number;
  __slotDragLastFrameTop?: number;
  __slotOriginalContainsPoint?: FabricObject['containsPoint'];
};

type SlotFrameState = {
  width: number;
  height: number;
  left: number;
  top: number;
  angle: number;
};

type SlotCanvasWithSelectionAreaPatch = Canvas & {
  __slotOriginalPointIsInObjectSelectionArea?: (
    obj: FabricObject,
    point: Point
  ) => boolean;
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
    tl: false,
    tr: false,
    bl: false,
    br: false,
    mt: false,
    mb: false,
    ml: false,
    mr: false,
    mtr: false,
    tl_rotate: true,
    tr_rotate: true,
    bl_rotate: true,
    br_rotate: true,
  });
};

const attachSlotImageHitArea = (image: FabricImage) => {
  const slotImage = image as SlotImageBehaviorObject;

  if (slotImage.__slotOriginalContainsPoint) {
    return;
  }

  slotImage.__slotOriginalContainsPoint = image.containsPoint.bind(image);
  image.containsPoint = function (point: Point) {
    return isPointInsideSlotFrame(this, point);
  };
};

const detachSlotImageHitArea = (image: FabricImage) => {
  const slotImage = image as SlotImageBehaviorObject;

  if (!slotImage.__slotOriginalContainsPoint) {
    return;
  }

  image.containsPoint = slotImage.__slotOriginalContainsPoint;
  delete slotImage.__slotOriginalContainsPoint;
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
  const { width: sourceWidth, height: sourceHeight } =
    getImageSourceSize(image);

  if (!sourceWidth || !sourceHeight || !frame.width || !frame.height) {
    return false;
  }

  const legacyTransform = getLegacySlotTransform(image, frame);
  const baseScale =
    slotImage.slotImageBaseScale ??
    legacyTransform?.baseScale ??
    getSlotCoverScale(frame.width, frame.height, sourceWidth, sourceHeight);
  const zoomScale = clampSlotImageScale(
    transformOverride?.zoomScale ??
      slotImage.slotZoomScale ??
      legacyTransform?.zoomScale ??
      SLOT_IMAGE_SCALE_MIN
  );
  const offsetX = clampSlotImageOffset(
    transformOverride?.offsetX ??
      slotImage.slotImageOffsetX ??
      legacyTransform?.offsetX ??
      0
  );
  const offsetY = clampSlotImageOffset(
    transformOverride?.offsetY ??
      slotImage.slotImageOffsetY ??
      legacyTransform?.offsetY ??
      0
  );
  const appliedScale = baseScale * (zoomScale / 100);
  const worldOffset = getSlotWorldOffset(frame, offsetX, offsetY);

  image.set({
    originX: 'center',
    originY: 'center',
    left: frame.left + worldOffset.x,
    top: frame.top + worldOffset.y,
    angle: frame.angle,
    width: sourceWidth,
    height: sourceHeight,
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

  if (
    slotImage.__slotImageMovingHandler ||
    slotImage.__slotImageModifiedHandler
  ) {
    return;
  }

  slotImage.__slotImageMovingHandler = () => {
    if (slotImage.isLocked) {
      return;
    }
    const frame = getSlotFrameState(slotImage);
    const center = slotImage.getCenterPoint();
    const currentFrameLeft = frame.left;
    const currentFrameTop = frame.top;
    const lastFrameLeft = slotImage.__slotDragLastFrameLeft ?? currentFrameLeft;
    const lastFrameTop = slotImage.__slotDragLastFrameTop ?? currentFrameTop;
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
    slotImage.__slotDragLastFrameLeft = nextFrameLeft;
    slotImage.__slotDragLastFrameTop = nextFrameTop;
    slotImage.canvas?.requestRenderAll();
  };

  slotImage.__slotImageModifiedHandler = () => {
    if (slotImage.isLocked) {
      return;
    }

    const frame = getSlotFrameState(slotImage);

    delete slotImage.__slotDragLastFrameLeft;
    delete slotImage.__slotDragLastFrameTop;

    applySlotImageTransform(slotImage, {
      width: frame.width,
      height: frame.height,
      left: frame.left,
      top: frame.top,
      angle: slotImage.angle ?? frame.angle,
    });

    slotImage.canvas?.requestRenderAll();
  };

  slotImage.on('moving', slotImage.__slotImageMovingHandler);
  slotImage.on('modified', slotImage.__slotImageModifiedHandler);
};

const detachSlotImageBehavior = (image: FabricImage) => {
  const slotImage = image as SlotImageBehaviorObject;

  if (slotImage.__slotImageMovingHandler) {
    slotImage.off('moving', slotImage.__slotImageMovingHandler);
    delete slotImage.__slotImageMovingHandler;
  }

  if (slotImage.__slotImageModifiedHandler) {
    slotImage.off('modified', slotImage.__slotImageModifiedHandler);
    delete slotImage.__slotImageModifiedHandler;
  }
};

const attachSlotSelectionAreaPatch = (canvas: Canvas) => {
  const slotCanvas = canvas as SlotCanvasWithSelectionAreaPatch;

  if (slotCanvas.__slotOriginalPointIsInObjectSelectionArea) {
    return;
  }

  slotCanvas.__slotOriginalPointIsInObjectSelectionArea = (
    canvas as any)._pointIsInObjectSelectionArea.bind(canvas);
  (canvas as any)._pointIsInObjectSelectionArea = function (
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

    return slotCanvas.__slotOriginalPointIsInObjectSelectionArea?.(obj, point) ?? false;
  };
};

const detachSlotSelectionAreaPatch = (canvas: Canvas) => {
  const slotCanvas = canvas as SlotCanvasWithSelectionAreaPatch;

  if (!slotCanvas.__slotOriginalPointIsInObjectSelectionArea) {
    return;
  }

  (canvas as any)._pointIsInObjectSelectionArea =
    slotCanvas.__slotOriginalPointIsInObjectSelectionArea;
  delete slotCanvas.__slotOriginalPointIsInObjectSelectionArea;
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
  };
};

