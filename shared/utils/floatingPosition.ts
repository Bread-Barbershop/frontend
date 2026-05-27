export type FloatingPlacementMode = 'sticky' | 'center';

type ResolveFloatingTopOptions = {
  mode: FloatingPlacementMode;
  floatingHeight: number;
  triggerRect?: DOMRect | null;
  containerRect?: DOMRect | null;
  viewportHeight?: number;
  viewportGap?: number;
  triggerGap?: number;
  flipSticky?: boolean;
};

export const clampFloatingValue = (
  value: number,
  min: number,
  max: number
) => Math.min(Math.max(value, min), Math.max(min, max));

export function resolveFloatingTop({
  mode,
  floatingHeight,
  triggerRect,
  containerRect,
  viewportHeight = window.innerHeight,
  viewportGap = 12,
  triggerGap = 8,
  flipSticky = false,
}: ResolveFloatingTopOptions) {
  const maxTop = viewportHeight - floatingHeight - viewportGap;

  if (mode === 'center') {
    const preferredTop = containerRect
      ? containerRect.top + (containerRect.height - floatingHeight) / 2
      : (viewportHeight - floatingHeight) / 2;

    return clampFloatingValue(preferredTop, viewportGap, maxTop);
  }

  const preferredTop = triggerRect
    ? triggerRect.top
    : containerRect
      ? containerRect.top
      : (viewportHeight - floatingHeight) / 2;

  if (
    flipSticky &&
    triggerRect &&
    preferredTop + floatingHeight > viewportHeight - viewportGap &&
    triggerRect.top - floatingHeight - triggerGap >= viewportGap
  ) {
    return clampFloatingValue(
      triggerRect.top - floatingHeight - triggerGap,
      viewportGap,
      maxTop
    );
  }

  return clampFloatingValue(preferredTop, viewportGap, maxTop);
}
