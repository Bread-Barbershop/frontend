export const MOTION_EASINGS = {
  linear: 'linear',
  natural: 'cubic-bezier(0.4, 0, 0.2, 1)',
  soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const;

export type MotionEasing = keyof typeof MOTION_EASINGS;

export const MOTION_EASING_OPTIONS = [
  { value: 'linear', label: '일정하게' },
  { value: 'natural', label: '자연스럽게' },
  { value: 'soft', label: '아주 부드럽게' },
] as const;

export function resolveMotionEasing(value: unknown): MotionEasing {
  return (
    MOTION_EASING_OPTIONS.find(option => option.value === value)?.value ??
    'natural'
  );
}

export function boundedMotionNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number
) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}
