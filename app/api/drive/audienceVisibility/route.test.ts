/** @jest-environment node */
import type { AudienceVisibility } from '@/features/invitation/audiences/visibility';
import { GET, PUT } from './route';
import {
  readAudienceVisibility,
  writeAudienceVisibility,
} from '../_lib/audienceLinkStore';
import {
  assertWorkspacePrivate,
  commitCloneFile,
  listCloneFiles,
  loadCloneJson,
  type CloneDriveFile,
  DRIVE_FOLDER_MIME,
} from '../_lib/cloneDriveFiles';
import { readRootInvitationFiles } from '../_lib/invitationAudiences';
import {
  assertInvitationFolderAccess,
  PreviewAccessError,
} from '../_lib/previewAccess';
import { applyAudienceVisibility } from '../_lib/audienceVisibility';
import { publishPermissionWithRetry } from '../_lib/publishPermissionWithRetry';
import { revokePublicPermissionWithRetry } from '../_lib/revokePublicPermissionWithRetry';

jest.mock('../_lib/audienceLinkStore');
jest.mock('../_lib/invitationAudiences');
jest.mock('../_lib/previewAccess', () => ({
  ...jest.requireActual('../_lib/previewAccess'),
  assertInvitationFolderAccess: jest.fn(),
}));
jest.mock('../_lib/publishPermissionWithRetry');
jest.mock('../_lib/revokePublicPermissionWithRetry');
jest.mock('../_lib/ensureInvitationMetaFile', () => ({
  ...jest.requireActual('../_lib/ensureInvitationMetaFile'),
  upsertInvitationMeta: jest.fn(),
}));
jest.mock('../_lib/cloneDriveFiles', () => ({
  ...jest.requireActual('../_lib/cloneDriveFiles'),
  listCloneFiles: jest.fn(),
  loadCloneJson: jest.fn(),
  commitCloneFile: jest.fn(),
  assertWorkspacePrivate: jest.fn(),
}));

const endpoint = 'https://invia.test/api/drive/audienceVisibility';
function file(
  id: string,
  name: string,
  mimeType: string,
  appProperties?: Record<string, string>
): CloneDriveFile {
  return {
    id,
    name,
    mimeType,
    appProperties,
    ownedByMe: true,
    parents: ['root'],
    createdTime: '2026-01-01',
  };
}
const base = file('data', 'data.json', 'application/json');
const assets = [
  file('photos', 'images', DRIVE_FOLDER_MIME, {
    app_id: 'Bread-Barbershop',
    kind: 'assets_images',
  }),
  file('audio', 'audios', DRIVE_FOLDER_MIME, {
    app_id: 'Bread-Barbershop',
    kind: 'assets_audios',
  }),
  file('poster', 'invitation-thumbnail.webp', 'image/webp', {
    app_id: 'Bread-Barbershop',
    kind: 'invitation_thumbnail_png',
  }),
];
const groups = ['family', 'work'].map(slug =>
  file(slug, slug, DRIVE_FOLDER_MIME, {
    app_id: 'Bread-Barbershop',
    kind: 'invitation_audience',
    audience_root: 'root',
    audience_slug: slug,
    audience_name: slug,
    inv_id: 'aud_' + slug,
  })
);
const files = [
  base,
  ...assets,
  ...groups,
  file('unrelated', 'personal', DRIVE_FOLDER_MIME),
  file('old-folder', 'images', DRIVE_FOLDER_MIME),
  file('unrelated-photo', 'personal.jpg', 'image/jpeg'),
  file('stage', 'images', DRIVE_FOLDER_MIME, {
    kind: 'invitation_audience_staging',
  }),
];
const get = async () =>
  (await GET(new Request(endpoint + '?folderId=root'))).json();
const put = (published: boolean, publicSlugs: string[], revision: string) =>
  PUT(
    new Request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({
        folderId: 'root',
        published,
        publicSlugs,
        revision,
      }),
    })
  );
