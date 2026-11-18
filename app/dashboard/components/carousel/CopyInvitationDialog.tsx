import { useCallback, useRef, useState } from 'react';

import type { InviteListItem } from '@/app/dashboard/types';
import Confirm from '@/components/molecules/confirm/Confirm';

type CopyInvitationDialogProps = {
  invite: InviteListItem;
  onClone: (folderId: string, requestId: string) => Promise<string>;
  onCloned: (folderId: string) => void;
  onClose: () => void;
};

function CopyInvitationDialog({
  invite,
  onClone,
  onCloned,
  onClose,
}: CopyInvitationDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef<string | null>(null);
  const inProgressRef = useRef(false);
  const [isCloning, setIsCloning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const close = useCallback(() => {
    if (!inProgressRef.current) onClose();
  }, [onClose]);

  const confirmClone = async () => {
    if (inProgressRef.current) return;

    inProgressRef.current = true;
    setIsCloning(true);
    setErrorMessage(null);

    try {
      const requestId = (requestIdRef.current ??= crypto.randomUUID());
      const folderId = await onClone(invite.folderId, requestId);
      onCloned(folderId);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : '초대장 복사에 실패했습니다.'
      );
    } finally {
      inProgressRef.current = false;
      setIsCloning(false);
    }
  };

  return (
    <Confirm
      ref={dialogRef}
      message={`“${invite.name}” 초대장을 복사하시겠습니까?`}
      description="복사본은 비공개로 생성되며 따로 편집할 수 있어요."
      confirmText={isCloning ? '복사 중…' : errorMessage ? '다시 시도' : '복사'}
      cancelText="취소"
      confirmTone="neutral"
      actionButtonClassName="font-pretendard text-[14px] font-semibold leading-5"
      initialFocus="cancel"
      isBusy={isCloning}
      errorMessage={errorMessage}
      onConfirm={confirmClone}
      onCancel={close}
      onClose={close}
      variant="white"
      yPosition="center"
    />
  );
}

export default CopyInvitationDialog;
