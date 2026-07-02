import { FabricObject, util } from 'fabric';

import { FabricImageWithLock } from '../types/fabric';

type SlotFrameSelectableObject = FabricObject & {
  borderDashArray?: number[] | null;
  padding?: number;
  slotFrameWidth?: number;
  slotFrameHeight?: number;
  slotFrameLeft?: number;
  slotFrameTop?: number;
  slotFrameAngle?: number;
};

type DrawBordersMethod = (
  ctx: CanvasRenderingContext2D,
  options?: unknown,
  styleOverride?: unknown
) => void;

let hasPatchedDrawBorders = false;

const hasSlotFrameSelectionBounds = (
  target: FabricObject
): target is SlotFrameSelectableObject & FabricImageWithLock => {
  return (
    target.isType('image') &&
    typeof (target as SlotFrameSelectableObject).slotFrameWidth === 'number' &&
    typeof (target as SlotFrameSelectableObject).slotFrameHeight === 'number' &&
    typeof (target as SlotFrameSelectableObject).slotFrameLeft === 'number' &&
    typeof (target as SlotFrameSelectableObject).slotFrameTop === 'number'
  );
};

const getSlotFrameSelectionRect = (
  target: SlotFrameSelectableObject,
  zoom: number
) => {
  const frameWidth = target.slotFrameWidth;
  const frameHeight = target.slotFrameHeight;
  const frameLeft = target.slotFrameLeft;
  const frameTop = target.slotFrameTop;
  const frameAngle = target.slotFrameAngle ?? target.angle ?? 0;
  const center = target.getCenterPoint();

  if (
    !frameWidth ||
    !frameHeight ||
    frameLeft === undefined ||
    frameTop === undefined
  ) {
    return null;
  }

  const deltaX = frameLeft - center.x;
  const deltaY = frameTop - center.y;
  const radians = util.degreesToRadians(frameAngle);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const localCenterX = (deltaX * cos + deltaY * sin) * zoom;
  const localCenterY = (-deltaX * sin + deltaY * cos) * zoom;
  const padding = target.padding ?? 0;

  return {
    x: localCenterX - (frameWidth * zoom) / 2 - padding,
    y: localCenterY - (frameHeight * zoom) / 2 - padding,
    width: frameWidth * zoom + padding * 2,
    height: frameHeight * zoom + padding * 2,
  };
};

export const patchSlotSelectionBorder = () => {
  if (hasPatchedDrawBorders) {
    return;
  }

  const originalDrawBorders = FabricObject.prototype.drawBorders as DrawBordersMethod;

  FabricObject.prototype.drawBorders = function (
    this: FabricObject,
    ctx: CanvasRenderingContext2D,
    options?: unknown,
    styleOverride?: unknown
  ) {
    if (!hasSlotFrameSelectionBounds(this) || !this.canvas) {
      originalDrawBorders.call(this, ctx, options, styleOverride);
      return;
    }

    const zoom = this.canvas.getZoom();
    const rect = getSlotFrameSelectionRect(this, zoom);

    if (!rect) {
      originalDrawBorders.call(this, ctx, options, styleOverride);
      return;
    }

    ctx.save();
    ctx.strokeStyle = this.borderColor || '#1F72EF';
    ctx.setLineDash(this.borderDashArray?.length ? this.borderDashArray : []);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
  } as DrawBordersMethod;

  hasPatchedDrawBorders = true;
};