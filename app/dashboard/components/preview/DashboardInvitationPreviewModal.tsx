'use client';

import { useMemo } from 'react';

import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';
import InvitationPreviewModal from '@/features/invitation/preview/InvitationPreviewModal';

type DashboardInvitationPreviewModalProps = {
  errorMessage: string | null;
  folderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRetry: (folderId: string) => void;
  payload: NormalizedGuestPayload | null;
  requestId: number;
  status: 'idle' | 'loading' | 'success' | 'error';
};

export default function DashboardInvitationPreviewModal({
  errorMessage,
  folderId,
  isOpen,
  onClose,
  onRetry,
  payload,
  status,
}: DashboardInvitationPreviewModalProps) {
  const snapshot = useMemo(
    () =>
      status === 'success' && folderId && payload
        ? {
            payload,
            previewFolderId: folderId,
            localAudioSrc: null,
          }
        : null,
    [folderId, payload, status]
  );

  if (!isOpen) return null;

  return (
    <InvitationPreviewModal
      source="saved"
      snapshot={snapshot}
      onClose={onClose}
      loadError={
        status === 'error' && folderId
          ? {
              message: errorMessage ?? '미리보기를 불러오지 못했습니다.',
              onRetry: () => onRetry(folderId),
            }
          : undefined
      }
    />
  );
}
