/**
 * @jest-environment node
 */

jest.mock('@/app/api/drive/_lib/googleFetch', () => ({
  googleFetch: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/captureDriveError', () => ({
  captureDriveError: jest.fn(),
}));
jest.mock('@/app/api/short-url/_lib/shortUrlStore', () => ({
  resolveShortCode: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/cloneInvitation', () => ({
  ...jest.requireActual('@/app/api/drive/_lib/cloneInvitation'),
  cloneOwnedInvitation: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/audienceLinkStore', () => ({
  ...jest.requireActual('@/app/api/drive/_lib/audienceLinkStore'),
  claimAudienceLink: jest.fn(),
  commitAudienceLink: jest.fn(),
  releaseAudienceLink: jest.fn(),
  resolveAudienceLink: jest.fn(),
}));

import {
  AudienceLinkStoreUnavailableError,
  claimAudienceLink,
  commitAudienceLink,
  resolveAudienceLink,
} from '@/app/api/drive/_lib/audienceLinkStore';
import { cloneOwnedInvitation } from '@/app/api/drive/_lib/cloneInvitation';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import { resolveShortCode } from '@/app/api/short-url/_lib/shortUrlStore';

import { GET, POST } from './route';

const APP = 'Bread-Barbershop';
const FOLDER = 'application/vnd.google-apps.folder';
const BASE_URL = 'https://invia.test';
const ROOT = 'root-folder';
const ROOT_DATA = 'root-data-file';
const GROUP = 'group-folder';
const GROUP_DATA = 'group-data-file';
const EXAMPLE = {
  name: 'Family',
  slug: 'family',
  folderId: GROUP,
  invitationUuid: 'aud_family',
};

function driveFixture() {
  const root = {
    id: ROOT,
    name: 'Root invitation',
    mimeType: FOLDER,
    ownedByMe: true,
    parents: ['workspace-folder'],
    appProperties: { app_id: APP, kind: 'invitation', inv_id: 'root-uuid' },
  };
  const group = {
    id: GROUP,
    name: EXAMPLE.name,
    mimeType: FOLDER,
    ownedByMe: true,
    parents: [ROOT],
    createdTime: '2026-11-17T00:00:00Z',
    appProperties: {
      app_id: APP,
      kind: 'invitation_audience',
      audience_root: ROOT,
      audience_slug: EXAMPLE.slug,
      audience_name: EXAMPLE.name,
      inv_id: EXAMPLE.invitationUuid,
      clone_request: 'persisted-request-key',
    },
  };
  const rootData = {
    id: ROOT_DATA,
    name: 'data.json',
    mimeType: 'application/json',
  };
  const rootMeta = {
    id: 'root-meta-file',
    name: 'meta.json',
    mimeType: 'application/json',
  };
  const fixture = {
    root,
    group,
    rootMetaUrl: null as string | null,
    hasGroup: false,
    foreignSource: null as string | null,
  };

  jest.mocked(googleFetch).mockImplementation(async (href, init) => {
    const url = new URL(href);
    const q = url.searchParams.get('q') ?? '';
    const id = url.pathname.split('/')[4];
    if (init?.method === 'DELETE' && id === GROUP) {
      fixture.hasGroup = false;
      return new Response(null, { status: 204 });
    }
    if (q.startsWith("name='모바일 초대장 invia'")) {
      return Response.json({ files: [{ id: 'workspace-folder' }] });
    }
    if (q.startsWith(`'${ROOT}' in parents`)) {
      return Response.json({
        files: [
          rootData,
          ...(fixture.rootMetaUrl ? [rootMeta] : []),
          ...(fixture.hasGroup ? [group] : []),
        ],
      });
    }
    if (q.startsWith(`'${GROUP}' in parents`)) {
      return Response.json({ files: [{ ...rootData, id: GROUP_DATA }] });
    }
    if (id === ROOT) return Response.json(root);
    if (id === GROUP && fixture.hasGroup) return Response.json(group);
    if (id === rootMeta.id) {
      return Response.json({
        guestUrl: fixture.rootMetaUrl,
        dataJsonFileId: ROOT_DATA,
        published: true,
      });
    }
    if (id && id === fixture.foreignSource) {
      return Response.json({
        ...root,
        id,
        appProperties: { ...root.appProperties, inv_id: 'foreign-uuid' },
      });
    }
    return Response.json({}, { status: 404 });
  });

  return fixture;
}

