import { hasLegacySlotFrame } from '../../slot/legacy';

import { getDistanceList } from './basic';

import type { AligningGuidelinesState } from '../aligning-guidelines';
import type { LineProps } from '../typedefs';
import type { FabricObject, Point, TOriginX, TOriginY } from 'fabric';

export function collectLine(
  this: AligningGuidelinesState,
  target: FabricObject,
  points: Point[]
) {
  const pointMap = this.getPointMap(target);
  const list = [
    pointMap.tl,
    pointMap.tr,
    pointMap.br,
    pointMap.bl,
    pointMap.center,
  ];
  const margin = this.margin / this.canvas.getZoom();
  const opts = { target, list, points, margin };
  const vLines = collectPoints({ ...opts, type: 'x' });
  const hLines = collectPoints({ ...opts, type: 'y' });

  return { vLines, hLines };
}

type CollectItemLineProps = {
  target: FabricObject;
  list: Point[];
  points: Point[];
  margin: number;
  type: 'x' | 'y';
};
const originArr: [TOriginX, TOriginY][] = [
  ['left', 'top'],
  ['right', 'top'],
  ['right', 'bottom'],
  ['left', 'bottom'],
  ['center', 'center'],
];
function collectPoints(props: CollectItemLineProps) {
  const { target, list, points, margin, type } = props;
  const res: LineProps[] = [];
  const arr: ReturnType<typeof getDistanceList>[] = [];
  let min = Infinity;
  for (const item of list) {
    const o = getDistanceList(item, points, type);
    arr.push(o);
    if (min > o.dis) min = o.dis;
  }
  if (min > margin) return res;
  let moved = false;
  for (let i = 0; i < list.length; i++) {
    if (arr[i].dis !== min) continue;
    for (const item of arr[i].arr) {
      res.push({ origin: list[i], target: item });
    }

    if (moved) continue;
    moved = true;

    // Slot frames currently use frame-space guide points but image-space mutation.
    // Until a frame-aware setter is introduced, keep the guide visual only.
    if (hasLegacySlotFrame(target)) {
      continue;
    }

    const d = arr[i].arr[0][type] - list[i][type];
    list.forEach(item => {
      item[type] += d;
    });
    target.setXY(list[i], ...originArr[i]);
    target.setCoords();
  }

  return res;
}
