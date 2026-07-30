'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

import ContentsArea from './ContentsArea';
import TabArea from './TabArea';

interface Props {
  onPopClose: () => void;
}

function ComponentsPopup({ onPopClose }: Props) {
  const [active, setActive] = useState('wedding');

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isManualScrolling = useRef(false);
  const manualScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    const closeIfViewportGuardActive = () => {
      if (window.innerWidth < DESKTOP_CONTENT_MIN_WIDTH) {
        onPopClose();
      }
    };

    closeIfViewportGuardActive();
    window.addEventListener('resize', closeIfViewportGuardActive);

    return () =>
      window.removeEventListener('resize', closeIfViewportGuardActive);
  }, [onPopClose]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      entries => {
        if (isManualScrolling.current) return;

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const type = entry.target.getAttribute('data-type');
            if (type) setActive(type);
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.9,
      }
    );

    Object.values(sectionRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
    };
  }, []);

  const handleTabClick = (english: string) => {
    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current);
    }

    isManualScrolling.current = true;
    setActive(english);
    sectionRefs.current[english]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    // 스크롤 이동이 끝날 때까지 감지 일시 중단
    manualScrollTimeoutRef.current = setTimeout(() => {
      isManualScrolling.current = false;
      manualScrollTimeoutRef.current = null;
    }, 800);
  };

  return createPortal(
    <div className="fixed inset-0 z-[30000] pointer-events-none">
      <div
        className="absolute inset-0 pointer-events-auto"
        onClick={onPopClose}
      />
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-164 h-99.5 shadow-edit bg-white rounded-md flex flex-col gap-3 pointer-events-auto">
        <div>
          <TabArea
            active={active}
            tabClick={english => handleTabClick(english)}
            closeClick={onPopClose}
          />
        </div>
        <ContentsArea
          scrollContainerRef={scrollContainerRef}
          sectionRefs={sectionRefs}
        />
      </div>
    </div>,
    document.body
  );
}
export default ComponentsPopup;
