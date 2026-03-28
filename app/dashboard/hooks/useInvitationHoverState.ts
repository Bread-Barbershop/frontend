'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { debounce } from '@/shared/utils/debounce';

const HOVER_ENTER_DELAY_MS = 150;
const HOVER_LEAVE_DELAY_MS = 150;

function useInvitationHoverState(itemCount: number) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [sampleItemElement, setSampleItemElement] =
    useState<HTMLDivElement | null>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [liftDistance, setLiftDistance] = useState(0);
  const hoverEnterDebouncedRef = useRef(
    debounce((index: number) => {
      setHoveredIndex(index);
    }, HOVER_ENTER_DELAY_MS)
  );
  const hoverLeaveDebouncedRef = useRef(
    debounce(() => {
      setHoveredIndex(null);
    }, HOVER_LEAVE_DELAY_MS)
  );

  const sampleItemRef = useCallback((node: HTMLDivElement | null) => {
    setSampleItemElement(node);
  }, []);

  useLayoutEffect(() => {
    const updateLiftDistance = () => {
      const sectionHeight =
        sectionRef.current?.getBoundingClientRect().height ?? 0;
      const itemHeight = sampleItemElement?.getBoundingClientRect().height ?? 0;

      if (sectionHeight <= 0 || itemHeight <= 0) return;

      setLiftDistance(Math.max(sectionHeight - itemHeight, 0));
    };

    const frameId = window.requestAnimationFrame(updateLiftDistance);

    const resizeObserver = new ResizeObserver(() => {
      updateLiftDistance();
    });

    if (sectionRef.current) {
      resizeObserver.observe(sectionRef.current);
    }

    if (sampleItemElement) {
      resizeObserver.observe(sampleItemElement);
    }

    window.addEventListener('resize', updateLiftDistance);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateLiftDistance);
    };
  }, [itemCount, sampleItemElement]);

  useEffect(() => {
    const hoverEnterDebounced = hoverEnterDebouncedRef.current;
    const hoverLeaveDebounced = hoverLeaveDebouncedRef.current;

    return () => {
      hoverEnterDebounced.cancel();
      hoverLeaveDebounced.cancel();
    };
  }, []);

  const handleHoverStart = (index: number) => {
    hoverLeaveDebouncedRef.current.cancel();
    hoverEnterDebouncedRef.current(index);
  };

  const handleHoverEnd = () => {
    hoverEnterDebouncedRef.current.cancel();
    hoverLeaveDebouncedRef.current();
  };

  const resetHover = () => {
    hoverEnterDebouncedRef.current.cancel();
    hoverLeaveDebouncedRef.current.cancel();
    setHoveredIndex(null);
  };

  return {
    sectionRef,
    sampleItemRef,
    hoveredIndex,
    liftDistance,
    handleHoverStart,
    handleHoverEnd,
    resetHover,
  };
}

export default useInvitationHoverState;
