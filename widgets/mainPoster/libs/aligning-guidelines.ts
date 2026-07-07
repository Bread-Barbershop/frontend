import {
  type BasicTransformEvent,
  type Canvas,
  type FabricObject,
  type TPointerEvent,
  Point,
  util,
} from 'fabric';

import {
  getFrameContraryMap,
  getFramePointList,
  getFramePointMap,
} from '../utils/imageSlot';

import { collectLine } from './util/collect-line';
import {
  collectHorizontalPoint,
  collectVerticalPoint,
} from './util/collect-point';
import {
  drawHorizontalLine,
  drawLine,
  drawPointList,
  drawVerticalLine,
  drawX,
} from './util/draw';
import { getObjectsByTarget } from './util/get-objects-by-target';

import type { AligningLineConfig } from './typedefs';

type TransformEvent = BasicTransformEvent<TPointerEvent> & {
  target: FabricObject;
};

export interface AligningGuidelinesState extends Required<AligningLineConfig> {
  canvas: Canvas;
  horizontalLines: Set<string>;
  verticalLines: Set<string>;
  cacheMap: Map<string, Point[]>;
  onlyDrawPoint: boolean;
  getCaCheMapValue: (object: FabricObject) => Point[];
  drawLine: (origin: Point, target: Point) => void;
  drawX: (point: Point, dir: number) => void;
}

