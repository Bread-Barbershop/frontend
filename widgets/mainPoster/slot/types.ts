import type { FabricImage, FabricObject } from 'fabric';

export interface ImageSlotMeta {
  key: string;
  label?: string;
  replaceable?: boolean;
  aspectMode?: 'cover' | 'contain';
  required?: boolean;
  order?: number;
  filled?: boolean;
}

export type SlotId = string;

export type SlotObjectRole = 'frame' | 'image';

export type SlotFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
};

export type SlotImageTransform = {
  baseScale: number;
  zoomScale: number;
  offsetX: number;
  offsetY: number;
};

export type SlotEntity = {
  slotId: SlotId;
  meta: ImageSlotMeta;
  frame: SlotFrame;
  image: SlotImageTransform;
  frameObjectId?: string;
  imageObjectId?: string;
};

export type SlotLegacyFrameFields = {
  slotFrameWidth?: number;
  slotFrameHeight?: number;
  slotFrameLeft?: number;
  slotFrameTop?: number;
  slotFrameAngle?: number;
};

export type SlotLegacyImageFields = {
  slotZoomScale?: number;
  slotImageBaseScale?: number;
  slotImageOffsetX?: number;
  slotImageOffsetY?: number;
};

export type SlotLegacyObject = FabricObject &
  SlotLegacyFrameFields &
  SlotLegacyImageFields & {
    slot?: ImageSlotMeta;
  };

export type SlotLegacyImageObject = FabricImage & SlotLegacyObject;
