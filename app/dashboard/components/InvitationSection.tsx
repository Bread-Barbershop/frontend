'use client';

import useInvitationHoverState from '@/app/dashboard/hooks/useInvitationHoverState';
import { InviteListItem } from '@/app/dashboard/types';

import InvitationEmptyState from './InvitationEmptyState';
import InvitationItem from './InvitationItem';

type InvitationSectionProps = {
  emblaRef: (instance: HTMLDivElement | null) => void;
  invites: InviteListItem[];
  loading: boolean;
  error: string | null;
  onPublish: (folderId: string) => void;
  onEdit: (folderId: string, uuid?: string) => void;
  onCopyUrl: (folderId: string) => void;
  getPublishedUrl: (folderId: string) => string | null;
  isPublishing: (folderId: string) => boolean;
};

function InvitationSection({
  emblaRef,
  invites,
  loading,
  error,
  onPublish,
  onEdit,
  onCopyUrl,
  getPublishedUrl,
  isPublishing,
}: InvitationSectionProps) {
  const {
    sectionRef,
    sampleItemRef,
    hoveredIndex,
    liftDistance,
    handleHoverStart,
    handleHoverEnd,
  } = useInvitationHoverState(invites.length);

  const hasInvites = invites.length > 0;
  const statusMessage = loading
    ? '초대장을 불러오는 중입니다.'
    : error || '만들어진 초대장이 없습니다.';

  return (
    <section
      ref={sectionRef}
      className="relative h-186.75 w-[56.82%] translate-y-20.5 overflow-x-hidden overflow-y-hidden"
    >
      {!hasInvites ? (
        <InvitationEmptyState message={statusMessage} />
      ) : (
        <div ref={emblaRef} className="h-full overflow-hidden pr-5" dir="rtl">
          <div className="flex h-full touch-pan-y touch-pinch-zoom items-end">
            {invites.map((invite, index) => (
              <div
                key={invite.folderId}
                className="flex h-full min-w-0 shrink-0 basis-[19.5rem] items-end"
              >
                <InvitationItem
                  invite={invite}
                  imageIndex={index + 1}
                  isHovered={hoveredIndex === index}
                  liftDistance={liftDistance}
                  onHoverStart={() => handleHoverStart(index)}
                  onHoverEnd={handleHoverEnd}
                  onPublish={() => onPublish(invite.folderId)}
                  onEdit={() =>
                    onEdit(invite.folderId, invite.invitationUuid ?? undefined)
                  }
                  onCopyUrl={() => onCopyUrl(invite.folderId)}
                  publishedUrl={getPublishedUrl(invite.folderId)}
                  isPublishing={isPublishing(invite.folderId)}
                  measureRef={index === 0 ? sampleItemRef : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default InvitationSection;
