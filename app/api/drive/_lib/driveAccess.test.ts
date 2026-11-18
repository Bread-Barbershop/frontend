/** @jest-environment node */
jest.mock('server-only', () => ({}));
jest.mock('./googleFetch', () => ({ googleFetch: jest.fn() }));
jest.mock('./findWorkspaceFolderId', () => ({
  findWorkspaceFolderId: jest.fn(async () => 'workspace'),
}));

import {
  assertDeletableFileAccess,
  assertInvitationAccess,
  assertManagedFileAccess,
  assertSameOriginRequest,
} from './driveAccess';
import { managedDriveFixture } from './fixtures/security';
import { googleFetch } from './googleFetch';

describe('Drive 리소스 경계', () => {
  let files: ReturnType<typeof managedDriveFixture>;
  beforeEach(() => {
    files = managedDriveFixture();
    jest.mocked(googleFetch).mockImplementation(async url => {
      const id = new URL(url).pathname.split('/').pop()!;
      return new Response(JSON.stringify(files[id] ?? {}), {
        status: files[id] ? 200 : 404,
      });
    });
  });
  it('내 워크스페이스의 표시된 초대장과 이미지에만 접근한다', async () => {
    await expect(assertInvitationAccess('invitation')).resolves.toMatchObject({
      id: 'invitation',
    });
    await expect(assertDeletableFileAccess('photo')).resolves.toMatchObject({
      invitationFolderId: 'invitation',
    });
  });
  it('파일 이름이 같아도 외부 파일과 역할 표시 없는 폴더는 거절한다', async () => {
    await expect(assertManagedFileAccess('unrelated')).rejects.toMatchObject({
      status: 403,
    });
    await expect(assertInvitationAccess('impersonator')).rejects.toMatchObject({
      status: 403,
    });
  });
  it('다른 소유자의 파일과 다른 초대장에 속한 파일을 거절한다', async () => {
    files.photo.ownedByMe = false;
    await expect(assertManagedFileAccess('photo')).rejects.toMatchObject({
      status: 403,
    });
    files.photo.ownedByMe = true;
    await expect(
      assertManagedFileAccess('photo', 'other-invitation')
    ).rejects.toMatchObject({ status: 403 });
  });
  it('삭제된 파일과 순환하는 부모 체인을 거절한다', async () => {
    files.photo.trashed = true;
    await expect(assertManagedFileAccess('photo')).rejects.toMatchObject({
      status: 403,
    });
    files.photo.trashed = false;
    files.images.parents = ['photo'];
    await expect(assertManagedFileAccess('photo')).rejects.toMatchObject({
      status: 403,
    });
  });
  it('조작된 ID는 Google을 호출하기 전에 차단한다', async () => {
    jest.mocked(googleFetch).mockClear();
    await expect(
      assertManagedFileAccess("x' or trashed=false")
    ).rejects.toMatchObject({ status: 400 });
    expect(googleFetch).not.toHaveBeenCalled();
  });
  it('외부 사이트의 변경 요청을 거절한다', () => {
    expect(() =>
      assertSameOriginRequest(
        new Request('https://invia.test/api', {
          headers: { origin: 'https://other.test' },
        })
      )
    ).toThrow();
  });
});
