import { motion, type Transition } from 'framer-motion';
import Image from 'next/image';
import { Ref } from 'react';

import DeleteInvitationButton from '@/app/dashboard/components/DeleteInvitationButton';
import EditInvitationButton from '@/app/dashboard/components/EditInvitationButton';
import PublishedUrlActions from '@/app/dashboard/components/PublishedUrlActions';
import PublishInvitationButton from '@/app/dashboard/components/PublishInvitationButton';
import { InviteListItem } from '@/app/dashboard/types';
import { getInvitationShowcaseItem } from '@/app/dashboard/utils/getInvitationShowcaseItem';

const CARD_LIFT_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 24,
};

const LIFT_OFFSET = 4;

function formatInvitationDate(createdTime?: string) {
  if (!createdTime) return '날짜 없음';

  const isoDate = createdTime.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return '날짜 없음';
  }

  return isoDate.replace(/-/g, '.');
}

type InvitationItemProps = {
  invite: InviteListItem;
  isHovered: boolean;
  deleteError: string | null;
  publishError: string | null;
  isDeleting: boolean;
  liftDistance: number;
  onDelete: () => void;
  onPublish: () => void;
  onEdit: () => void;
  onCopyUrl: () => void;
  publishedUrl: string | null;
  isPublishing: boolean;
  measureRef?: Ref<HTMLDivElement>;
};

function InvitationItem({
  invite,
  isHovered,
  deleteError,
  publishError,
  isDeleting,
  liftDistance,
  onDelete,
  onPublish,
  onEdit,
  onCopyUrl,
  publishedUrl,
  isPublishing,
  measureRef,
}: InvitationItemProps) {
  const showcaseItem = getInvitationShowcaseItem(invite.folderId);
  const translateY = isHovered ? -Math.max(liftDistance - LIFT_OFFSET, 0) : 0;
  const invitationDate = formatInvitationDate(invite.createdTime);
  const isPublished = Boolean(publishedUrl);
  const publishStatus = isPublished ? 'URL 발행됨' : 'URL 발행안됨';
  const publishStatusTone = isPublished
    ? 'font-semibold text-blue-600'
    : 'font-semibold text-red-500';

  return (
    <div
      dir="ltr"
      className={`relative flex w-[19.5rem] shrink-0 justify-start overflow-visible pt-10 ${
        isHovered ? 'z-10' : ''
      }`}
    >
      {isHovered && (
        <motion.div
          animate={{ y: translateY }}
          transition={CARD_LIFT_TRANSITION}
          className="absolute right-2 top-10 z-20"
        >
          <DeleteInvitationButton disabled={isDeleting} onClick={onDelete} />
        </motion.div>
      )}

      <motion.div
        ref={measureRef}
        animate={{ y: translateY }}
        transition={CARD_LIFT_TRANSITION}
        className="relative flex w-65 flex-col overflow-visible"
      >
        <div
          className={`h-8 transition-all duration-200 ${
            isHovered ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <div className="flex h-full items-center justify-between rounded-t-lg border border-white/20 bg-white/[0.05] px-2 text-[13px] tracking-[0.08em] shadow-[0_16px_36px_rgba(15,23,42,0.18)] backdrop-blur-sm">
            <span className="font-semibold text-black">{invitationDate}</span>
            <span className={publishStatusTone}>{publishStatus}</span>
          </div>
        </div>

        <div
          className={`relative flex h-118.75 items-end overflow-hidden p-1 ${
            isHovered ? 'rounded-b-2xl rounded-t-none' : 'rounded-2xl'
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
            {publishedUrl ? (
              <>
                <PublishedUrlActions url={publishedUrl} onCopy={onCopyUrl} />
                <PublishInvitationButton
                  disabled={isPublishing}
                  isPublishing={isPublishing}
                  onClick={onPublish}
                  label="초대장 재발행하기"
                />
              </>
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
            {(deleteError || publishError) && (
              <div className="w-55 rounded-lg border border-red-200 bg-white px-3 py-2 text-center text-xs font-medium text-red-600">
                {deleteError || publishError}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default InvitationItem;
