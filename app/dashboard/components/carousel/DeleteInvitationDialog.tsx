import { useEffect, useRef, useState } from 'react';

import type { InviteListItem } from '@/app/dashboard/types';
import Confirm from '@/components/molecules/confirm/Confirm';

type Props = {
  invite: InviteListItem;
  onClose: () => void;
  onConfirm: () => void;
};

type DeleteScope = 'loading' | 'unknown' | string[];

function getDeletePrompt(title: string, scope: DeleteScope) {
  if (scope === 'loading')
    return {
      message: `‘${title}’ 삭제 범위 확인`,
      description: '함께 삭제될 하객 그룹을 확인하고 있어요.',
      confirmText: '확인 중…',
    };
  const linkNotice = '이미 보낸 링크로도 초대장을 열 수 없어요.';
  if (Array.isArray(scope) && scope.length === 0)
    return {
      message: `‘${title}’ 초대장을 삭제할까요?`,
      description: linkNotice,
      confirmText: '초대장 삭제',
    };
  const groupsNotice =
    scope === 'unknown'
      ? '하객 그룹 목록을 불러오지 못했어요. 삭제하면 이 행사의 기본 초대장과 모든 하객 그룹이 함께 삭제돼요.'
      : `기본 초대장과 하객 그룹 ${scope.length}개(${scope.join('·')})가 함께 삭제돼요.`;
  return {
    message: `‘${title}’ 전체를 삭제할까요?`,
    description: `${groupsNotice} ${linkNotice}`,
    confirmText: '초대장 전체 삭제',
  };
}

export default function DeleteInvitationDialog({
  invite,
  onClose,
  onConfirm,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [scope, setScope] = useState<DeleteScope>('loading');
  const { folderId } = invite;

  useEffect(() => {
    const controller = new AbortController();
    async function loadScope() {
      const params = new URLSearchParams({ folderId, view: 'editor-options' });
      try {
        const response = await fetch(
          `/api/drive/invitationAudiences?${params}`,
          {
            cache: 'no-store',
            signal: controller.signal,
          }
        );
        const data = await response.json();
        if (controller.signal.aborted) return;
        const groups: unknown = data?.audiences;
        if (
          !response.ok ||
          !Array.isArray(groups) ||
          !groups.every(
            group => typeof group?.name === 'string' && group.name.trim()
          )
        ) {
          setScope('unknown');
          return;
        }
        setScope(groups.map(group => group.name));
      } catch {
        if (!controller.signal.aborted) setScope('unknown');
      }
    }
    void loadScope();
    return () => controller.abort();
  }, [folderId]);

  return (
    <Confirm
      ref={dialogRef}
      {...getDeletePrompt(invite.displayTitle ?? invite.name, scope)}
      confirmDisabled={scope === 'loading'}
      cancelText="취소"
      onConfirm={onConfirm}
      onCancel={onClose}
      onClose={onClose}
      initialFocus="cancel"
      variant="white"
      yPosition="center"
      actionButtonClassName="w-auto min-w-[66px] whitespace-nowrap px-3"
    />
  );
}
