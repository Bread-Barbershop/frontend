import type { InviteListItem } from '@/app/dashboard/types';
import type { NormalizedGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';

export const privateInvite: InviteListItem = {
  folderId: 'private-folder',
  name: '비공개 초대장',
  published: false,
  readiness: 'idle',
  thumbnailUrl: '/saved-thumbnail.webp',
};

const textStyle = {
  font: 'Pretendard',
  fontSize: '16px',
  fontWeight: '400',
  color: '#111111',
  isDefault: true,
};

export const savedPayload: NormalizedGuestPayload = {
  blocks: [],
  bulkData: {
    backgroundColor: '#ffffff',
    titleData: textStyle,
    bodyData: textStyle,
    isZoom: false,
  },
  mainPoster: {
    version: '1',
    objects: [],
    thumbnailFileId: 'private-poster',
  },
  bgm: {
    selectedBgmId: null,
    isLoop: false,
    volume: 0.5,
    userBgmTitle: '저장된 배경음악',
    userBgmDuration: '1:00',
    userBgmFileId: 'private-audio',
  },
};
