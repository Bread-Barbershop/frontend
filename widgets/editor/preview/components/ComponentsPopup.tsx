import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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

  const handleTabClick = (english: string) => {
    if (isManualScrolling.current) return;
    isManualScrolling.current = true;
    setActive(english);
    sectionRefs.current[english]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    // 스크롤 이동이 끝날 때까지 감지 일시 중단
    setTimeout(() => {
      isManualScrolling.current = false;
    }, 800);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-4" onClick={onPopClose} />
      <div className="fixed z-50 bottom-12 left-1/2 -translate-x-1/2 w-164 h-99.5 shadow-edit bg-white rounded-md flex flex-col gap-3">
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
    </>,
    document.body
  );
}
export default ComponentsPopup;
