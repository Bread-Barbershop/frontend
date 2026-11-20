export const SCROLL_ANIMATION_TYPES = [
  'none',
  'fade-up',
  'fade-down',
  'fade',
  'zoom-in',
] as const;
export const SCROLL_TRIGGER_MODES = [
  'down-only',
  'down-repeat',
  'both',
] as const;

export type ScrollAnimationType = (typeof SCROLL_ANIMATION_TYPES)[number];
export type ScrollTriggerMode = (typeof SCROLL_TRIGGER_MODES)[number];
export type ScrollAnimationSettings = {
  animationType: ScrollAnimationType;
  triggerMode: ScrollTriggerMode;
  animationDurationMs: number;
  animationEasing: MotionEasing;
};

export const DEFAULT_SCROLL_ANIMATION: ScrollAnimationSettings = {
  animationType: 'fade-up',
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
    SCROLL_ANIMATION_TYPES.find(v => v === props.animationType) ?? 'fade-up';
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
import {
  boundedMotionNumber,
  resolveMotionEasing,
  type MotionEasing,
} from '@/shared/utils/motionSettings';
