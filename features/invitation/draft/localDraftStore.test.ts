/** @jest-environment node */
import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';

import { draftFixture } from './fixtures/drafts';
import {
  clearAccountDrafts,
  DRAFT_MAX_AGE_MS,
  readLocalDraft,
  writeLocalDraft,
} from './localDraftStore';

describe('계정별 로컬 초안', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'indexedDB', {
      value: new IDBFactory(),
      configurable: true,
    });
    Object.defineProperty(globalThis, 'IDBKeyRange', {
      value: IDBKeyRange,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'window', {
      value: { dispatchEvent: jest.fn() },
      configurable: true,
    });
  });
  afterEach(() => jest.restoreAllMocks());
  it('같은 계정과 경로만 복구하며 다른 계정 초안은 반환하지 않는다', async () => {
    await writeLocalDraft(draftFixture(), 0);
    expect(
      (await readLocalDraft('account-a', '/editor')).draft?.payload
    ).toEqual(draftFixture().payload);
    expect((await readLocalDraft('account-b', '/editor')).draft).toBeNull();
  });
  it('조회는 보관 기한을 연장하지 않고 마지막 수정 후 7일이면 정리한다', async () => {
    const draft = draftFixture();
    await writeLocalDraft(draft, 0);
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(draft.modifiedAt + DRAFT_MAX_AGE_MS - 1);
    expect(
      (await readLocalDraft(draft.owner, draft.path)).draft?.modifiedAt
    ).toBe(draft.modifiedAt);
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(draft.modifiedAt + DRAFT_MAX_AGE_MS);
    expect((await readLocalDraft(draft.owner, draft.path)).draft).toBeNull();
  });
  it('로그아웃은 해당 계정만 삭제하며 이전 탭의 진행 중인 저장도 거절한다', async () => {
    await writeLocalDraft(draftFixture(), 0);
    await writeLocalDraft(draftFixture('account-b'), 0);
    await clearAccountDrafts('account-a');
    expect(await writeLocalDraft(draftFixture(), 0)).toBe(false);
    expect((await readLocalDraft('account-a', '/editor')).draft).toBeNull();
    expect((await readLocalDraft('account-b', '/editor')).draft).not.toBeNull();
    const { epoch } = await readLocalDraft('account-a', '/editor');
    expect(await writeLocalDraft(draftFixture(), epoch)).toBe(true);
  });
});
