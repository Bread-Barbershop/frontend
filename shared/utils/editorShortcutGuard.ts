import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

const EDITABLE_TARGET_SELECTOR =
  'input, textarea, select, [role="textbox"], [contenteditable]:not([contenteditable="false"])';
const ACTIVE_POPUP_SELECTOR =
  '[role="dialog"], [aria-modal="true"], [role="menu"], [data-editor-popup="true"]';

export function shouldIgnoreEditorShortcut(event: KeyboardEvent) {
  if (
    event.defaultPrevented ||
    event.repeat ||
    event.isComposing ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.shiftKey ||
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    window.innerWidth < DESKTOP_CONTENT_MIN_WIDTH
  ) {
    return true;
  }

  const target = event.target;
  if (
    target instanceof Element &&
    target.closest(EDITABLE_TARGET_SELECTOR)
  ) {
    return true;
  }

  return document.querySelector(ACTIVE_POPUP_SELECTOR) !== null;
}
