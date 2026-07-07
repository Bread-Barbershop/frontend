import { FabricImage, FabricObject } from 'fabric';

import {
  buildSlotEntityFromLegacyTarget,
  getLegacySlotMeta,
} from './legacy';
import { SlotEntity, SlotLegacyImageObject, SlotLegacyObject } from './types';

export const getSlotId = (target: unknown) =>
  getLegacySlotMeta(target)?.key ?? null;

export const isSlotObject = (target: unknown): target is SlotLegacyObject =>
  getLegacySlotMeta(target) !== null;

export const isSlotImageObject = (
  target: unknown
): target is SlotLegacyImageObject => {
  return target instanceof FabricImage && isSlotObject(target);
};

export const isSlotPlaceholderObject = (target: unknown) =>
  target instanceof FabricObject &&
  isSlotObject(target) &&
  !(target instanceof FabricImage) &&
  target.get('name') === 'slot-placeholder';

export const getSlotEntityByTarget = (target: unknown): SlotEntity | null =>
  buildSlotEntityFromLegacyTarget(target);
