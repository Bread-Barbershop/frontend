'use client';

import { useEffect, useRef, useState } from 'react';

import { debounce } from '@/shared/utils/debounce';

const HOVER_ENTER_DELAY_MS = 150;
const HOVER_LEAVE_DELAY_MS = 150;

function useInvitationHoverState(itemCount: number) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sampleItemRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const updateLiftDistance = () => {
      const sectionHeight =
        sectionRef.current?.getBoundingClientRect().height ?? 0;
      const itemHeight =
        sampleItemRef.current?.getBoundingClientRect().height ?? 0;

      setLiftDistance(Math.max(sectionHeight - itemHeight, 0));
    };

    updateLiftDistance();

    const resizeObserver = new ResizeObserver(() => {
      updateLiftDistance();
    });

    if (sectionRef.current) {
      resizeObserver.observe(sectionRef.current);
    }

    if (sampleItemRef.current) {
      resizeObserver.observe(sampleItemRef.current);
    }

    window.addEventListener('resize', updateLiftDistance);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateLiftDistance);
    };
  }, [itemCount]);

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

  return {
    sectionRef,
    sampleItemRef,
    hoveredIndex,
    liftDistance,
    handleHoverStart,
    handleHoverEnd,
  };
}

export default useInvitationHoverState;
