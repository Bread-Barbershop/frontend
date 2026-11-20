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
export function shareAudienceResponse(groups: AudienceGroup[]) {
  return {
    ok: true,
    json: async () => ({ groups, rootGuestUrl: '/i/wedding', activeSlug: '' }),
  };
}
