import { FabricImage, FabricObject, Point, Rect } from 'fabric';

import { hasSlotFrameFields, readSlotFrameFields } from './objectFields';

import type { SlotFrame, SlotLegacyImageObject } from './types';

export const SLOT_IMAGE_SCALE_MIN = 100;

export type SlotFrameTransformTarget = SlotLegacyImageObject & {
  getElement?: () => HTMLImageElement | HTMLCanvasElement;
};

export type SlotImagePlacement = {
  baseScale: number;
  appliedScale: number;
  worldOffset: { x: number; y: number };
  left: number;
  top: number;
};

export const hasSlotFrameBounds = (
  target: unknown
): target is SlotFrameTransformTarget => {
  return hasSlotFrameFields(target);
};

export const getSlotFrameState = (target: FabricObject): SlotFrame => {
  const frame = readSlotFrameFields(target);
  if (frame) {
    return frame;
  }

  const center = target.getCenterPoint();

  return {
    width: target.getScaledWidth(),
    height: target.getScaledHeight(),
    left: center.x,
    top: center.y,
    angle: target.angle ?? 0,
  };
};

export const getSlotSourceSize = (target: FabricImage) => {
  const element = target.getElement();

  if (element instanceof HTMLImageElement) {
    return {
      width: element.naturalWidth || target.width || 0,
      height: element.naturalHeight || target.height || 0,
    };
  }

  return {
    width: target.width || 0,
    height: target.height || 0,
  };
};

export const getSlotCoverScale = (
  frameWidth: number,
  frameHeight: number,
  sourceWidth: number,
  sourceHeight: number
) => Math.max(frameWidth / sourceWidth, frameHeight / sourceHeight);

export const getSlotWorldOffset = (
  frame: SlotFrame,
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

export const resolveSlotImagePlacement = (
  frame: SlotFrame,
  sourceWidth: number,
  sourceHeight: number,
  zoomScale: number,
  offsetX: number,
  offsetY: number,
  baseScale = getSlotCoverScale(
    frame.width,
    frame.height,
    sourceWidth,
    sourceHeight
  )
): SlotImagePlacement => {
  const appliedScale = baseScale * (zoomScale / 100);
  const worldOffset = getSlotWorldOffset(frame, offsetX, offsetY);

  return {
    baseScale,
    appliedScale,
    worldOffset,
    left: frame.left + worldOffset.x,
    top: frame.top + worldOffset.y,
  };
};

export const isPointInsideFrame = (frame: SlotFrame, point: Point) => {
  const local = toFrameLocalPoint(frame, point.x, point.y);

  return (
    Math.abs(local.x) <= frame.width / 2 && Math.abs(local.y) <= frame.height / 2
  );
};

export const isPointInsideSlotFrameBounds = (
  target: FabricObject,
  point: Point
) => {
  return isPointInsideFrame(getSlotFrameState(target), point);
};

export const createSlotClipPath = (frame: SlotFrame) =>
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

export const toFrameLocalPoint = (frame: SlotFrame, x: number, y: number) => {
  const radians = (frame.angle * Math.PI) / 180;
  const dx = x - frame.left;
  const dy = y - frame.top;

  return {
    x: dx * Math.cos(radians) + dy * Math.sin(radians),
    y: -dx * Math.sin(radians) + dy * Math.cos(radians),
  };
};

export const toFrameWorldPoint = (
  frame: SlotFrame,
  localX: number,
  localY: number
) => {
  const radians = (frame.angle * Math.PI) / 180;

  return new Point(
    frame.left + localX * Math.cos(radians) - localY * Math.sin(radians),
    frame.top + localX * Math.sin(radians) + localY * Math.cos(radians)
  );
};

export const getSlotFrameCoords = (frame: SlotFrame): Point[] => {
  const halfWidth = frame.width / 2;
  const halfHeight = frame.height / 2;

  return [
    toFrameWorldPoint(frame, -halfWidth, -halfHeight),
    toFrameWorldPoint(frame, halfWidth, -halfHeight),
    toFrameWorldPoint(frame, halfWidth, halfHeight),
    toFrameWorldPoint(frame, -halfWidth, halfHeight),
  ];
};

export const getSlotBoundingBox = (frame: SlotFrame) => {
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