export function initAligningGuidelines(
  canvas: Canvas,
  options: Partial<AligningLineConfig> = {}
) {
  const state: AligningGuidelinesState = {
    canvas,
    horizontalLines: new Set<string>(),
    verticalLines: new Set<string>(),
    cacheMap: new Map<string, Point[]>(),
    onlyDrawPoint: false,
    contraryOriginMap: {
      tl: ['right', 'bottom'],
      tr: ['left', 'bottom'],
      br: ['left', 'top'],
      bl: ['right', 'top'],
      mt: ['center', 'bottom'],
      mr: ['left', 'center'],
      mb: ['center', 'top'],
      ml: ['right', 'center'],
    },
    xSize: 2.4,
    lineDash: undefined,
    margin: 4,
    width: 1,
    color: '#1f72ef',
    closeVLine: false,
    closeHLine: false,
    getObjectsByTarget: (target: FabricObject) => getObjectsByTarget(target),
    getPointMap: (target: FabricObject) => getFramePointMap(target),
    getContraryMap: (target: FabricObject) => getFrameContraryMap(target),
    drawLine: function (origin: Point, target: Point) {
      drawLine.call(this, origin, target);
    },
    drawX: function (point: Point, dir: number) {
      drawX.call(this, point, dir);
    },
    getCaCheMapValue: function (object: FabricObject) {
      const cacheKey = [
        object.calcTransformMatrix().toString(),
        object.width,
        object.height,
        object.angle,
      ].join();
      const cacheValue = state.cacheMap.get(cacheKey);
      if (cacheValue) return cacheValue;
      const value = getFramePointList(object);
      state.cacheMap.set(cacheKey, value);
      return value;
    },
    ...options,
  } as AligningGuidelinesState;

  const mouseUp = () => {
    state.verticalLines.clear();
    state.horizontalLines.clear();
    state.cacheMap.clear();
    state.canvas.requestRenderAll();
  };

  const scalingOrResizing = (e: TransformEvent) => {
    const target = e.target;
    target.setCoords();
    const isScale = String(e.transform.action).startsWith('scale');
    state.verticalLines.clear();
    state.horizontalLines.clear();

    const objects = state.getObjectsByTarget(target);
    let corner = e.transform.corner;
    if (target.flipX) {
      if (corner.includes('l')) corner = corner.replace('l', 'r');
      else if (corner.includes('r')) corner = corner.replace('r', 'l');
    }
    if (target.flipY) {
      if (corner.includes('t')) corner = corner.replace('t', 'b');
      else if (corner.includes('b')) corner = corner.replace('b', 't');
    }

    const pointMap = state.getPointMap(target);
    if (!(corner in pointMap)) return;
    state.onlyDrawPoint = corner.includes('m');
    if (state.onlyDrawPoint) {
      const angle = target.getTotalAngle();
      if (angle % 90 !== 0) return;
    }

    const contraryMap = state.getContraryMap(target);
    const point = pointMap[corner];
    let diagonalPoint = contraryMap[corner];

    const isCenter =
      e.transform.original.originX === 'center' &&
      e.transform.original.originY === 'center';
    if (isCenter) {
      const p = target.group
        ? point.transform(
            util.invertTransform(target.group.calcTransformMatrix())
          )
        : point;
      diagonalPoint = diagonalPoint.add(p).scalarDivide(2);
    }
    const uniformIsToggled = e.e[state.canvas.uniScaleKey!];
    let isUniform =
      (state.canvas.uniformScaling && !uniformIsToggled) ||
      (!state.canvas.uniformScaling && uniformIsToggled);

    if (state.onlyDrawPoint) isUniform = false;

    const list: Point[] = [];
    if (state.canvas.width && state.canvas.height) {
      list.push(new Point(state.canvas.width / 2, state.canvas.height / 2));
    }
    for (const object of objects) {
      const d = state.getCaCheMapValue(object);
      list.push(...d);
    }

    const props = {
      target,
      point,
      diagonalPoint,
      corner,
      list,
      isScale,
      isUniform,
      isCenter,
    };

    const noNeedToCollectV =
      state.onlyDrawPoint && (corner.includes('t') || corner.includes('b'));
    const noNeedToCollectH =
      state.onlyDrawPoint && (corner.includes('l') || corner.includes('r'));
    const vList = noNeedToCollectV
      ? []
      : collectVerticalPoint.call(state, props);
    const hList = noNeedToCollectH
      ? []
      : collectHorizontalPoint.call(state, props);

    vList.forEach(o => {
      state.verticalLines.add(JSON.stringify(o));
    });
    hList.forEach(o => {
      state.horizontalLines.add(JSON.stringify(o));
    });
  };

  const moving = (e: TransformEvent) => {
    const target = e.target;
    target.setCoords();
    state.onlyDrawPoint = false;
    state.verticalLines.clear();
    state.horizontalLines.clear();

    const objects = state.getObjectsByTarget(target);
    const points: Point[] = [];
    if (state.canvas.width && state.canvas.height) {
      points.push(new Point(state.canvas.width / 2, state.canvas.height / 2));
    }
    for (const object of objects) {
      points.push(...state.getCaCheMapValue(object));
    }

    const { vLines, hLines } = collectLine.call(state, target, points);
    vLines.forEach(o => {
      state.verticalLines.add(JSON.stringify(o));
    });
    hLines.forEach(o => {
      state.horizontalLines.add(JSON.stringify(o));
    });
  };

  const beforeRender = () => {
    const ctx = state.canvas.contextTop;
    if (!ctx) return;
    state.canvas.clearContext(ctx);
  };

  const afterRender = () => {
    const ctx = state.canvas.getTopContext();
    if (!ctx) return;

    if (state.onlyDrawPoint) {
      drawPointList.call(state);
    } else {
      drawVerticalLine.call(state);
      drawHorizontalLine.call(state);
    }
  };

  canvas.on('mouse:up', mouseUp);
  canvas.on('object:resizing', scalingOrResizing);
  canvas.on('object:scaling', scalingOrResizing);
  canvas.on('object:moving', moving);
  canvas.on('before:render', beforeRender);
  canvas.on('after:render', afterRender);

  return () => {
    canvas.off('mouse:up', mouseUp);
    canvas.off('object:resizing', scalingOrResizing);
    canvas.off('object:scaling', scalingOrResizing);
    canvas.off('object:moving', moving);
    canvas.off('before:render', beforeRender);
    canvas.off('after:render', afterRender);
  };
}
