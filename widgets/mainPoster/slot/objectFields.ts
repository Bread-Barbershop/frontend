import { FabricImage, FabricObject } from 'fabric';

import {
  createDefaultSlotFrame,
  createDefaultSlotImageTransform,
  createSlotEntity,
  DEFAULT_SLOT_ZOOM_SCALE,
} from './model';

import type {
  ImageSlotMeta,
  SlotEntity,
  SlotFrame,
  SlotImageTransform,
  SlotLegacyFrameFields,
  SlotLegacyImageFields,
  SlotLegacyImageObject,
  SlotLegacyObject,
} from './types';

export const getSlotMeta = (target: unknown): ImageSlotMeta | null => {
  if (!(target instanceof FabricObject)) {
    return null;
  }

  const slot = (target as SlotLegacyObject).slot;
  if (!slot?.replaceable || !slot.key) {
    return null;
  }

  return slot;
};

export const hasSlotFrameFields = (
  target: unknown
): target is SlotLegacyImageObject & SlotLegacyFrameFields => {
  if (!(target instanceof FabricImage)) {
    return false;
  }

  const slotTarget = target as SlotLegacyImageObject & SlotLegacyFrameFields;

  return (
    typeof slotTarget.slotFrameWidth === 'number' &&
    typeof slotTarget.slotFrameHeight === 'number' &&
    typeof slotTarget.slotFrameLeft === 'number' &&
    typeof slotTarget.slotFrameTop === 'number'
  );
};

export const readSlotFrameFields = (target: unknown): SlotFrame | null => {
  if (!hasSlotFrameFields(target)) {
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

export const readSlotImageTransformFields = (
  target: unknown
): SlotImageTransform | null => {
  const slot = getSlotMeta(target);
  if (!slot || !(target instanceof FabricObject)) {
    return null;
  }

  const slotTarget = target as SlotLegacyObject & SlotLegacyImageFields;

  return {
    baseScale: slotTarget.slotImageBaseScale ?? 1,
    zoomScale: slotTarget.slotZoomScale ?? DEFAULT_SLOT_ZOOM_SCALE,
    offsetX: slotTarget.slotImageOffsetX ?? 0,
    offsetY: slotTarget.slotImageOffsetY ?? 0,
  };
};

export const buildSlotEntityFromObject = (target: unknown): SlotEntity | null => {
  const meta = getSlotMeta(target);
  if (!meta || !(target instanceof FabricObject)) {
    return null;
  }

  const frame = readSlotFrameFields(target);
  const image = readSlotImageTransformFields(target);
  const slotTarget = target as SlotLegacyObject;

  return createSlotEntity({
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
  });
};

export const toSlotFrameFields = (
  frame: SlotFrame
): Required<SlotLegacyFrameFields> => ({
  slotFrameWidth: frame.width,
  slotFrameHeight: frame.height,
  slotFrameLeft: frame.left,
  slotFrameTop: frame.top,
  slotFrameAngle: frame.angle,
});

export const toSlotImageTransformFields = (
  image: SlotImageTransform
): Required<SlotLegacyImageFields> => ({
  slotZoomScale: image.zoomScale,
  slotImageBaseScale: image.baseScale,
  slotImageOffsetX: image.offsetX,
  slotImageOffsetY: image.offsetY,
});

export const applySlotEntityToObject = (
  target: SlotLegacyObject,
  entity: SlotEntity
) => {
  target.set({
    slot: entity.meta,
    ...toSlotFrameFields(entity.frame),
    ...toSlotImageTransformFields(entity.image),
  });
};
