import {
  FabricObject,
  Textbox,
  Control,
  Point,
  controlsUtils,
  util,
  TMat2D,
} from 'fabric';
import { useEffect } from 'react';

import { CORNERS_CONFIG, MOVE_ICON, SIDES_CONFIG } from '../constants/fabric';
import {
  SLOT_IMAGE_SCALE_MIN,
  createSlotClipPath,
  getSlotFrameState,
  getSlotSourceSize,
  hasSlotFrameBounds,
  resolveSlotImagePlacement,
  toFrameLocalPoint,
  toFrameWorldPoint,
} from '../slot/frameGeometry';
import {
  createFabricControlImage,
  getRotatedCursorUrl,
  isImageReadyForCanvas,
} from '../utils/fabricUtils';
import { patchSlotSelectionBorder } from '../utils/slotSelectionBorder';

import type { SlotFrameTransformTarget } from '../slot/frameGeometry';
import type { SlotFrame } from '../slot/types';

const DIAGONAL_CORNERS = ['tl', 'tr', 'bl', 'br'];
const HORIZONTAL_CORNERS = ['ml', 'mr'];
const VERTICAL_CORNERS = ['mt', 'mb'];

type FabricObjectLike = {
  type?: string;
  angle?: number;
  canvas?: {
    requestRenderAll?: () => void;
    getZoom?: () => number;
  };
  isType?: (type: string) => boolean;
  getTotalAngle?: () => number;
};

type ControlStyleTarget = {
  borderColor?: string;
  borderScaleFactor?: number;
  cornerStrokeColor?: string;
  cornerSize?: number;
  transparentCorners?: boolean;
  cornerColor?: string;
};

type ControlDefaultsTarget = ControlStyleTarget & {
  controls: Record<string, Control>;
  snapAngle?: number;
  snapThreshold?: number;
};

type SlotFrameControlTarget = FabricObjectLike & {
  slotFrameWidth?: number;
  slotFrameHeight?: number;
  slotFrameLeft?: number;
  slotFrameTop?: number;
  slotFrameAngle?: number;
  getCenterPoint: () => Point;
};

type SlotFrameState = SlotFrame;

const applySlotFrameTransform = (
  target: SlotFrameTransformTarget,
  frame: SlotFrameState
) => {
  const sourceSize = getSlotSourceSize(target);
  if (!sourceSize.width || !sourceSize.height) {
    return false;
  }

  const zoomScale = target.slotZoomScale ?? SLOT_IMAGE_SCALE_MIN;
  const offsetX = target.slotImageOffsetX ?? 0;
  const offsetY = target.slotImageOffsetY ?? 0;
  const placement = resolveSlotImagePlacement(
    frame,
    sourceSize.width,
    sourceSize.height,
    zoomScale,
    offsetX,
    offsetY
  );

  target.set({
    originX: 'center',
    originY: 'center',
    left: placement.left,
    top: placement.top,
    angle: frame.angle,
    scaleX: placement.appliedScale,
    scaleY: placement.appliedScale,
    slotFrameWidth: frame.width,
    slotFrameHeight: frame.height,
    slotFrameLeft: frame.left,
    slotFrameTop: frame.top,
    slotFrameAngle: frame.angle,
    slotImageBaseScale: placement.baseScale,
    objectCaching: false,
    selectable: true,
    evented: true,
  });
  target.clipPath = createSlotClipPath(frame);
  target.setCoords();
  target.canvas?.requestRenderAll?.();

  return true;
};

const SLOT_RESIZE_CURSORS = [
  'ns-resize',
  'nesw-resize',
  'ew-resize',
  'nwse-resize',
] as const;

const getSlotResizeCursor = (
  corner: string,
  fabricObject: FabricObjectLike
) => {
  const angle = fabricObject.getTotalAngle?.() ?? fabricObject.angle ?? 0;
  const normalized = ((angle % 180) + 180) % 180;
  const quarterTurn = Math.round(normalized / 45) % 4;
  const baseIndex = HORIZONTAL_CORNERS.includes(corner)
    ? 2
    : VERTICAL_CORNERS.includes(corner)
      ? 0
      : corner === 'tr' || corner === 'bl'
        ? 1
        : 3;

  return SLOT_RESIZE_CURSORS[(baseIndex + quarterTurn) % 4];
};

