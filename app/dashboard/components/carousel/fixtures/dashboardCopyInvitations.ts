import type { InviteListItem } from '@/app/dashboard/types';

export const sourceInvitation: InviteListItem = {
  folderId: 'source-folder',
  invitationUuid: 'source-uuid',
  name: '원본 초대장',
  published: true,
  readiness: 'ready',
  thumbnailUrl: '/source.webp',
};

export const clonedInvitation: InviteListItem = {
  folderId: 'clone-folder',
  invitationUuid: 'clone-uuid',
  name: '복사한 초대장',
  published: false,
  readiness: 'idle',
  thumbnailUrl:
    '/api/drive/previewAsset?kind=image&fileId=clone-thumbnail&folderId=clone-folder',
};
