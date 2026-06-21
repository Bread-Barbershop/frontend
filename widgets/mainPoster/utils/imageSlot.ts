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

export const isFilledSlotImage = (
  target: unknown
): target is SlotImageObject => {
  const slot = getImageSlot(target);
  return Boolean(slot?.filled);
};
