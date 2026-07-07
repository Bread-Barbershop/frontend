import { FabricImage, FabricObject, Point, util } from 'fabric';

import {
  createDefaultSlotFrame,
  createDefaultSlotImageTransform,
  DEFAULT_SLOT_ZOOM_SCALE,
} from './model';
import {
  SlotEntity,
  SlotFrame,
  SlotImageTransform,
  SlotLegacyFrameFields,
  SlotLegacyImageFields,
  SlotLegacyImageObject,
  SlotLegacyObject,
} from './types';

export const getLegacySlotMeta = (target: unknown) => {
  if (!(target instanceof FabricObject)) {
    return null;
  }

  const slot = (target as SlotLegacyObject).slot;
  if (!slot?.replaceable || !slot.key) {
    return null;
  }

  return slot;
};

export const hasLegacySlotFrame = (
  target: unknown
): target is SlotLegacyImageObject & SlotLegacyFrameFields => {
  if (!(target instanceof FabricImage)) {
    return false;
  }

  const legacyTarget = target as SlotLegacyImageObject & SlotLegacyFrameFields;

  return (
    typeof legacyTarget.slotFrameWidth === 'number' &&
    typeof legacyTarget.slotFrameHeight === 'number' &&
    typeof legacyTarget.slotFrameLeft === 'number' &&
    typeof legacyTarget.slotFrameTop === 'number'
  );
};

export const getLegacySlotFrame = (target: unknown): SlotFrame | null => {
  if (!hasLegacySlotFrame(target)) {
    return null;
  }

  return {
    width: target.slotFrameWidth ?? 0,
    height: target.slotFrameHeight ?? 0,
    left: target.slotFrameLeft ?? 0,
    top: target.slotFrameTop ?? 0,
    angle: target.slotFrameAngle ?? target.angle ?? 0,
  };
};

export const getLegacySlotImageTransform = (
  target: unknown
): SlotImageTransform | null => {
  const slot = getLegacySlotMeta(target);
  if (!slot || !(target instanceof FabricObject)) {
    return null;
  }

  const legacyTarget = target as SlotLegacyObject & SlotLegacyImageFields;

  return {
    baseScale: legacyTarget.slotImageBaseScale ?? 1,
    zoomScale: legacyTarget.slotZoomScale ?? DEFAULT_SLOT_ZOOM_SCALE,
    offsetX: legacyTarget.slotImageOffsetX ?? 0,
    offsetY: legacyTarget.slotImageOffsetY ?? 0,
  };
};

export const buildSlotEntityFromLegacyTarget = (
  target: unknown
): SlotEntity | null => {
  const meta = getLegacySlotMeta(target);
  if (!meta) {
    return null;
  }

  const frame = getLegacySlotFrame(target);
  const image = getLegacySlotImageTransform(target);
  const slotTarget = target as SlotLegacyObject;

  return {
    slotId: meta.key,
    meta,
    frame:
      frame ??
      createDefaultSlotFrame({
        left: slotTarget.left ?? 0,
        top: slotTarget.top ?? 0,
        width: slotTarget.getScaledWidth?.() ?? slotTarget.width ?? 0,
        height: slotTarget.getScaledHeight?.() ?? slotTarget.height ?? 0,
        angle: slotTarget.angle ?? 0,
      }),
    image: image ?? createDefaultSlotImageTransform(),
    imageObjectId: String(slotTarget.get('id') ?? meta.key),
  };
};

export const isPointInsideLegacySlotFrame = (target: unknown, point: Point) => {
  const frame = getLegacySlotFrame(target);
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
): Required<SlotLegacyFrameFields> => ({
  slotFrameWidth: frame.width,
  slotFrameHeight: frame.height,
  slotFrameLeft: frame.left,
  slotFrameTop: frame.top,
  slotFrameAngle: frame.angle,
});

export const toLegacySlotImageFields = (
  image: SlotImageTransform
): Required<SlotLegacyImageFields> => ({
  slotZoomScale: image.zoomScale,
  slotImageBaseScale: image.baseScale,
  slotImageOffsetX: image.offsetX,
  slotImageOffsetY: image.offsetY,
});

export const applySlotEntityToLegacyTarget = (
  target: SlotLegacyObject,
  entity: SlotEntity
) => {
  target.set({
    slot: entity.meta,
    ...toLegacySlotFrameFields(entity.frame),
    ...toLegacySlotImageFields(entity.image),
  });
};