const getScaledFrameFromSideControl = (
  frame: SlotFrameState,
  corner: string,
  x: number,
  y: number
): SlotFrameState | null => {
  const local = toFrameLocalPoint(frame, x, y);
  const halfWidth = frame.width / 2;
  const halfHeight = frame.height / 2;

  if (corner === 'ml') {
    const fixedX = halfWidth;
    const nextX = Math.min(local.x, fixedX - 1);
    const center = toFrameWorldPoint(frame, (fixedX + nextX) / 2, 0);
    return { ...frame, left: center.x, top: center.y, width: fixedX - nextX };
  }

  if (corner === 'mr') {
    const fixedX = -halfWidth;
    const nextX = Math.max(local.x, fixedX + 1);
    const center = toFrameWorldPoint(frame, (fixedX + nextX) / 2, 0);
    return { ...frame, left: center.x, top: center.y, width: nextX - fixedX };
  }

  if (corner === 'mt') {
    const fixedY = halfHeight;
    const nextY = Math.min(local.y, fixedY - 1);
    const center = toFrameWorldPoint(frame, 0, (fixedY + nextY) / 2);
    return { ...frame, left: center.x, top: center.y, height: fixedY - nextY };
  }

  if (corner === 'mb') {
    const fixedY = -halfHeight;
    const nextY = Math.max(local.y, fixedY + 1);
    const center = toFrameWorldPoint(frame, 0, (fixedY + nextY) / 2);
    return { ...frame, left: center.x, top: center.y, height: nextY - fixedY };
  }

  return null;
};

const getScaledFrameFromCornerControl = (
  frame: SlotFrameState,
  corner: string,
  x: number,
  y: number
): SlotFrameState | null => {
  const signX = corner.includes('l') ? -1 : 1;
  const signY = corner.includes('t') ? -1 : 1;
  const local = toFrameLocalPoint(frame, x, y);
  const fixedX = (-signX * frame.width) / 2;
  const fixedY = (-signY * frame.height) / 2;
  const nextWidth = Math.max(1, (local.x - fixedX) * signX);
  const nextHeight = Math.max(1, (local.y - fixedY) * signY);
  const scale = Math.max(nextWidth / frame.width, nextHeight / frame.height);
  const width = Math.max(1, frame.width * scale);
  const height = Math.max(1, frame.height * scale);
  const center = toFrameWorldPoint(
    frame,
    fixedX + (signX * width) / 2,
    fixedY + (signY * height) / 2
  );

  return {
    left: center.x,
    top: center.y,
    width,
    height,
    angle: frame.angle,
  };
};

const defaultPositionHandler: NonNullable<Control['positionHandler']> = (
  dim,
  finalMatrix,
  _fabricObject,
  currentControl
) => {
  const matrix = finalMatrix ?? [1, 0, 0, 1, 0, 0];
  const controlX = currentControl?.x ?? 0;
  const controlY = currentControl?.y ?? 0;
  const offsetX = currentControl?.offsetX ?? 0;
  const offsetY = currentControl?.offsetY ?? 0;
  const dimX = dim?.x ?? 0;
  const dimY = dim?.y ?? 0;

  return new Point(
    controlX * dimX + offsetX,
    controlY * dimY + offsetY
  ).transform(matrix);
};

const invokePositionHandler = (
  handler: Control['positionHandler'] | undefined,
  dim: Point,
  finalMatrix: TMat2D,
  fabricObject: FabricObjectLike,
  currentControl: Control
) => {
  if (handler) {
    return handler.call(
      currentControl,
      dim,
      finalMatrix,
      fabricObject as never,
      currentControl
    );
  }

  return defaultPositionHandler(
    dim,
    finalMatrix,
    fabricObject as never,
    currentControl
  );
};

