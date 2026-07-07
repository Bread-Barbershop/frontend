import { FabricImage, FabricObject, Point } from 'fabric';

import {
  getLegacySlotMeta,
  hasLegacySlotFrame,
  isPointInsideLegacySlotFrame,
} from '../slot/legacy';
import { FabricObjectWithLock } from '../types/fabric';

import type { ImageSlotMeta } from '../slot/types';
export type { ImageSlotMeta } from '../slot/types';

export type SlotImageObject = FabricImage & {
  slot?: ImageSlotMeta;
};

export type SlotTargetObject = FabricObjectWithLock & {
  slot?: ImageSlotMeta;
};

export type ImagePanelMode =
  | 'user-image'
  | 'background-image'
  | 'frame-image'
  | 'empty-frame'
  | null;

type SlotFrameBoundsTarget = SlotTargetObject & {
  slotFrameWidth?: number;
  slotFrameHeight?: number;
  slotFrameLeft?: number;
  slotFrameTop?: number;
  slotFrameAngle?: number;
};
export const getSlotMeta = (target: unknown) => {
  return getLegacySlotMeta(target);
};

export const getImageSlot = (target: unknown) => {
  if (!(target instanceof FabricImage)) {
    return null;
  }

  return getSlotMeta(target);
};

export const isReplaceableSlotTarget = (
  target: unknown
): target is SlotTargetObject => getSlotMeta(target) !== null;

export const isReplaceableSlotImage = (
  target: unknown
): target is SlotImageObject => getImageSlot(target) !== null;

export const isFrameTarget = (target: unknown): target is SlotTargetObject =>
  isReplaceableSlotTarget(target);

export const containsFrameTarget = (targets: readonly unknown[]) =>
  targets.some(target => isFrameTarget(target));

const hasSlotFrameBounds = (
  target: unknown
): target is SlotFrameBoundsTarget & FabricImage => {
  return hasLegacySlotFrame(target);
};

const getSlotFrameCenterPoint = (target: SlotFrameBoundsTarget) => {
  return new Point(target.slotFrameLeft ?? 0, target.slotFrameTop ?? 0);
};

export const getFramePointMap = (target: FabricObject) => {
  if (!hasSlotFrameBounds(target)) {
    const coords = target.getCoords();

    return {
      tl: coords[0],
      tr: coords[1],
      br: coords[2],
      bl: coords[3],
      mt: coords[0].add(coords[1]).scalarDivide(2),
      mr: coords[1].add(coords[2]).scalarDivide(2),
      mb: coords[2].add(coords[3]).scalarDivide(2),
      ml: coords[3].add(coords[0]).scalarDivide(2),
      center: target.getCenterPoint(),
    };
  }

  const width = target.slotFrameWidth ?? 0;
  const height = target.slotFrameHeight ?? 0;
  const angle = target.slotFrameAngle ?? target.angle ?? 0;
  const center = getSlotFrameCenterPoint(target);
  const radians = (angle * Math.PI) / 180;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const toWorld = (x: number, y: number) =>
    new Point(center.x + x * cos - y * sin, center.y + x * sin + y * cos);
  const tl = toWorld(-halfWidth, -halfHeight);
  const tr = toWorld(halfWidth, -halfHeight);
  const br = toWorld(halfWidth, halfHeight);
  const bl = toWorld(-halfWidth, halfHeight);

  return {
    tl,
    tr,
    br,
    bl,
    mt: tl.add(tr).scalarDivide(2),
    mr: tr.add(br).scalarDivide(2),
    mb: br.add(bl).scalarDivide(2),
    ml: bl.add(tl).scalarDivide(2),
    center,
  };
};

export const getFrameContraryMap = (target: FabricObject) => {
  const pointMap = getFramePointMap(target);

  return {
    tl: pointMap.br,
    tr: pointMap.bl,
    br: pointMap.tl,
    bl: pointMap.tr,
    mt: pointMap.br.add(pointMap.bl).scalarDivide(2),
    mr: pointMap.bl.add(pointMap.tl).scalarDivide(2),
    mb: pointMap.tl.add(pointMap.tr).scalarDivide(2),
    ml: pointMap.tr.add(pointMap.br).scalarDivide(2),
    center: pointMap.center,
  };
};

export const getFramePointList = (target: FabricObject) => {
  const pointMap = getFramePointMap(target);

  return [
    pointMap.tl,
    pointMap.tr,
    pointMap.br,
    pointMap.bl,
    pointMap.center,
  ];
};

export const isPointInsideSlotFrame = (target: unknown, point: Point) => {
  return isPointInsideLegacySlotFrame(target, point);
};
export const isFilledSlotImage = (
  target: unknown
): target is SlotImageObject => {
  const slot = getImageSlot(target);
  return Boolean(slot?.filled);
};

export const isBackgroundImage = (target: unknown): target is FabricImage => {
  return (
    target instanceof FabricImage && target.get('id') === 'background-layer'
  );
};

export const getImagePanelMode = (target: unknown): ImagePanelMode => {
  if (isBackgroundImage(target)) {
    return 'background-image';
  }

  if (isReplaceableSlotImage(target)) {
    return 'frame-image';
  }

  if (
    isReplaceableSlotTarget(target) &&
    !(target instanceof FabricImage) &&
    target.get('name') === 'slot-placeholder'
  ) {
    return 'empty-frame';
  }

  if (target instanceof FabricImage) {
    return 'user-image';
  }

  return null;
};
