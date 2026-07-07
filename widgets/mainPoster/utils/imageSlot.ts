import { FabricImage, FabricObject, Point } from 'fabric';

import {
  getSlotFrameCoords,
  getSlotFrameState,
  hasSlotFrameBounds,
  isPointInsideSlotFrameBounds,
} from '../slot/frameGeometry';
import { getSlotMeta as readSlotMeta } from '../slot/objectFields';
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

export const getSlotMeta = (target: unknown) => {
  return readSlotMeta(target);
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

  const frame = getSlotFrameState(target);
  const [tl, tr, br, bl] = getSlotFrameCoords(frame);
  const center = new Point(frame.left, frame.top);

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
  return target instanceof FabricObject
    ? isPointInsideSlotFrameBounds(target, point)
    : false;
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
