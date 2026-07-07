import { FabricObject, Point, util } from 'fabric';

import {
  applySlotEntityToObject,
  buildSlotEntityFromObject,
  getSlotMeta,
  hasSlotFrameFields,
  readSlotFrameFields,
  readSlotImageTransformFields,
  toSlotFrameFields,
  toSlotImageTransformFields,
} from './objectFields';

import type {
  SlotEntity,
  SlotFrame,
  SlotImageTransform,
  SlotLegacyFrameFields,
  SlotLegacyImageFields,
  SlotLegacyObject,
} from './types';

// Compatibility wrappers for legacy JSON-backed slot fields.
export const getLegacySlotMeta = getSlotMeta;

export const hasLegacySlotFrame = hasSlotFrameFields;

export const getLegacySlotFrame = (target: unknown): SlotFrame | null => {
  return readSlotFrameFields(target);
};

export const getLegacySlotImageTransform = (
  target: unknown
): SlotImageTransform | null => {
  return readSlotImageTransformFields(target);
};

export const buildSlotEntityFromLegacyTarget = (
  target: unknown
): SlotEntity | null => {
  return buildSlotEntityFromObject(target);
};

export const isPointInsideLegacySlotFrame = (target: unknown, point: Point) => {
  const frame = readSlotFrameFields(target);
  if (!frame) {
    return target instanceof FabricObject ? target.containsPoint(point) : false;
  }

  const radians = util.degreesToRadians(frame.angle);
  const dx = point.x - frame.left;
  const dy = point.y - frame.top;
  const localX = dx * Math.cos(radians) + dy * Math.sin(radians);
  const localY = -dx * Math.sin(radians) + dy * Math.cos(radians);

  return (
    Math.abs(localX) <= frame.width / 2 && Math.abs(localY) <= frame.height / 2
  );
};

export const toLegacySlotFrameFields = (
  frame: SlotFrame
): Required<SlotLegacyFrameFields> => {
  return toSlotFrameFields(frame);
};

export const toLegacySlotImageFields = (
  image: SlotImageTransform
): Required<SlotLegacyImageFields> => {
  return toSlotImageTransformFields(image);
};

export const applySlotEntityToLegacyTarget = (
  target: SlotLegacyObject,
  entity: SlotEntity
) => {
  applySlotEntityToObject(target, entity);
};
