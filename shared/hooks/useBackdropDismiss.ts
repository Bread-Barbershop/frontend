'use client';

import { useRef, type MouseEvent, type PointerEvent } from 'react';

type Backdrop = 'element' | 'outside-dialog';

function isBackdrop<T extends HTMLElement>(
  event: MouseEvent<T> | PointerEvent<T>,
  backdrop: Backdrop,
  target: EventTarget | null = event.target
) {
  if (target !== event.currentTarget) return false;
  if (backdrop === 'element') return true;

  // A native dialog also receives hits on its padding and ::backdrop.
  const { left, right, top, bottom } =
    event.currentTarget.getBoundingClientRect();
  const { clientX, clientY } = event;
  return clientX < left || clientX >= right || clientY < top || clientY >= bottom;
}

export function useBackdropDismiss<T extends HTMLElement>(
  onDismiss: (() => void) | undefined,
  backdrop: Backdrop = 'element'
) {
  const pressedOnBackdrop = useRef(false);

  return {
    onPointerDownCapture: (event: PointerEvent<T>) => {
      pressedOnBackdrop.current =
        event.button === 0 && isBackdrop(event, backdrop);
    },
    onPointerUpCapture: (event: PointerEvent<T>) => {
      if (!pressedOnBackdrop.current) return;

      // A touch or pen can keep sending events to the pressed element.
      const { clientX, clientY, currentTarget, pointerType } = event;
      const { ownerDocument } = currentTarget;
      const target =
        (pointerType === 'touch' || pointerType === 'pen') &&
        backdrop === 'element' &&
        typeof ownerDocument.elementFromPoint === 'function'
          ? ownerDocument.elementFromPoint(clientX, clientY)
          : event.target;
      pressedOnBackdrop.current = isBackdrop(event, backdrop, target);
    },
    onPointerCancelCapture: () => {
      pressedOnBackdrop.current = false;
    },
    onClick: (event: MouseEvent<T>) => {
      const shouldDismiss = pressedOnBackdrop.current;
      pressedOnBackdrop.current = false;
      if (!isBackdrop(event, backdrop)) return;

      // Wait for the click so the release cannot land on the page underneath.
      event.stopPropagation();
      if (shouldDismiss) onDismiss?.();
    },
  };
}
