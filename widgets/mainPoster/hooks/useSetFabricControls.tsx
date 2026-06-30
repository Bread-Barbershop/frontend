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
  createFabricControlImage,
  getRotatedCursorUrl,
  isImageReadyForCanvas,
} from '../utils/fabricUtils';
import { patchSlotSelectionBorder } from '../utils/slotSelectionBorder';

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

const hasSlotFrameBounds = (
  target: FabricObjectLike | null | undefined
): target is SlotFrameControlTarget => {
  return Boolean(
    target?.isType?.('image') &&
      typeof (target as SlotFrameControlTarget).slotFrameWidth === 'number' &&
      typeof (target as SlotFrameControlTarget).slotFrameHeight === 'number' &&
      typeof (target as SlotFrameControlTarget).slotFrameLeft === 'number' &&
      typeof (target as SlotFrameControlTarget).slotFrameTop === 'number'
  );
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

  return defaultPositionHandler(dim, finalMatrix, fabricObject as never, currentControl);
};
const createFrameAwarePositionHandler = (
  fallback?: Control['positionHandler']
): NonNullable<Control['positionHandler']> => {
  return (dim, finalMatrix, fabricObject, currentControl) => {
    if (!fabricObject) {
      return defaultPositionHandler(dim, finalMatrix, fabricObject as never, currentControl);
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

const scaleOrResizeTextbox: ControlActionHandler = (
  eventData,
  transform,
  x,
  y
) => {
  const target = transform.target;
  const corner = transform.corner;

  if (!target || !corner) return false;

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
    actionHandler: controlsUtils.rotationWithSnapping,
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

  CORNERS_CONFIG.forEach(corner => {
    controls[corner.id] = new Control({
      x: corner.x,
      y: corner.y,
      actionHandler: scaleOrResizeTextbox,
      cursorStyleHandler: scaleCursorStyleHandler,
      actionName: 'scale',
      render: renderSquareControl,
    });

    controls[`${corner.id}_rotate`] = createRotateControl(corner);
  });

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
