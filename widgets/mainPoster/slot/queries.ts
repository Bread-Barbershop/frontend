import { Canvas, FabricImage, FabricObject } from 'fabric';

import { buildSlotEntityFromObject, getSlotMeta } from './objectFields';

import type { SlotEntity, SlotLegacyImageObject, SlotLegacyObject } from './types';

// Read slot id from a slot-enabled Fabric object.
export const getSlotId = (target: unknown) => getSlotMeta(target)?.key ?? null;

export const isSlotObject = (target: unknown): target is SlotLegacyObject =>
  getSlotMeta(target) !== null;

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

// Build a normalized slot entity from a Fabric object.
export const getSlotEntityByTarget = (target: unknown): SlotEntity | null =>
  buildSlotEntityFromObject(target);

// Find all Fabric objects that share the same slot id.
export const findSlotTargetsBySlotId = (canvas: Canvas, slotId: string) =>
  canvas
    .getObjects()
    .filter(
      (target): target is SlotLegacyObject => getSlotId(target) === slotId
    );

// Prefer the image target when both placeholder and image share the same slot id.
export const findPrimarySlotTargetBySlotId = (
  canvas: Canvas,
  slotId: string
) => {
  const targets = findSlotTargetsBySlotId(canvas, slotId);

  return (
    targets.find(target => target instanceof FabricImage) ?? targets[0] ?? null
  );
};
