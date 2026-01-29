import { useEffect, useRef, useState } from 'react';

import ContentsArea from './ContentsArea';
import TabArea from './TabArea';

interface Props {
  onPopClose: () => void;
}

function CompoenentsPopup({ onPopClose }: Props) {
  const [active, setActive] = useState('wedding');
  const sectionRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const type = entry.target.getAttribute('data-type');
            if (type) setActive(type);
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.3,
      }
    );

    Object.values(sectionRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
  const handleTabClick = (english: string) => {
    setActive(english);
    sectionRefs.current[english]?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  };
  return (
    <div className="absolute bottom-15 -left-35 w-164 h-99.5 shadow-edit bg-white rounded-md flex flex-col gap-3">
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
  );
}
export default CompoenentsPopup;