let grants: Set<string>;
beforeEach(() => {
  jest.clearAllMocks();
  grants = new Set(['root']);
  const props: Record<string, string> = {};
  let stored: AudienceVisibility | null = null;
  jest.mocked(assertInvitationFolderAccess).mockResolvedValue({
    workspaceFolderId: 'space',
    rootFolderId: 'root',
    rootInvitationUuid: 'uuid',
    audience: null,
    appProperties: props,
  });
  jest.mocked(readRootInvitationFiles).mockResolvedValue({
    files,
    dataFile: base,
    meta: {
      version: 1,
      published: true,
      dataJsonFileId: 'data',
      guestUrl: '/i/example',
      kakaoShare: null,
      updatedAt: 'start',
    },
  });
  const legacy = file('legacy-cover', 'cover.jpg', 'image/jpeg', {});
  jest
    .mocked(listCloneFiles)
    .mockImplementation(async id => (id === 'root' ? files : [legacy]));
  jest
    .mocked(loadCloneJson)
    .mockResolvedValue({
      cover: 'https://lh3.googleusercontent.com/d/legacy-cover',
    });
  jest.mocked(commitCloneFile).mockImplementation(async (id, changes) => {
    Object.assign(id === 'root' ? props : legacy.appProperties!, changes);
  });
  jest.mocked(readAudienceVisibility).mockImplementation(async () => stored);
  jest
    .mocked(writeAudienceVisibility)
    .mockImplementation(async (_id, settings) => {
      stored = settings;
    });
  jest.mocked(publishPermissionWithRetry).mockImplementation(async id => {
    grants.add(id);
    return { ok: true, attempt: 1 };
  });
  jest.mocked(revokePublicPermissionWithRetry).mockImplementation(async id => {
    grants.delete(id);
    return { ok: true, attempt: 1 };
  });
});

it('기본과 직장용을 끄면 행사 폴더와 기본 미디어는 비공개이고 가족용만 공개된다', async () => {
  const { visibility } = await get();
  expect(visibility.publicSlugs).toEqual(['', 'family', 'work']);
  const response = await put(true, ['family'], visibility.revision);
  expect(response.status).toBe(200);
  expect(assertInvitationFolderAccess).toHaveBeenCalledWith('root', {
    ownedOnly: true,
    allowAudience: false,
  });
  expect(assertWorkspacePrivate).toHaveBeenCalledWith('space');
  expect(grants).toEqual(new Set(['family']));
  expect(publishPermissionWithRetry).not.toHaveBeenCalledWith('unrelated');
  expect(await get()).toMatchObject({
    visibility: { published: true, publicSlugs: ['family'], pending: false },
  });
  expect((await put(true, ['work'], visibility.revision)).status).toBe(409);
  expect(grants).toEqual(new Set(['family']));
});

it('전체를 껐다 켜도 기존 기본·가족용의 공개 선택을 복원하고 직장용은 닫힌다', async () => {
  const selected = ['', 'family'];
  const first = await (await put(true, selected, 'start')).json();
  const off = await (
    await put(false, selected, first.visibility.revision)
  ).json();
  expect(grants.size).toBe(0);
  expect(off.visibility.publicSlugs).toEqual(selected);
  expect((await put(true, selected, off.visibility.revision)).status).toBe(200);
  expect(grants).toEqual(
    new Set(['data', 'photos', 'audio', 'poster', 'family', 'legacy-cover'])
  );
});

it('권한 회수가 실패하면 새 공개 권한을 부여하지 않고 최신 설정으로 다시 적용할 수 있다', async () => {
  jest
    .mocked(revokePublicPermissionWithRetry)
    .mockResolvedValueOnce({ ok: false, attempt: 1, status: 503 });
  expect((await put(true, ['work'], 'start')).status).toBe(503);
  expect(publishPermissionWithRetry).not.toHaveBeenCalled();
  const { visibility } = await get();
  expect(visibility.pending).toBe(true);
  expect((await put(true, ['work'], visibility.revision)).status).toBe(200);
  expect(grants).toEqual(new Set(['work']));
});

it('다른 행사의 그룹 이름과 빈 공개 범위는 권한을 바꾸기 전에 거부한다', async () => {
  expect((await put(true, ['other'], 'start')).status).toBe(409);
  expect((await put(true, [], 'start')).status).toBe(400);
  expect(publishPermissionWithRetry).not.toHaveBeenCalled();
  expect(revokePublicPermissionWithRetry).not.toHaveBeenCalled();
});

it('가족용만 공개한 후 기본 초대장을 다시 저장해도 권한과 리비전이 유지된다', async () => {
  const previous = await (await put(true, ['family'], 'start')).json();
  jest.mocked(writeAudienceVisibility).mockClear();
  const result = await applyAudienceVisibility('root', true, undefined, true);
  expect(result.visibility).toEqual(previous.visibility);
  expect(writeAudienceVisibility).not.toHaveBeenCalled();
  expect(grants).toEqual(new Set(['family']));
});

it('소유하지 않은 폴더의 공개 설정은 변경할 수 없다', async () => {
  jest.mocked(assertInvitationFolderAccess).mockRejectedValueOnce(
    new PreviewAccessError({
      status: 404,
      code: 'INVITATION_NOT_FOUND',
      userMessage: '초대장을 찾을 수 없습니다.',
      message: 'not owned',
    })
  );
  expect((await put(true, [''], 'start')).status).toBe(404);
  expect(writeAudienceVisibility).not.toHaveBeenCalled();
});
