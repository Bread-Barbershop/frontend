import { hasSlotFrameBounds } from '../../slot/frameGeometry';

import { getDistanceList } from './basic';

import type { AligningGuidelinesState } from '../aligning-guidelines';
import type { LineProps } from '../typedefs';
import type { FabricObject, Point } from 'fabric';

type CollectPointProps = {
  target: FabricObject;
  point: Point;
  diagonalPoint: Point;
  list: Point[];
  isScale: boolean;
  isUniform: boolean;
  isCenter: boolean;
  corner: string;
};

export function collectVerticalPoint(
  this: AligningGuidelinesState,
  props: CollectPointProps
): LineProps[] {
  const {
    target,
    isScale,
    isUniform,
    corner,
    point,
    diagonalPoint,
    list,
    isCenter,
  } = props;
  const { dis, arr } = getDistanceList(point, list, 'x');
  const margin = this.margin / this.canvas.getZoom();
  if (dis > margin) return [];
  let v = arr[arr.length - 1].x - point.x;
  const dirX = corner.includes('l') ? -1 : 1;
  v *= dirX;

  const { width, height, scaleX, scaleY } = target;
  const dStrokeWidth = target.strokeUniform ? 0 : target.strokeWidth;
  const scaleWidth = scaleX * width + dStrokeWidth;
  const sx = (v + scaleWidth) / scaleWidth;
  if (sx === 0) return [];

  // Slot frames currently use frame-space guide points but image-space mutation.
  // Until a frame-aware resize setter is introduced, keep the guide visual only.
  if (hasSlotFrameBounds(target)) {
    return arr.map(target => ({ origin: point, target }));
  }

  if (isScale) {
    target.set('scaleX', scaleX * sx);
    if (isUniform) target.set('scaleY', scaleY * sx);
  } else {
    target.set('width', width * sx);
    if (isUniform) target.set('height', height * sx);
  }
  if (isCenter) {
    target.setRelativeXY(diagonalPoint, 'center', 'center');
  } else {
    const originArr = this.contraryOriginMap;
    target.setRelativeXY(diagonalPoint, ...originArr[corner]);
  }
  target.setCoords();
  return arr.map(target => ({ origin: point, target }));
}

export function collectHorizontalPoint(
  this: AligningGuidelinesState,
  props: CollectPointProps
): LineProps[] {
  const {
    target,
    isScale,
    isUniform,
    corner,
    point,
    diagonalPoint,
    list,
    isCenter,
  } = props;
  const { dis, arr } = getDistanceList(point, list, 'y');
  const margin = this.margin / this.canvas.getZoom();
  if (dis > margin) return [];
  let v = arr[arr.length - 1].y - point.y;
  const dirY = corner.includes('t') ? -1 : 1;
  v *= dirY;

  const { width, height, scaleX, scaleY } = target;
  const dStrokeWidth = target.strokeUniform ? 0 : target.strokeWidth;
  const scaleHeight = scaleY * height + dStrokeWidth;
  const sy = (v + scaleHeight) / scaleHeight;
  if (sy === 0) return [];

  // Slot frames currently use frame-space guide points but image-space mutation.
  // Until a frame-aware resize setter is introduced, keep the guide visual only.
  if (hasSlotFrameBounds(target)) {
    return arr.map(target => ({ origin: point, target }));
  }

  if (isScale) {
    target.set('scaleY', scaleY * sy);
    if (isUniform) target.set('scaleX', scaleX * sy);
  } else {
    target.set('height', height * sy);
    if (isUniform) target.set('width', width * sy);
  }
  if (isCenter) {
    target.setRelativeXY(diagonalPoint, 'center', 'center');
  } else {
    const originArr = this.contraryOriginMap;
    target.setRelativeXY(diagonalPoint, ...originArr[corner]);
  }
  target.setCoords();
  return arr.map(target => ({ origin: point, target }));
}
