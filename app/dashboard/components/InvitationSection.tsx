'use client';

import { useEffect, useRef, useState } from 'react';

import InvitationItem from './InvitationItem';

const INVITATION_ITEM_COUNT = 10;

type InvitationSectionProps = {
  emblaRef: (instance: HTMLDivElement | null) => void;
};

function InvitationSection({ emblaRef }: InvitationSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sampleItemRef = useRef<HTMLDivElement | null>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [liftDistance, setLiftDistance] = useState(0);

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
  }, []);

  const invitationItems = Array.from(
    { length: INVITATION_ITEM_COUNT },
    (_, index) => index + 1
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-186.75 w-[56.82%] translate-y-20.5 overflow-x-hidden overflow-y-hidden"
    >
      <div ref={emblaRef} className="h-full overflow-hidden" dir="rtl">
        <div className="flex h-full touch-pan-y touch-pinch-zoom items-end">
          {invitationItems.map(index => (
            <div
              key={index}
              className="flex h-full min-w-0 shrink-0 basis-75 items-end px-5"
            >
              <InvitationItem
                index={index}
                isHovered={hoveredIndex === index}
                liftDistance={liftDistance}
                onHoverStart={setHoveredIndex}
                onHoverEnd={() => setHoveredIndex(null)}
                measureRef={index === 1 ? sampleItemRef : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default InvitationSection;