function load(folderId = ROOT, view = '') {
  return GET(
    new Request(
      `${BASE_URL}/api/drive/invitationAudiences?folderId=${folderId}&view=${view}`
    )
  );
}

function create(overrides: Record<string, unknown> = {}) {
  return POST(
    new Request(`${BASE_URL}/api/drive/invitationAudiences`, {
      method: 'POST',
      body: JSON.stringify({
        folderId: ROOT,
        sourceFolderId: ROOT,
        requestId: 'copy-op',
        name: EXAMPLE.name,
        slug: EXAMPLE.slug,
        ...overrides,
      }),
    })
  );
}

describe('하객 그룹 API', () => {
  const originalOrigin = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = BASE_URL;
    jest
      .mocked(claimAudienceLink)
      .mockResolvedValue({ status: 'claimed', dataJsonFileId: null });
    jest.mocked(resolveAudienceLink).mockResolvedValue(null);
    jest.mocked(cloneOwnedInvitation).mockResolvedValue({
      folderId: GROUP,
      invitationUuid: EXAMPLE.invitationUuid,
      dataJsonFileId: GROUP_DATA,
      name: EXAMPLE.name,
      published: false,
      readiness: 'idle',
    });
  });

  it('마이페이지에서는 공유 링크를 조회하거나 복구하지 않고 소유한 하객 그룹을 반환한다', async () => {
    const fixture = driveFixture();
    fixture.hasGroup = true;
    expect(await (await load(ROOT, 'editor-options')).json()).toEqual({
      audiences: [EXAMPLE],
    });
    fixture.group.ownedByMe = false;
    expect(await (await load(ROOT, 'editor-options')).json()).toEqual({
      audiences: [],
    });
    fixture.group.ownedByMe = true;
    fixture.group.appProperties.kind = 'invitation_audience_staging';
    expect(await (await load(ROOT, 'editor-options')).json()).toEqual({
      audiences: [],
    });
    fixture.root.ownedByMe = false;
    expect((await load(ROOT, 'editor-options')).status).toBe(404);
    expect(resolveAudienceLink).not.toHaveBeenCalled();
    expect(claimAudienceLink).not.toHaveBeenCalled();
  });

  afterAll(() => {
    if (originalOrigin === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = originalOrigin;
  });

  it('미리보기는 본인 그룹만 나열하고 읽기 가능한 공유 초대장은 기본 본문만 열 수 있다', async () => {
    const fixture = driveFixture();
    fixture.hasGroup = true;
    expect(await (await load(ROOT, 'preview-options')).json()).toEqual({
      audiences: [EXAMPLE],
    });
    fixture.group.ownedByMe = false;
    expect(await (await load(ROOT, 'preview-options')).json()).toEqual({
      audiences: [],
    });
    fixture.group.ownedByMe = true;
    fixture.root.ownedByMe = false;
    expect(await (await load(ROOT, 'preview-options')).json()).toEqual({
      audiences: [],
    });
    fixture.root.parents = ['different-workspace'];
    expect((await load(ROOT, 'preview-options')).status).toBe(404);
    expect(resolveAudienceLink).not.toHaveBeenCalled();
  });

  it('메타파일 없는 기존 초대장에 기본 대상과 대표 링크를 반환한다', async () => {
    const fixture = driveFixture();
    fixture.hasGroup = true;
    fixture.group.appProperties.kind = 'invitation_audience_staging';
    expect(await (await load()).json()).toEqual({
      rootGuestUrl: `${BASE_URL}/guest/${ROOT_DATA}`,
      activeSlug: '',
      groups: [
        { name: '기본', slug: '', folderId: ROOT, invitationUuid: 'root-uuid' },
      ],
    });
    expect(resolveAudienceLink).not.toHaveBeenCalled();
  });

  it('검증된 원본 하위에 복제하고 대표 짧은 주소로 하객 링크를 만든다', async () => {
    const fixture = driveFixture();
    fixture.rootMetaUrl = '/i/validCode';
    jest.mocked(resolveShortCode).mockResolvedValue(ROOT_DATA);
    fixture.hasGroup = true;
    fixture.group.appProperties.audience_slug = 'friends';
    fixture.group.appProperties.audience_name = '친구';

    const response = await create({ folderId: GROUP, sourceFolderId: GROUP });
    expect(await response.json()).toEqual({
      group: EXAMPLE,
      rootGuestUrl: `${BASE_URL}/i/validCode`,
    });
    const copy = jest.mocked(cloneOwnedInvitation).mock.calls[0][0];
    expect(copy).toMatchObject({
      sourceFolderId: GROUP,
      parentId: ROOT,
      destinationKind: 'invitation_audience',
      stagingKind: 'invitation_audience_staging',
      folderProperties: {
        audience_root: ROOT,
        audience_name: EXAMPLE.name,
        audience_slug: EXAMPLE.slug,
      },
    });
    expect(copy.createGuestUrl(GROUP_DATA)).toBe(
      `${BASE_URL}/i/validCode?to=family`
    );
    expect(commitAudienceLink).toHaveBeenCalledWith(ROOT_DATA, {
      slug: EXAMPLE.slug,
      requestId: copy.requestKey,
      dataJsonFileId: GROUP_DATA,
    });
  });

  it.each([
    ['https://foreign.test/i/validCode', ROOT_DATA],
    ['/i/validCode', 'another-data-id'],
    ['/i/abc', ROOT_DATA],
  ])(
    '유효하지 않은 대표 짧은 주소 %s는 원본 data.json 주소로 대체한다',
    async (url, shortTarget) => {
      const fixture = driveFixture();
      fixture.rootMetaUrl = url;
      jest.mocked(resolveShortCode).mockResolvedValue(shortTarget);

      expect(await (await load()).json()).toMatchObject({
        rootGuestUrl: `${BASE_URL}/guest/${ROOT_DATA}`,
      });
    }
  );

  it('조회 가능한 다른 초대장과 공유받은 원본을 복제하거나 조회하지 않는다', async () => {
    const fixture = driveFixture();
    fixture.foreignSource = 'foreign-source';
    expect(
      (await create({ sourceFolderId: fixture.foreignSource })).status
    ).toBe(404);

    fixture.root.ownedByMe = false;
    expect((await load()).status).toBe(404);
    expect(claimAudienceLink).not.toHaveBeenCalled();
    expect(cloneOwnedInvitation).not.toHaveBeenCalled();
  });

  it('이미 같은 이름인 Drive 그룹이 있으면 공개 인덱스가 없어도 추가하지 않는다', async () => {
    const fixture = driveFixture();
    fixture.hasGroup = true;
    const response = await create({ name: 'family', slug: 'other' });
    expect(response.status).toBe(409);
    expect(claimAudienceLink).not.toHaveBeenCalled();
    expect(cloneOwnedInvitation).not.toHaveBeenCalled();
  });

  it('다른 요청이 링크 이름을 먼저 예약하면 새 폴더를 만들지 않는다', async () => {
    driveFixture();
    jest
      .mocked(claimAudienceLink)
      .mockResolvedValue({ status: 'duplicate-slug' });
    expect((await create()).status).toBe(409);
    expect(cloneOwnedInvitation).not.toHaveBeenCalled();
  });

  it('만료된 다른 요청의 임시 폴더를 정리한 뒤 새 요청을 진행한다', async () => {
    const fixture = driveFixture();
    fixture.hasGroup = true;
    fixture.group.appProperties.kind = 'invitation_audience_staging';

    expect((await create()).status).toBe(200);
    expect(googleFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/files/${GROUP}`),
      expect.objectContaining({ method: 'DELETE' })
    );
    expect(fixture.hasGroup).toBe(false);
  });

  it('링크 저장에 실패한 완료 그룹을 재진입 시 Drive 기록으로 복구한다', async () => {
    const fixture = driveFixture();
    jest
      .mocked(commitAudienceLink)
      .mockRejectedValueOnce(new AudienceLinkStoreUnavailableError());
    expect((await create()).status).toBe(503);

    fixture.hasGroup = true;
    const response = await load(GROUP);

    expect(await response.json()).toMatchObject({
      activeSlug: EXAMPLE.slug,
      groups: [expect.anything(), EXAMPLE],
    });
    expect(commitAudienceLink).toHaveBeenLastCalledWith(ROOT_DATA, {
      slug: EXAMPLE.slug,
      requestId: fixture.group.appProperties.clone_request,
      dataJsonFileId: GROUP_DATA,
    });
    expect(cloneOwnedInvitation).toHaveBeenCalledTimes(1);
  });
});
