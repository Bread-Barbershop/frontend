import { Point } from 'fabric';

import type { AligningGuidelinesState } from '../aligning-guidelines';

export function drawLine(
  this: AligningGuidelinesState,
  origin: Point,
  target: Point
) {
  const ctx = this.canvas.getTopContext();
  if (!ctx) return;
  const viewportTransform = this.canvas.viewportTransform;
  const zoom = this.canvas.getZoom();
  ctx.save();
  ctx.transform(...viewportTransform);
  ctx.lineWidth = this.width / zoom;
  if (this.lineDash) ctx.setLineDash(this.lineDash);
  ctx.strokeStyle = this.color;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(target.x, target.y);
  ctx.stroke();
  if (this.lineDash) ctx.setLineDash([]);

  this.drawX(origin, -1);
  this.drawX(target, 1);
  ctx.restore();
}

export function drawX(this: AligningGuidelinesState, point: Point, _: number) {
  const ctx = this.canvas.getTopContext();
  if (!ctx) return;
  const zoom = this.canvas.getZoom();
  const size = this.xSize / zoom;
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.beginPath();
  ctx.moveTo(-size, -size);
  ctx.lineTo(size, size);
  ctx.moveTo(size, -size);
  ctx.lineTo(-size, size);
  ctx.stroke();
  ctx.restore();
}
function drawPoint(this: AligningGuidelinesState, arr: Point[]) {
  const ctx = this.canvas.getTopContext();
  if (!ctx) return;
  const viewportTransform = this.canvas.viewportTransform;
  const zoom = this.canvas.getZoom();
  ctx.save();
  ctx.transform(...viewportTransform);
  ctx.lineWidth = this.width / zoom;
  ctx.strokeStyle = this.color;
  for (const item of arr) this.drawX(item, 0);
  ctx.restore();
}

export function drawPointList(this: AligningGuidelinesState) {
  const list = [];
  if (!this.closeVLine) {
    for (const v of this.verticalLines) list.push(JSON.parse(v));
  }
  if (!this.closeHLine) {
    for (const h of this.horizontalLines) list.push(JSON.parse(h));
  }
  const arr = list.map(item => item.target);
  drawPoint.call(this, arr);
}

export function drawVerticalLine(this: AligningGuidelinesState) {
  if (this.closeVLine) return;

  for (const v of this.verticalLines) {
    const { origin, target } = JSON.parse(v);

    // Check if target is canvas horizontal center
    if (this.canvas.width && Math.abs(target.x - this.canvas.width / 2) < 1) {
      const topEdge = new Point(target.x, -5000);
      const bottomEdge = new Point(target.x, 5000 + this.canvas.height);
      this.drawLine(topEdge, bottomEdge);
    } else {
      const o = new Point(target.x, origin.y);
      this.drawLine(o, target);
    }
  }
}

export function drawHorizontalLine(this: AligningGuidelinesState) {
  if (this.closeHLine) return;

  for (const v of this.horizontalLines) {
    const { origin, target } = JSON.parse(v);

    // Check if target is canvas vertical center
    if (this.canvas.height && Math.abs(target.y - this.canvas.height / 2) < 1) {
      const leftEdge = new Point(-5000, target.y);
      const rightEdge = new Point(5000 + this.canvas.width, target.y);
      this.drawLine(leftEdge, rightEdge);
    } else {
      const o = new Point(origin.x, target.y);
      this.drawLine(o, target);
    }
  }
}
