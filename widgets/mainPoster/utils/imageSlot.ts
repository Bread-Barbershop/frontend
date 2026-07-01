import { FabricImage, FabricObject, Point, util } from 'fabric';

import { FabricObjectWithLock } from '../types/fabric';

export interface ImageSlotMeta {
  key: string;
  label?: string;
  replaceable?: boolean;
  aspectMode?: 'cover' | 'contain';
  required?: boolean;
  order?: number;
  filled?: boolean;
}

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
  if (!(target instanceof FabricObject)) {
    return null;
  }

  const slot = (target as SlotTargetObject).slot;
  if (!slot?.replaceable || !slot.key) {
    return null;
  }

  return slot;
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
  if (!(target instanceof FabricImage)) {
    return false;
  }

  const slotTarget = target as SlotFrameBoundsTarget & FabricImage;

  return (
    typeof slotTarget.slotFrameWidth === 'number' &&
    typeof slotTarget.slotFrameHeight === 'number' &&
    typeof slotTarget.slotFrameLeft === 'number' &&
    typeof slotTarget.slotFrameTop === 'number'
  );
};

export const isPointInsideSlotFrame = (target: unknown, point: Point) => {
  if (!hasSlotFrameBounds(target)) {
    return target instanceof FabricObject ? target.containsPoint(point) : false;
  }

  const frameWidth = target.slotFrameWidth ?? 0;
  const frameHeight = target.slotFrameHeight ?? 0;
  const frameLeft = target.slotFrameLeft ?? 0;
  const frameTop = target.slotFrameTop ?? 0;
  const frameAngle = target.slotFrameAngle ?? target.angle ?? 0;
  const radians = util.degreesToRadians(frameAngle);
  const dx = point.x - frameLeft;
  const dy = point.y - frameTop;
  const localX = dx * Math.cos(radians) + dy * Math.sin(radians);
  const localY = -dx * Math.sin(radians) + dy * Math.cos(radians);

  return (
    Math.abs(localX) <= frameWidth / 2 &&
    Math.abs(localY) <= frameHeight / 2
  );
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
