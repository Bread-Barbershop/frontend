import {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react';

const DRAG_THRESHOLD = 8;

interface PointerGesture {
  pointerId: number;
  startX: number;
  startY: number;
  didDrag: boolean;
}

export function useGallerySwipeClick(imageClick: (index: number) => void) {
  const pointerGestureRef = useRef<PointerGesture | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const gesture = pointerGestureRef.current;
      if (!gesture || event.pointerId !== gesture.pointerId) return;

      const distance = Math.hypot(
        event.clientX - gesture.startX,
        event.clientY - gesture.startY
      );
      if (distance > DRAG_THRESHOLD) gesture.didDrag = true;
    };

    const handlePointerUp = (event: PointerEvent) => {
      const gesture = pointerGestureRef.current;
      if (!gesture || event.pointerId !== gesture.pointerId) return;

      pointerGestureRef.current = null;
      suppressClickRef.current = gesture.didDrag;
    };

    const handlePointerCancel = (event: PointerEvent) => {
      const gesture = pointerGestureRef.current;
      if (!gesture || event.pointerId !== gesture.pointerId) return;

      pointerGestureRef.current = null;
      suppressClickRef.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      pointerGestureRef.current = null;
      suppressClickRef.current = false;
    };
  }, []);

  const handlePointerDown = useCallback((event: ReactPointerEvent) => {
    if (event.isPrimary === false || event.button !== 0) return;

    pointerGestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      didDrag: false,
    };
    // 이전 드래그가 브라우저 click으로 끝나지 않았어도 새 동작은 정상 처리한다.
    suppressClickRef.current = false;
  }, []);

  const handleCardClick = useCallback(
    (index: number, event?: ReactMouseEvent) => {
      const shouldSuppress =
        Boolean(event && event.detail !== 0) && suppressClickRef.current;
      suppressClickRef.current = false;
      if (shouldSuppress) return;

      imageClick(index);
    },
    [imageClick]
  );

  return {
    handlePointerDown,
    handleCardClick,
  };
}
