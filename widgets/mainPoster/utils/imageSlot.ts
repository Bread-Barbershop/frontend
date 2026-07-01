import { FabricImage, FabricObject } from 'fabric';

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
