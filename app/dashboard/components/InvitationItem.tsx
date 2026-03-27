import { motion } from 'framer-motion';
import Image from 'next/image';
import { Ref } from 'react';

import { showcaseItems } from '@/app/(home)/components/showcaseItems';

type InvitationItemProps = {
  index: number;
  isHovered: boolean;
  liftDistance: number;
  onHoverStart: (index: number) => void;
  onHoverEnd: () => void;
  measureRef?: Ref<HTMLDivElement>;
};

function InvitationItem({
  index,
  isHovered,
  liftDistance,
  onHoverStart,
  onHoverEnd,
  measureRef,
}: InvitationItemProps) {
  const showcaseItem = showcaseItems[(index - 1) % showcaseItems.length];

  return (
    <motion.div
      ref={measureRef}
      animate={{ y: isHovered ? -liftDistance : 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      onHoverStart={() => onHoverStart(index)}
      onHoverEnd={onHoverEnd}
      className={`relative flex h-118.75 w-full shrink-0 items-end overflow-hidden rounded-2xl p-5 ${
        isHovered ? 'z-10' : ''
      }`}
    >
      <Image
        src={showcaseItem.image}
        alt={showcaseItem.alt}
        fill
        sizes="260px"
        className="object-cover"
      />

      <div
        className={`absolute inset-0 bg-black/8 transition-opacity duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
          isHovered
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <button
          type="button"
          className="min-w-55 cursor-pointer rounded-lg border border-border-neutral bg-white px-4 py-2 text-sm font-semibold text-[#1F72EF]"
        >
          URL 링크 확인하기
        </button>
        <button
          type="button"
          className="min-w-55 cursor-pointer rounded-lg border border-border-neutral bg-white px-4 py-2 text-sm font-semibold text-text-primary"
        >
          재편집하기
        </button>
      </div>
    </motion.div>
  );
}

export default InvitationItem;
