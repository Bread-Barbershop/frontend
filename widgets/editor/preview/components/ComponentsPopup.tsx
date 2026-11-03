'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

import ContentsArea from './ContentsArea';
import TabArea from './TabArea';

interface Props {
  open?: boolean;
  onPopClose: () => void;
}

const emptySubscribe = () => () => {};

function ComponentsPopup({ open = true, onPopClose }: Props) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [active, setActive] = useState('wedding');
  const [searchQuery, setSearchQuery] = useState('');

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isManualScrolling = useRef(false);
  const manualScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const handleClose = useCallback(() => {
    setSearchQuery('');
    onPopClose();
  }, [onPopClose]);

  useEffect(() => {
    if (!open) return;

    const closeIfViewportGuardActive = () => {
      if (window.innerWidth < DESKTOP_CONTENT_MIN_WIDTH) {
        handleClose();
      }
    };

    closeIfViewportGuardActive();
    window.addEventListener('resize', closeIfViewportGuardActive);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', closeIfViewportGuardActive);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) return;
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
  }, [open, searchQuery]);

  useEffect(() => {
    return () => {
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
    };
  }, []);

  const handleTabClick = (english: string) => {
    if (searchQuery) {
      setSearchQuery('');
    }

    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current);
    }

    isManualScrolling.current = true;
    setActive(english);
    sectionRefs.current[english]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    manualScrollTimeoutRef.current = setTimeout(() => {
      isManualScrolling.current = false;
      manualScrollTimeoutRef.current = null;
    }, 800);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[30000] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <div
            className="absolute inset-0 pointer-events-auto"
            onClick={handleClose}
          />
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-164 h-99.5 shadow-edit bg-white rounded-md flex flex-col gap-3 pointer-events-auto">
            <div>
              <TabArea
                active={active}
                tabClick={english => handleTabClick(english)}
                closeClick={handleClose}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
            <ContentsArea
              scrollContainerRef={scrollContainerRef}
              sectionRefs={sectionRefs}
              searchQuery={searchQuery}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default ComponentsPopup;
