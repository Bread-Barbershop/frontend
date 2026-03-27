'use client';

import {
  DASHBOARD_COPY,
  INVITATION_SECTION_CLASS,
  INVITATION_SLIDE_CLASS,
  INVITATION_TRACK_CLASS,
  INVITATION_VIEWPORT_CLASS,
} from '@/app/dashboard/dashboardConfig';
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
    ? DASHBOARD_COPY.invitationLoadingMessage
    : error || DASHBOARD_COPY.invitationEmptyMessage;

  return (
    <section ref={sectionRef} className={INVITATION_SECTION_CLASS}>
      {!hasInvites ? (
        <InvitationEmptyState message={statusMessage} />
      ) : (
        <div ref={emblaRef} className={INVITATION_VIEWPORT_CLASS} dir="rtl">
          <div className={INVITATION_TRACK_CLASS}>
            {invites.map((invite, index) => (
              <div key={invite.folderId} className={INVITATION_SLIDE_CLASS}>
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
