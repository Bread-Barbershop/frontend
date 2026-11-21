'use client';

import { useMemo } from 'react';

import type { InvitationPreviewTarget } from '@/app/dashboard/types';
import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';
import InvitationPreviewModal from '@/features/invitation/preview/InvitationPreviewModal';

type DashboardInvitationPreviewModalProps = {
  errorMessage: string | null;
  target: InvitationPreviewTarget | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: (target: InvitationPreviewTarget) => void;
  payload: NormalizedGuestPayload | null;
  requestId: number;
  status: 'idle' | 'loading' | 'success' | 'error';
};

export default function DashboardInvitationPreviewModal({
  errorMessage,
  target,
  isOpen,
  onClose,
  onRetry,
  payload,
  status,
}: DashboardInvitationPreviewModalProps) {
  const snapshot = useMemo(
    () =>
      status === 'success' && target && payload
        ? {
            payload,
            previewFolderId: target.folderId,
            localAudioSrc: null,
          }
        : null,
    [target, payload, status]
  );

  if (!isOpen) return null;

  return (
    <InvitationPreviewModal
      source="saved"
      audienceContext={target ?? undefined}
      snapshot={snapshot}
      onClose={onClose}
      loadError={
        status === 'error' && target
          ? {
              message: errorMessage ?? '미리보기를 불러오지 못했습니다.',
              onRetry: () => onRetry(target),
            }
          : undefined
      }
    />
  );
}
