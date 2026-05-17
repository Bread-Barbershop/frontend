import { FabricObject, Textbox, Control, controlsUtils, util } from 'fabric';
import { useEffect } from 'react';

import { CORNERS_CONFIG, MOVE_ICON, SIDES_CONFIG } from '../constants/fabric';
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

  if (isTextbox && DIAGONAL_CORNERS.includes(corner)) {
    return false;
  }

  if (isTextbox && HORIZONTAL_CORNERS.includes(corner)) {
    return controlsUtils.changeWidth(eventData, transform, x, y);
  }

  if (isTextbox && VERTICAL_CORNERS.includes(corner)) {
    return controlsUtils.changeHeight(eventData, transform, x, y);
  }

  if (HORIZONTAL_CORNERS.includes(corner)) {
    return controlsUtils.scalingX(eventData, transform, x, y);
  }

  if (VERTICAL_CORNERS.includes(corner)) {
    return controlsUtils.scalingY(eventData, transform, x, y);
  }

  return controlsUtils.scalingEqually(eventData, transform, x, y);
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

  // 중앙 이동 인디케이터
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

  // Textbox 회전 컨트롤 유지
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

    /**
     * 회전 스냅 기본값
     */
    defaultControls.snapAngle = 90;
    defaultControls.snapThreshold = 2;

    /**
     * 일반 객체 controls
     */
    defaultControls.controls = objectControls;
    applyControlStyle(defaultControls);

    /**
     * Textbox 전용 controls
     */
    const textboxClass = Textbox as unknown as {
      ownDefaults?: ControlDefaultsTarget;
      prototype: Textbox & ControlDefaultsTarget;
    };

    if (textboxClass.ownDefaults) {
      textboxClass.ownDefaults.controls = textboxControls;
      applyControlStyle(textboxClass.ownDefaults);
    }

    textboxClass.prototype.controls = textboxControls;
    applyControlStyle(textboxClass.prototype);
  }, []);
};
