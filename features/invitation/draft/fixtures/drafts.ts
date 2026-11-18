import type { LocalDraft } from '../localDraftStore';

export function draftFixture(
  owner = 'account-a',
  path = '/editor'
): LocalDraft {
  return {
    id: `${owner}:${path}`,
    owner,
    path,
    modifiedAt: Date.now(),
    payload: { text: '초대합니다' },
  };
}
