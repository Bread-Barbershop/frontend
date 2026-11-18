import type { AudienceGroup } from '@/features/invitation/audiences/model';

export const basicAudience: AudienceGroup = {
  name: '기본',
  slug: '',
  folderId: 'root-folder',
  invitationUuid: 'root-uuid',
};

export const familyAudience: AudienceGroup = {
  name: '가족',
  slug: 'family',
  folderId: 'family-folder',
  invitationUuid: 'aud_family-uuid',
};

export const friendsAudience: AudienceGroup = {
  name: '친구',
  slug: 'friends',
  folderId: 'friends-folder',
  invitationUuid: 'aud_friends-uuid',
};

export const rootGuestUrl = '/i/abc123';

export const savedBasicInvitation = {
  invitationFolderId: basicAudience.folderId,
  invitationUuid: basicAudience.invitationUuid,
  dataJsonFileId: 'root-data',
  guestUrl: rootGuestUrl,
  createdAt: '2026-11-18T00:00:00.000Z',
};
