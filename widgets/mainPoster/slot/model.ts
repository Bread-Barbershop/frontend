import {
  ImageSlotMeta,
  SlotEntity,
  SlotFrame,
  SlotId,
  SlotImageTransform,
} from './types';

export const DEFAULT_SLOT_ZOOM_SCALE = 100;

export const createDefaultSlotFrame = (
  frame?: Partial<SlotFrame>
): SlotFrame => ({
  left: frame?.left ?? 0,
  top: frame?.top ?? 0,
  width: frame?.width ?? 0,
  height: frame?.height ?? 0,
  angle: frame?.angle ?? 0,
});

export const createDefaultSlotImageTransform = (
  image?: Partial<SlotImageTransform>
): SlotImageTransform => ({
  baseScale: image?.baseScale ?? 1,
  zoomScale: image?.zoomScale ?? DEFAULT_SLOT_ZOOM_SCALE,
  offsetX: image?.offsetX ?? 0,
  offsetY: image?.offsetY ?? 0,
});

export const createSlotEntity = (params: {
  slotId: SlotId;
  meta: ImageSlotMeta;
  frame?: Partial<SlotFrame>;
  image?: Partial<SlotImageTransform>;
  frameObjectId?: string;
  imageObjectId?: string;
}): SlotEntity => ({
  slotId: params.slotId,
  meta: params.meta,
  frame: createDefaultSlotFrame(params.frame),
  image: createDefaultSlotImageTransform(params.image),
  frameObjectId: params.frameObjectId,
  imageObjectId: params.imageObjectId,
});
