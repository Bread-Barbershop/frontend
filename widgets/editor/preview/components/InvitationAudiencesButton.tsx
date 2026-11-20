'use client';

import { type ComponentProps, useEffect, useRef, useState } from 'react';

import type { AudienceGroup } from '@/features/invitation/audiences/model';

import InvitationAudiencesDialog from './InvitationAudiencesDialog';

function openAudienceEditor(group: AudienceGroup) {
  const params = new URLSearchParams({ uuid: group.invitationUuid });
  // 새 편집기 세션에서 Zustand와 Fabric을 대상 초대장의 데이터로 초기화한다.
  window.location.assign(
    `/editor/${encodeURIComponent(group.folderId)}?${params}`
  );
}

export default function InvitationAudiencesButton({
  upload,
  audienceName,
}: {
  upload: ComponentProps<typeof InvitationAudiencesDialog>['upload'];
  audienceName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <div className="grid gap-1.5">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={upload.isLoading || upload.isCleaningUp}
        onClick={() => setIsOpen(true)}
        className="flex h-11 w-full items-center justify-center rounded-lg bg-white text-sm font-semibold shadow-edit transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
      >
        하객별 구분
      </button>
      {audienceName && (
        <p
          title={`${audienceName} 편집 중`}
          className="truncate rounded-md bg-[#e9eee6] px-2 py-1 text-center text-xs font-semibold text-[#293c2d]"
        >
          {audienceName} 편집 중
        </p>
      )}
      {isOpen && (
        <InvitationAudiencesDialog
          upload={upload}
          onClose={() => setIsOpen(false)}
          onOpenEditor={openAudienceEditor}
        />
      )}
    </div>
  );
}
