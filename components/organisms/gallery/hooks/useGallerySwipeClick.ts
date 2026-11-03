import { EmblaCarouselType } from 'embla-carousel';
import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef } from 'react';

export function useGallerySwipeClick(
  imageClick: (index: number) => void,
  emblaApi?: EmblaCarouselType
) {
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!emblaApi) return;

    let isPointerDown = false;

    const handleEmblaPointerDown = () => {
      isPointerDown = true;
      isDraggingRef.current = false;
    };

    const handleEmblaScroll = () => {
      if (isPointerDown) {
        isDraggingRef.current = true;
      }
    };

    const handleEmblaPointerUp = () => {
      isPointerDown = false;
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    emblaApi.on('pointerDown', handleEmblaPointerDown);
    emblaApi.on('scroll', handleEmblaScroll);
    emblaApi.on('pointerUp', handleEmblaPointerUp);

    return () => {
      emblaApi.off('pointerDown', handleEmblaPointerDown);
      emblaApi.off('scroll', handleEmblaScroll);
      emblaApi.off('pointerUp', handleEmblaPointerUp);
    };
  }, [emblaApi]);

  const handlePointerDown = useCallback((e: ReactPointerEvent) => {
    const clientX = e.clientX ?? (e.nativeEvent as PointerEvent)?.clientX ?? 0;
    const clientY = e.clientY ?? (e.nativeEvent as PointerEvent)?.clientY ?? 0;
    startPosRef.current = { x: clientX, y: clientY };
    isDraggingRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: ReactPointerEvent) => {
    const clientX = e.clientX ?? (e.nativeEvent as PointerEvent)?.clientX ?? 0;
    const clientY = e.clientY ?? (e.nativeEvent as PointerEvent)?.clientY ?? 0;
    const dx = Math.abs(clientX - startPosRef.current.x);
    const dy = Math.abs(clientY - startPosRef.current.y);
    if (dx > 8 || dy > 8) {
      isDraggingRef.current = true;
    }
  }, []);

  const handleCardClick = useCallback(
    (index: number) => {
      if (isDraggingRef.current) return;
      imageClick(index);
    },
    [imageClick]
  );

  return {
    handlePointerDown,
    handlePointerMove,
    handleCardClick,
  };
}
