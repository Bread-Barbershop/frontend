export const SCROLL_ANIMATION_TYPES = ['none', 'fade-up', 'fade-down', 'fade', 'zoom-in'] as const;
export const SCROLL_TRIGGER_MODES = ['down-only', 'both', 'up-only'] as const;

export type ScrollAnimationType = (typeof SCROLL_ANIMATION_TYPES)[number];
export type ScrollTriggerMode = (typeof SCROLL_TRIGGER_MODES)[number];
export type ScrollAnimationSettings = {
  animationType: ScrollAnimationType;
  triggerMode: ScrollTriggerMode;
};

export function resolveScrollAnimation(input: unknown): ScrollAnimationSettings {
  const props = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const animationType = SCROLL_ANIMATION_TYPES.find(v => v === props.animationType) ?? 'fade-up';
  const triggerMode = SCROLL_TRIGGER_MODES.find(v => v === props.triggerMode) ?? 'down-only';
  return { animationType, triggerMode };
}
