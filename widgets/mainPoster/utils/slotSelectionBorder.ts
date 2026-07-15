import { FabricObject, util } from 'fabric';

import { getSlotFrameState, hasSlotFrameBounds } from '../slot/frameGeometry';

type DrawBordersMethod = (
  ctx: CanvasRenderingContext2D,
  options?: unknown,
  styleOverride?: unknown
) => void;

let hasPatchedDrawBorders = false;

const getSlotFrameSelectionRect = (target: FabricObject, zoom: number) => {
  const frame = getSlotFrameState(target);
  const center = target.getCenterPoint();
  const deltaX = frame.left - center.x;
  const deltaY = frame.top - center.y;
  const radians = util.degreesToRadians(frame.angle);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const localCenterX = (deltaX * cos + deltaY * sin) * zoom;
  const localCenterY = (-deltaX * sin + deltaY * cos) * zoom;
  const padding = target.padding ?? 0;

  return {
    x: localCenterX - (frame.width * zoom) / 2 - padding,
    y: localCenterY - (frame.height * zoom) / 2 - padding,
    width: frame.width * zoom + padding * 2,
    height: frame.height * zoom + padding * 2,
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
    if (!hasSlotFrameBounds(this) || !this.canvas) {
      originalDrawBorders.call(this, ctx, options, styleOverride);
      return;
    }

    const zoom = this.canvas.getZoom();
    const rect = getSlotFrameSelectionRect(this, zoom);

    ctx.save();
    ctx.strokeStyle = this.borderColor || '#1F72EF';
    ctx.setLineDash(this.borderDashArray?.length ? this.borderDashArray : []);
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
  } as DrawBordersMethod;

  hasPatchedDrawBorders = true;
};
