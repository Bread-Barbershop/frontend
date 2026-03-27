import { motion, type Transition } from 'framer-motion';
import Image from 'next/image';
import { Ref } from 'react';

import { showcaseItems } from '@/app/(home)/components/showcaseItems';
import DeleteInvitationButton from '@/app/dashboard/components/DeleteInvitationButton';
import EditInvitationButton from '@/app/dashboard/components/EditInvitationButton';
import PublishedUrlActions from '@/app/dashboard/components/PublishedUrlActions';
import PublishInvitationButton from '@/app/dashboard/components/PublishInvitationButton';
import { InviteListItem } from '@/app/dashboard/types';

const CARD_LIFT_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 24,
};
const LIFT_OFFSET = 4;

type InvitationItemProps = {
  invite: InviteListItem;
  imageIndex: number;
  isHovered: boolean;
  liftDistance: number;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onPublish: () => void;
  onEdit: () => void;
  onCopyUrl: () => void;
  publishedUrl: string | null;
  isPublishing: boolean;
  measureRef?: Ref<HTMLDivElement>;
};

function InvitationItem({
  invite,
  imageIndex,
  isHovered,
  liftDistance,
  onHoverStart,
  onHoverEnd,
  onPublish,
  onEdit,
  onCopyUrl,
  publishedUrl,
  isPublishing,
  measureRef,
}: InvitationItemProps) {
  const showcaseItem = showcaseItems[(imageIndex - 1) % showcaseItems.length];
  const translateY = isHovered ? -Math.max(liftDistance - LIFT_OFFSET, 0) : 0;

  return (
    <div
      dir="ltr"
      onPointerEnter={onHoverStart}
      onPointerLeave={onHoverEnd}
      className={`relative flex w-[19.5rem] shrink-0 justify-start overflow-visible pt-10 ${
        isHovered ? 'z-10' : ''
      }`}
    >
      {isHovered && (
        <motion.div
          animate={{ y: translateY }}
          transition={CARD_LIFT_TRANSITION}
          className="absolute right-2 z-20"
        >
          <DeleteInvitationButton />
        </motion.div>
      )}

      <motion.div
        ref={measureRef}
        animate={{ y: translateY }}
        transition={CARD_LIFT_TRANSITION}
        className="relative flex h-118.75 w-65 items-end overflow-hidden rounded-2xl p-1"
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
          {publishedUrl ? (
            <PublishedUrlActions url={publishedUrl} onCopy={onCopyUrl} />
          ) : (
            <PublishInvitationButton
              disabled={isPublishing}
              isPublishing={isPublishing}
              onClick={onPublish}
            />
          )}
          <EditInvitationButton
            disabled={!invite.invitationUuid}
            onClick={onEdit}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default InvitationItem;