const createFrameAwarePositionHandler = (
  fallback?: Control['positionHandler']
): NonNullable<Control['positionHandler']> => {
  return (dim, finalMatrix, fabricObject, currentControl) => {
    if (!fabricObject) {
      return defaultPositionHandler(
        dim,
        finalMatrix,
        fabricObject as never,
        currentControl
      );
    }

    if (!hasSlotFrameBounds(fabricObject)) {
      return invokePositionHandler(
        fallback,
        dim,
        (finalMatrix ?? [1, 0, 0, 1, 0, 0]) as TMat2D,
        fabricObject,
        currentControl
      );
    }

    const target = fabricObject as SlotFrameControlTarget;
    const frameWidth = target.slotFrameWidth ?? 0;
    const frameHeight = target.slotFrameHeight ?? 0;
    const frameLeft = target.slotFrameLeft ?? 0;
    const frameTop = target.slotFrameTop ?? 0;
    const frameAngle = target.slotFrameAngle ?? target.angle ?? 0;
    const center = target.getCenterPoint();
    const radians = util.degreesToRadians(frameAngle);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const deltaX = frameLeft - center.x;
    const deltaY = frameTop - center.y;
    const localCenterX = deltaX * cos + deltaY * sin;
    const localCenterY = -deltaX * sin + deltaY * cos;
    const zoom = target.canvas?.getZoom?.() || 1;
    const controlX = currentControl?.x ?? 0;
    const controlY = currentControl?.y ?? 0;
    const offsetX = (currentControl?.offsetX ?? 0) / zoom;
    const offsetY = (currentControl?.offsetY ?? 0) / zoom;
    const matrix = finalMatrix ?? [1, 0, 0, 1, 0, 0];
    const localX = localCenterX + frameWidth * controlX + offsetX;
    const localY = localCenterY + frameHeight * controlY + offsetY;

    return util.transformPoint(new Point(localX, localY), matrix);
  };
};

const isTextboxObject = (target?: FabricObjectLike | null) => {
  if (!target) return false;

  return typeof target.isType === 'function'
    ? target.isType('textbox') || target.isType('itext')
    : target.type === 'textbox' || target.type === 'itext';
};

type ControlRender = NonNullable<Control['render']>;
type ControlCursorStyleHandler = NonNullable<Control['cursorStyleHandler']>;
type ControlActionHandler = NonNullable<Control['actionHandler']>;

type RenderSquareStyleOverride = Parameters<
  typeof controlsUtils.renderSquareControl
>[3];

type RenderSquareFabricObject = Parameters<
  typeof controlsUtils.renderSquareControl
>[4];

type ScaleCursorEventData = Parameters<
  typeof controlsUtils.scaleCursorStyleHandler
>[0];

type ScaleCursorControl = Parameters<
  typeof controlsUtils.scaleCursorStyleHandler
>[1];

type ScaleCursorFabricObject = Parameters<
  typeof controlsUtils.scaleCursorStyleHandler
>[2];

type ScaleCursorCoord = Parameters<
  typeof controlsUtils.scaleCursorStyleHandler
>[3];

const renderSquareControl: ControlRender = function (
  this: Control,
  ctx,
  left,
  top,
  styleOverride,
  fabricObject
) {
  return controlsUtils.renderSquareControl.call(
    this,
    ctx,
    left,
    top,
    (styleOverride ?? {}) as RenderSquareStyleOverride,
    fabricObject as unknown as RenderSquareFabricObject
  );
};

const scaleCursorStyleHandler: ControlCursorStyleHandler = function (
  this: Control,
  eventData,
  control,
  fabricObject,
  coord
) {
  return controlsUtils.scaleCursorStyleHandler.call(
    this,
    eventData as ScaleCursorEventData,
    control as ScaleCursorControl,
    fabricObject as unknown as ScaleCursorFabricObject,
    coord as ScaleCursorCoord
  );
};

const normalizeAngle = (angle: number) => {
  if (angle < 0) {
    return (360 + (angle % 360)) % 360;
  }

  return angle % 360;
};

const applyRotationSnap = (
  angle: number,
  target: SlotFrameTransformTarget
): number => {
  const snapAngle = target.snapAngle;
  if (!snapAngle || snapAngle <= 0) {
    return normalizeAngle(angle);
  }

  const snapThreshold = target.snapThreshold || snapAngle;
  const rightAngleLocked = Math.ceil(angle / snapAngle) * snapAngle;
  const leftAngleLocked = Math.floor(angle / snapAngle) * snapAngle;

  if (Math.abs(angle - leftAngleLocked) < snapThreshold) {
    return normalizeAngle(leftAngleLocked);
  }

  if (Math.abs(angle - rightAngleLocked) < snapThreshold) {
    return normalizeAngle(rightAngleLocked);
  }

  return normalizeAngle(angle);
};

