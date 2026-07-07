import { Canvas, FabricImage, FabricObject } from 'fabric';

import { buildSlotEntityFromLegacyTarget, getLegacySlotMeta } from './legacy';
import { SlotEntity, SlotLegacyImageObject, SlotLegacyObject } from './types';

// 현재 레거시 Fabric 객체 형태에서 슬롯 ID를 읽어오기
export const getSlotId = (target: unknown) =>
  getLegacySlotMeta(target)?.key ?? null;

export const isSlotObject = (target: unknown): target is SlotLegacyObject =>
  getLegacySlotMeta(target) !== null;

export const isSlotImageObject = (
  target: unknown
): target is SlotLegacyImageObject => {
  return target instanceof FabricImage && isSlotObject(target);
};

export const isSlotPlaceholderObject = (target: unknown) =>
  target instanceof FabricObject &&
  isSlotObject(target) &&
  !(target instanceof FabricImage) &&
  target.get('name') === 'slot-placeholder';

// 레거시 Fabric 객체 형태에서 슬롯 엔티티 생성
export const getSlotEntityByTarget = (target: unknown): SlotEntity | null =>
  buildSlotEntityFromLegacyTarget(target);

// 슬롯 ID가 같은 모든 객체 찾기
export const findSlotTargetsBySlotId = (canvas: Canvas, slotId: string) =>
  canvas
    .getObjects()
    .filter(
      (target): target is SlotLegacyObject => getSlotId(target) === slotId
    );

// 플레이스홀더가 없는 경우에는 슬롯 ID가 같은 첫 번째 객체를 반환
export const findPrimarySlotTargetBySlotId = (
  canvas: Canvas,
  slotId: string
) => {
  const targets = findSlotTargetsBySlotId(canvas, slotId);

  return (
    targets.find(target => target instanceof FabricImage) ?? targets[0] ?? null
  );
};
