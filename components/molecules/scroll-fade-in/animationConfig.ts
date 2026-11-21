import {
  boundedMotionNumber,
  resolveMotionEasing,
  type MotionEasing,
} from '@/shared/utils/motionSettings';

export const SCROLL_ANIMATION_OPTIONS = [
  { value: 'none', label: '효과 없음' },
  { value: 'fade-up', label: '아래에서 위로' },
  { value: 'fade-down', label: '위에서 아래로' },
  { value: 'fade', label: '페이드' },
  { value: 'zoom-in', label: '확대' },
  { value: 'from-left', label: '왼쪽에서 등장' },
  { value: 'from-right', label: '오른쪽에서 등장' },
  { value: 'focus-in', label: '선명해지기' },
] as const;

export const PAIRED_ENTRANCE = {
  value: 'paired',
  label: '양옆에서 모이기',
} as const;

export function supportsPairedEntrance(component: string) {
  return ['gallery', 'interview', 'coupleIntroduction', 'dressCode'].includes(
    component
  );
}

export const SCROLL_TRIGGER_MODES = [
  'down-only',
  'down-repeat',
  'both',
] as const;

export type ScrollAnimationType =
  (typeof SCROLL_ANIMATION_OPTIONS)[number]['value'];
export type BlockEntrance = ScrollAnimationType | typeof PAIRED_ENTRANCE.value;

export function getBlockEntrance(
  component: string,
  props: unknown
): BlockEntrance | undefined {
  if (!props || typeof props !== 'object' || !('entranceEffect' in props))
    return undefined;
  const value = props.entranceEffect;
  if (value === PAIRED_ENTRANCE.value && supportsPairedEntrance(component))
    return value;
  return SCROLL_ANIMATION_OPTIONS.find(option => option.value === value)?.value;
}
export type ScrollTriggerMode = (typeof SCROLL_TRIGGER_MODES)[number];
export type ScrollAnimationSettings = {
  animationType: ScrollAnimationType;
  triggerMode: ScrollTriggerMode;
  animationDurationMs: number;
  animationEasing: MotionEasing;
};

export const DEFAULT_SCROLL_ANIMATION: ScrollAnimationSettings = {
  animationType: 'none',
  triggerMode: 'down-only',
  animationDurationMs: 700,
  animationEasing: 'natural',
};

export function resolveScrollAnimation(
  input: unknown
): ScrollAnimationSettings {
  const props =
    input && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {};
  const animationType =
    SCROLL_ANIMATION_OPTIONS.find(
      option => option.value === props.animationType
    )?.value ?? DEFAULT_SCROLL_ANIMATION.animationType;
  const savedTrigger =
    props.triggerMode === 'up-only' ? 'both' : props.triggerMode;
  const triggerMode =
    SCROLL_TRIGGER_MODES.find(v => v === savedTrigger) ?? 'down-only';
  return {
    animationType,
    triggerMode,
    animationDurationMs: boundedMotionNumber(
      props.animationDurationMs,
      200,
      2000,
      700
    ),
    animationEasing: resolveMotionEasing(props.animationEasing),
  };
}
