import {
  FabricObject,
  Textbox,
  Control,
  controlsUtils,
  util,
} from 'fabric';
import { useEffect } from 'react';

import { CORNERS_CONFIG, MOVE_ICON, SIDES_CONFIG } from '../constants/fabric';
import { FabricImageWithLock } from '../types/fabric';
import {
  createFabricControlImage,
  getRotatedCursorUrl,
  isImageReadyForCanvas,
} from '../utils/fabricUtils';

const DIAGONAL_CORNERS = ['tl', 'tr', 'bl', 'br'];
const HORIZONTAL_CORNERS = ['ml', 'mr'];
const VERTICAL_CORNERS = ['mt', 'mb'];

type FabricObjectLike = {
  type?: string;
  angle?: number;
  canvas?: {
    requestRenderAll?: () => void;
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

type SlotFrameSelectableObject = FabricObject & {
  borderDashArray?: number[] | null;
  padding?: number;
  slotFrameWidth?: number;
  slotFrameHeight?: number;
  slotFrameLeft?: number;
  slotFrameTop?: number;
  slotFrameAngle?: number;
};

type DrawBordersMethod = (
  ctx: CanvasRenderingContext2D,
  options?: unknown,
  styleOverride?: unknown
) => void;

let hasPatchedDrawBorders = false;

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
  return new Control({
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

const hasSlotFrameSelectionBounds = (
  target: FabricObject
): target is SlotFrameSelectableObject & FabricImageWithLock => {
  return (
    target.isType('image') &&
    typeof (target as SlotFrameSelectableObject).slotFrameWidth === 'number' &&
    typeof (target as SlotFrameSelectableObject).slotFrameHeight === 'number' &&
    typeof (target as SlotFrameSelectableObject).slotFrameLeft === 'number' &&
    typeof (target as SlotFrameSelectableObject).slotFrameTop === 'number'
  );
};

const getSlotFrameSelectionRect = (
  target: SlotFrameSelectableObject,
  zoom: number
) => {
  const frameWidth = target.slotFrameWidth;
  const frameHeight = target.slotFrameHeight;
  const frameLeft = target.slotFrameLeft;
  const frameTop = target.slotFrameTop;
  const frameAngle = target.slotFrameAngle ?? target.angle ?? 0;
  const center = target.getCenterPoint();

  if (
    !frameWidth ||
    !frameHeight ||
    frameLeft === undefined ||
    frameTop === undefined
  ) {
    return null;
  }

  const deltaX = frameLeft - center.x;
  const deltaY = frameTop - center.y;
  const radians = util.degreesToRadians(frameAngle);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const localCenterX = (deltaX * cos + deltaY * sin) * zoom;
  const localCenterY = (-deltaX * sin + deltaY * cos) * zoom;
  const padding = target.padding ?? 0;

  return {
    x: localCenterX - (frameWidth * zoom) / 2 - padding,
    y: localCenterY - (frameHeight * zoom) / 2 - padding,
    width: frameWidth * zoom + padding * 2,
    height: frameHeight * zoom + padding * 2,
  };
};

const patchDrawBordersForSlotFrames = () => {
  if (hasPatchedDrawBorders) {
    return;
  }

  const originalDrawBorders = FabricObject.prototype.drawBorders as DrawBordersMethod;

  FabricObject.prototype.drawBorders = function (
    this: FabricObject,
    ctx: CanvasRenderingContext2D,
    options?: unknown,
    styleOverride?: unknown
  ) {
    if (!hasSlotFrameSelectionBounds(this) || !this.canvas) {
      originalDrawBorders.call(this, ctx, options, styleOverride);
      return;
    }

    const zoom = this.canvas.getZoom();
    const rect = getSlotFrameSelectionRect(this, zoom);

    if (!rect) {
      originalDrawBorders.call(this, ctx, options, styleOverride);
      return;
    }

    ctx.save();
    ctx.strokeStyle = this.borderColor || '#1F72EF';
    ctx.setLineDash(this.borderDashArray?.length ? this.borderDashArray : []);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
  } as DrawBordersMethod;

  hasPatchedDrawBorders = true;
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

    patchDrawBordersForSlotFrames();

    textboxClass.prototype.controls = textboxControls;
    applyControlStyle(textboxClass.prototype);
  }, []);
};