const rotateSlotFrameTarget: ControlActionHandler = (
  _eventData,
  transform,
  x,
  y
) => {
  const target = transform.target;
  if (!target || !hasSlotFrameBounds(target)) {
    return false;
  }

  const frame = getSlotFrameState(target as SlotFrameTransformTarget);
  const currentAngle = Math.atan2(y - frame.top, x - frame.left);
  const startAngle = Math.atan2(transform.ey - frame.top, transform.ex - frame.left);
  const theta = transform.theta ?? util.degreesToRadians(frame.angle);
  const angle = applyRotationSnap(
    util.radiansToDegrees(currentAngle - startAngle + theta),
    target as SlotFrameTransformTarget
  );

  return applySlotFrameTransform(target as SlotFrameTransformTarget, {
    ...frame,
    angle,
  });
};

const scaleSlotFrameTarget: ControlActionHandler = (
  _eventData,
  transform,
  x,
  y
) => {
  const target = transform.target;
  const corner = transform.corner;

  if (!target || !corner || !hasSlotFrameBounds(target)) {
    return false;
  }

  const frame = getSlotFrameState(target as SlotFrameTransformTarget);
  const nextFrame =
    HORIZONTAL_CORNERS.includes(corner) || VERTICAL_CORNERS.includes(corner)
      ? getScaledFrameFromSideControl(frame, corner, x, y)
      : getScaledFrameFromCornerControl(frame, corner, x, y);

  if (!nextFrame) {
    return false;
  }

  return applySlotFrameTransform(target as SlotFrameTransformTarget, nextFrame);
};

const scaleOrResizeTextbox: ControlActionHandler = (
  eventData,
  transform,
  x,
  y
) => {
  const target = transform.target;
  const corner = transform.corner;

  if (!target || !corner) return false;

  if (!isTextboxObject(target) && hasSlotFrameBounds(target)) {
    return scaleSlotFrameTarget(eventData, transform, x, y);
  }

  const isTextbox = isTextboxObject(target);
  let result = false;

  if (isTextbox && DIAGONAL_CORNERS.includes(corner)) {
    result = false;
  } else if (isTextbox && HORIZONTAL_CORNERS.includes(corner)) {
    result = controlsUtils.changeWidth(eventData, transform, x, y);
  } else if (isTextbox && VERTICAL_CORNERS.includes(corner)) {
    result = controlsUtils.changeHeight(eventData, transform, x, y);
  } else if (HORIZONTAL_CORNERS.includes(corner)) {
    result = controlsUtils.scalingX(eventData, transform, x, y);
  } else if (VERTICAL_CORNERS.includes(corner)) {
    result = controlsUtils.scalingY(eventData, transform, x, y);
  } else {
    result = controlsUtils.scalingEqually(eventData, transform, x, y);
  }

  return result;
};

const createRotateControl = (corner: (typeof CORNERS_CONFIG)[number]) => {
  const control = new Control({
    x: corner.x,
    y: corner.y,
    offsetX: corner.offX,
    offsetY: corner.offY,
    sizeX: 10,
    sizeY: 10,
    actionHandler: (eventData, transform, x, y) => {
      if (hasSlotFrameBounds(transform.target)) {
        return rotateSlotFrameTarget(eventData, transform, x, y);
      }

      return controlsUtils.rotationWithSnapping(eventData, transform, x, y);
    },
    cursorStyleHandler: (_, __, fabricObject) => {
      const totalAngle =
        (fabricObject.getTotalAngle() + corner.angleOffset) % 360;

      return getRotatedCursorUrl(totalAngle);
    },
    actionName: 'rotate',
    render: () => {},
  });

  control.positionHandler = createFrameAwarePositionHandler(
    control.positionHandler
  );

  return control;
};

