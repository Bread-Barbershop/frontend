import { FabricImage, FabricObject, Point } from 'fabric';

import {
  getLegacySlotMeta,
  hasLegacySlotFrame,
  isPointInsideLegacySlotFrame,
} from '../slot/legacy';
import type { ImageSlotMeta } from '../slot/types';
export type { ImageSlotMeta } from '../slot/types';
import { FabricObjectWithLock } from '../types/fabric';

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
