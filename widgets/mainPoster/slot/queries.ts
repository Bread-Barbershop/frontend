import { Canvas, FabricImage, FabricObject } from 'fabric';

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

export const findSlotTargetsBySlotId = (
  canvas: Canvas,
  slotId: string
) => canvas.getObjects().filter((target): target is SlotLegacyObject => getSlotId(target) === slotId);

export const findPrimarySlotTargetBySlotId = (
  canvas: Canvas,
  slotId: string
) => {
  const targets = findSlotTargetsBySlotId(canvas, slotId);

  return targets.find(target => target instanceof FabricImage) ?? targets[0] ?? null;
};
