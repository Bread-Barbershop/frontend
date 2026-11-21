import type { AudienceGroup } from '@/features/invitation/audiences/model';

import { privateInvite } from './invitationPreview';

export const shareInvite = {
  ...privateInvite,
  displayTitle: '민서·지훈 결혼식',
  guestUrl: '/guest/saved-root',
};

export const baseGroup: AudienceGroup = {
  folderId: shareInvite.folderId,
  invitationUuid: 'root-uuid',
  slug: '',
  name: '기본',
};
export const workGroup: AudienceGroup = {
  folderId: 'work-folder',
  invitationUuid: 'aud_work',
  slug: 'work',
  name: '직장용',
};
export const familyGroup: AudienceGroup = {
  folderId: 'family-folder',
  invitationUuid: 'aud_family',
  slug: 'family',
  name: '가족용',
};

export const workKakaoCard = {
  title: '함께 일하는 동료분들을 초대합니다',
  description: '예식 후 동료들과 식사해요.',
  imageFileId: 'work-photo',
  invitationUrl: 'https://invia.example/i/wedding?to=work',
  showLocationButton: false,
};

export const baseKakaoCard = {
  title: '민서·지훈 결혼합니다',
  description: '축하해 주세요.',
  imageFileId: 'base-photo',
  invitationUrl: 'https://invia.example/i/wedding',
  showLocationButton: false,
};
export function shareAudienceResponse(groups: AudienceGroup[]) {
  return {
    ok: true,
    json: async () => ({ groups, rootGuestUrl: '/i/wedding', activeSlug: '' }),
  };
}