const createObjectControls = (img: HTMLImageElement) => {
  const controls: Record<string, Control> = {};

  controls.center = new Control({
    x: 0,
    y: 0,
    actionName: 'centerAction',
    render: (ctx, left, top, _, fabricObject) => {
      if (isTextboxObject(fabricObject)) return;

      if (!isImageReadyForCanvas(img)) {
        img.onload = () => fabricObject.canvas?.requestRenderAll();
        return;
      }

      const size = 24;

      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(util.degreesToRadians(fabricObject.angle));
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    },
  });
  controls.center.positionHandler = createFrameAwarePositionHandler(
    controls.center.positionHandler
  );

  CORNERS_CONFIG.forEach(corner => {
    controls[corner.id] = new Control({
      x: corner.x,
      y: corner.y,
      actionHandler: scaleOrResizeTextbox,
      cursorStyleHandler: (eventData, control, fabricObject, coord) => {
        if (hasSlotFrameBounds(fabricObject)) {
          return getSlotResizeCursor(corner.id, fabricObject);
        }

        return scaleCursorStyleHandler(
          eventData,
          control,
          fabricObject,
          coord
        );
      },
      actionName: 'scale',
      render: renderSquareControl,
    });
    controls[corner.id].positionHandler = createFrameAwarePositionHandler(
      controls[corner.id].positionHandler
    );

    controls[`${corner.id}_rotate`] = createRotateControl(corner);
  });

  SIDES_CONFIG.forEach(({ id, x, y, action }) => {
    controls[id] = new Control({
      x,
      y,
      actionHandler: scaleOrResizeTextbox,
      cursorStyleHandler: (eventData, control, fabricObject, coord) => {
        if (hasSlotFrameBounds(fabricObject)) {
          return getSlotResizeCursor(id, fabricObject);
        }

        return scaleCursorStyleHandler(
          eventData,
          control,
          fabricObject,
          coord
        );
      },
      actionName: action,
      render: renderSquareControl,
    });
    controls[id].positionHandler = createFrameAwarePositionHandler(
      controls[id].positionHandler
    );
  });

  return controls;
};

const createTextboxControls = () => {
  const controls: Record<string, Control> = {};

  SIDES_CONFIG.forEach(({ id, x, y, action }) => {
    controls[id] = new Control({
      x,
      y,
      actionHandler: scaleOrResizeTextbox,
      cursorStyleHandler: scaleCursorStyleHandler,
      actionName: action,
      render: renderSquareControl,
    });
  });

  CORNERS_CONFIG.forEach(corner => {
    controls[`${corner.id}_rotate`] = createRotateControl(corner);
  });

  return controls;
};

const applyControlStyle = (target: ControlStyleTarget) => {
  target.borderColor = '#1F72EF';
  target.borderScaleFactor = 1;
  target.cornerStrokeColor = '#1F72EF';
  target.cornerSize = 10;
  target.transparentCorners = false;
  target.cornerColor = '#fff';
};

export const applyTextboxControls = (textbox: Textbox) => {
  textbox.controls = createTextboxControls();

  textbox.setControlsVisibility({
    tl: false,
    tr: false,
    bl: false,
    br: false,
    ml: true,
    mr: true,
    mt: true,
    mb: true,
    tl_rotate: true,
    tr_rotate: true,
    bl_rotate: true,
    br_rotate: true,
  });

  textbox.setCoords();
  textbox.canvas?.requestRenderAll();
};

export const useSetFabricControls = () => {
  useEffect(() => {
    const img = createFabricControlImage(MOVE_ICON);

    const objectControls = createObjectControls(img);
    const textboxControls = createTextboxControls();

    const defaultControls =
      FabricObject.ownDefaults as unknown as ControlDefaultsTarget;

    defaultControls.snapAngle = 90;
    defaultControls.snapThreshold = 2;
    defaultControls.controls = objectControls;
    applyControlStyle(defaultControls);

    const textboxClass = Textbox as unknown as {
      ownDefaults?: ControlDefaultsTarget;
      prototype: Textbox & ControlDefaultsTarget;
    };

    if (textboxClass.ownDefaults) {
      textboxClass.ownDefaults.controls = textboxControls;
      applyControlStyle(textboxClass.ownDefaults);
    }

    patchSlotSelectionBorder();

    textboxClass.prototype.controls = textboxControls;
    applyControlStyle(textboxClass.prototype);
  }, []);
};
