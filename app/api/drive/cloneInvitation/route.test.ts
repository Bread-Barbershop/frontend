/**
 * @jest-environment node
 */

jest.mock('@/app/api/drive/_lib/captureDriveError', () => ({
  captureDriveError: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/googleFetch', () => ({
  googleFetch: jest.fn(),
}));
jest.mock('@/app/api/short-url/_lib/shortUrlStore', () => ({
  isShortUrlStoreConfigured: jest.fn(),
  resolveShortCode: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/audienceLinkStore', () => ({
  ...jest.requireActual('@/app/api/drive/_lib/audienceLinkStore'),
  claimAudienceLink: jest.fn(),
  commitAudienceLink: jest.fn(),
  releaseAudienceLink: jest.fn(),
}));
jest.mock('@upstash/redis', () => ({ Redis: { fromEnv: jest.fn() } }));
jest.mock('@/app/api/drive/_lib/publishPermissionWithRetry', () => ({
  publishPermissionWithRetry: jest.fn(),
}));
jest.mock('@/app/api/drive/_lib/guestReadiness', () => ({
  guestPath: (id: string) => `/guest/${id}`,
  waitUntilGuestReady: jest.fn(),
}));
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import {
  claimAudienceLink,
  releaseAudienceLink,
} from '@/app/api/drive/_lib/audienceLinkStore';
import { Redis } from '@upstash/redis';
import { waitUntilGuestReady } from '@/app/api/drive/_lib/guestReadiness';
import { publishPermissionWithRetry } from '@/app/api/drive/_lib/publishPermissionWithRetry';
import { POST as publish } from '@/app/api/drive/invitationVisibility/route';
import { POST as createAudience } from '@/app/api/drive/invitationAudiences/route';
import { GET as readShare } from '@/app/api/drive/shareUrl/route';
import {
  isShortUrlStoreConfigured,
  resolveShortCode,
} from '@/app/api/short-url/_lib/shortUrlStore';
import { BODY_BULK_DATA, TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';

import { POST } from './route';

const fetchDrive = jest.mocked(googleFetch);
const FOLDER = 'application/vnd.google-apps.folder';
const JSON_FILE = 'application/json';
const APP = 'Bread-Barbershop';
const WORKSPACE = 'my-workspace';
const SOURCE = 'source-folder';
const DATA = 'source-data-file';
const THUMBNAIL = 'source-thumbnail';
const GALLERY = 'source-gallery-photo';
const POSTER = 'source-poster-photo';
const SHARE = 'source-share-photo';
const BGM = 'source-user-bgm';
const GUEST_URL = 'https://invia.test/i/oldCode';

type Doc = {
  id: string;
  name: string;
  mimeType: string;
  parents: string[];
  ownedByMe?: boolean;
  createdTime?: string;
  appProperties?: Record<string, string>;
  body?: unknown;
};

const sourceData = {
  bulkData: {
    backgroundColor: '#ff3333',
    titleData: TITLE_BULK_DATA,
    bodyData: BODY_BULK_DATA,
    extraOption: { enabled: true },
  },
  blocks: [
    { id: 'first', component: 'gallery', props: { images: [GALLERY] } },
    {
      id: 'second',
      component: 'custom',
      props: { content: { type: 'doc', content: [{ text: '편집 문구' }] } },
    },
  ],
  bgm: {
    selectedBgmId: 'user-bgm',
    userBgmFileId: BGM,
    isLoop: true,
    volume: 0.4,
    userBgmTitle: 'BGM',
    userBgmDuration: '00:14',
  },
  mainPoster: {
    version: '7.1.0',
    thumbnailFileId: THUMBNAIL,
    objects: [{ src: `https://lh3.googleusercontent.com/d/${POSTER}?v=10` }],
  },
  shareUrl: {
    title: '카카오 제목',
    description: '카카오 본문',
    images: [SHARE],
    urlTitle: 'OG 제목',
    urlDescription: 'OG 본문',
    urlImage: [`https://drive.google.com/uc?export=download&id=${SHARE}`],
    showLocationButton: true,
    locationInfo: { lat: 37, lng: 127, placeName: '서울' },
    invitationUrl: GUEST_URL,
  },
  invitationImage: [{ id: 'local-gallery-id', file: GALLERY }],
  renderHints: { images: [`https://drive.google.com/file/d/${POSTER}/view`] },
  unknownField: {
    externalUrl: `https://example.test/d/${POSTER}`,
    value: null,
  },
};

function mockDrive({ failFirstDataDownload = false } = {}) {
  const documents = new Map<string, Doc>();
  const copies = new Map<string, Doc>();
  const deleted: string[] = [];
  let counter = 0;
  let failedAsset: string | null = null;
  let failNextCommit = false;

  function add(doc: Doc) {
    documents.set(doc.id, doc);
    return doc;
  }

  function fixture(
    id: string,
    name: string,
    mimeType: string,
    parentId: string,
    body?: unknown
  ) {
    return add({ id, name, mimeType, parents: [parentId], body });
  }

  const source = fixture(
    SOURCE,
    '결혼식 - 2026년 11월 18일 10시 30분',
    FOLDER,
    WORKSPACE
  );
  source.ownedByMe = true;
  source.appProperties = {
    app_id: APP,
    kind: 'invitation',
    inv_id: 'original-uuid',
  };
  const originalData = fixture(
    DATA,
    'data.json',
    JSON_FILE,
    SOURCE,
    sourceData
  );
  originalData.appProperties = { app_id: APP, kind: 'invitation_data_json' };
  const originalMeta = fixture(
    'original-meta',
    'meta.json',
    JSON_FILE,
    SOURCE,
    {
      published: true,
      guestUrl: GUEST_URL,
      dataJsonFileId: DATA,
      kakaoShare: {
        title: '카카오 제목',
        description: '카카오 본문',
        imageFileId: SHARE,
        showLocationButton: true,
        invitationUrl: GUEST_URL,
        locationInfo: { lat: 37, lng: 127, placeName: '서울' },
      },
    }
  );
  originalMeta.appProperties = { app_id: APP, kind: 'invitation_meta_json' };
  fixture('legacy-images', 'images', FOLDER, SOURCE);
  fixture('poster-assets', 'posters', FOLDER, 'legacy-images');
  fixture('legacy-audio', 'audio', FOLDER, SOURCE);
  fixture(GALLERY, 'gallery.webp', 'image/webp', 'legacy-images');
  fixture(POSTER, 'poster.png', 'image/png', 'poster-assets');
  fixture(SHARE, 'share.webp', 'image/webp', 'legacy-images');
  fixture(BGM, 'bgm.mp3', 'audio/mpeg', 'legacy-audio');
  fixture(THUMBNAIL, 'invitation-thumbnail.png', 'image/png', SOURCE);
  fixture(
    'unrelated-shortcut',
    'shortcut',
    'application/vnd.google-apps.shortcut',
    SOURCE
  );

  fetchDrive.mockImplementation(async (input, init) => {
    const url = new URL(input);
    const [, , , , id, action] = url.pathname.split('/');
    const fileId = url.pathname.startsWith('/upload/') ? action : id;
    const method = init?.method ?? 'GET';

    if (method === 'GET' && !fileId) {
      const q = url.searchParams.get('q') ?? '';
      if (q.includes('name=') && q.includes("'me' in owners")) {
        return Response.json({ files: [{ id: WORKSPACE }] });
      }
      const parent = q.match(/^'([^']+)' in parents/)?.[1];
      const files = [...documents.values()].filter(doc =>
        doc.parents.includes(parent ?? '')
      );
      const cloneKey = q.match(/key='clone_request' and value='([^']+)'/)?.[1];
      if (cloneKey) {
        return Response.json({
          files: files.filter(
            doc => doc.appProperties?.clone_request === cloneKey
          ),
        });
      }
      const filename = q.match(/name='([^']+)'/)?.[1];
      if (filename)
        return Response.json({
          files: files.filter(doc => doc.name === filename),
        });
      if (parent === 'legacy-images' && !url.searchParams.has('pageToken')) {
        return Response.json({
          files: files.slice(0, 1),
          nextPageToken: 'more',
        });
      }
      return Response.json({
        files: parent === 'legacy-images' ? files.slice(1) : files,
      });
    }
    if (method === 'GET' && fileId === WORKSPACE) {
      return Response.json({ permissions: [{ type: 'user' }] });
    }

    const doc = fileId ? documents.get(fileId) : undefined;
    if (method === 'GET') {
      if (!doc) return Response.json({}, { status: 404 });
      if (
        failFirstDataDownload &&
        fileId === DATA &&
        url.searchParams.has('alt')
      ) {
        failFirstDataDownload = false;
        return Response.json({}, { status: 503 });
      }
      return Response.json(url.searchParams.has('alt') ? doc.body : doc);
    }

    if (method === 'DELETE' && doc) {
      function remove(item: Doc) {
        documents.delete(item.id);
        for (const child of documents.values()) {
          if (child.parents.includes(item.id)) remove(child);
        }
      }
      deleted.push(doc.id);
      remove(doc);
      return new Response(null, { status: 204 });
    }

    const body = JSON.parse(String(init?.body));
    if (method === 'POST') {
      if (doc && action === 'copy' && doc.id === failedAsset) {
        return Response.json({}, { status: 503 });
      }
      const created = add({
        ...doc,
        ...body,
        id: `new-drive-id-${++counter}`,
        createdTime: new Date().toISOString(),
        ownedByMe: true,
      });
      if (doc && action === 'copy') copies.set(doc.id, created);
      return Response.json(created);
    }
    if (method === 'PATCH' && doc) {
      if (url.searchParams.has('uploadType')) doc.body = body;
      else {
        if (failNextCommit) {
          failNextCommit = false;
          return Response.json({}, { status: 503 });
        }
        doc.appProperties = body.appProperties;
      }
      return Response.json(doc);
    }

    throw new Error(`Unexpected Drive call: ${method} ${url}`);
  });

  return {
    documents,
    copies,
    source,
    deleted,
    setFailedAsset: (id: string | null) => {
      failedAsset = id;
    },
    setFailNextCommit: () => {
      failNextCommit = true;
    },
  };
}

function request(path: string, body: unknown) {
  return new Request(`https://invia.test/api/drive/${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function clone(requestId = 'copy-op') {
  return POST(request('cloneInvitation', { folderId: SOURCE, requestId }));
}

describe('초대장 복제 API', () => {
  const originalOrigin = process.env.NEXT_PUBLIC_APP_URL;
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'https://invia.test';
    jest.mocked(isShortUrlStoreConfigured).mockReturnValue(false);
  });
  afterAll(() => {
    if (originalOrigin === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = originalOrigin;
  });

  it('전체 저장 데이터와 에셋을 새 비공개 초대장에 연결한다', async () => {
    const { documents, copies } = mockDrive();
    const response = await clone();
    const { invite } = await response.json();

    expect(response.status).toBe(200);
    expect(invite).toMatchObject({
      name: expect.stringContaining('결혼식 (복사본)'),
      published: false,
      readiness: 'idle',
      hasKakaoShareData: true,
      guestUrl: `https://invia.test/guest/${invite.dataJsonFileId}`,
      thumbnailUrl: `/api/drive/previewAsset?kind=image&fileId=${copies.get(THUMBNAIL)?.id}&folderId=${invite.folderId}`,
    });
    expect(invite.folderId).not.toBe(SOURCE);
    expect(invite.invitationUuid).not.toBe('original-uuid');
    expect(invite.dataJsonFileId).not.toBe(DATA);
    expect(documents.get(invite.folderId)?.appProperties?.kind).toBe(
      'invitation'
    );
    expect(documents.get(DATA)?.body).toEqual(sourceData);

    expect(documents.get(invite.dataJsonFileId)?.body).toEqual({
      ...sourceData,
      blocks: [
        {
          id: 'first',
          component: 'gallery',
          props: { images: [copies.get(GALLERY)?.id] },
        },
        sourceData.blocks[1],
      ],
      bgm: { ...sourceData.bgm, userBgmFileId: copies.get(BGM)?.id },
      mainPoster: {
        ...sourceData.mainPoster,
        thumbnailFileId: copies.get(THUMBNAIL)?.id,
        objects: [
          {
            src: `https://lh3.googleusercontent.com/d/${copies.get(POSTER)?.id}?v=10`,
          },
        ],
      },
      shareUrl: {
        ...sourceData.shareUrl,
        images: [copies.get(SHARE)?.id],
        urlImage: [
          `https://drive.google.com/uc?export=download&id=${copies.get(SHARE)?.id}`,
        ],
        invitationUrl: invite.guestUrl,
      },
      invitationImage: [
        { id: 'local-gallery-id', file: copies.get(GALLERY)?.id },
      ],
      renderHints: {
        images: [
          `https://drive.google.com/file/d/${copies.get(POSTER)?.id}/view`,
        ],
      },
    });
    expect(copies.has('unrelated-shortcut')).toBe(false);
    const stageCreated = fetchDrive.mock.calls.findIndex(([, init]) =>
      String(init?.body).includes('invitation_clone_staging')
    );
    const committed = fetchDrive.mock.calls.findIndex(
      ([url, init]) => url.endsWith(invite.folderId) && init?.method === 'PATCH'
    );
    expect(committed).toBeGreaterThan(stageCreated);
    expect(committed).toBe(fetchDrive.mock.calls.length - 1);
  });

  it('원본을 삭제한 뒤에도 복제본을 새 게스트 URL로 공개하고 카카오 설정을 읽는다', async () => {
    const { copies } = mockDrive();
    const { invite } = await (await clone()).json();
    await fetchDrive(`https://www.googleapis.com/drive/v3/files/${SOURCE}`, {
      method: 'DELETE',
    });
    jest
      .mocked(publishPermissionWithRetry)
      .mockResolvedValue({ ok: true, attempt: 1 });
    jest
      .mocked(waitUntilGuestReady)
      .mockResolvedValue({ ok: true, attempt: 1 } as Awaited<
        ReturnType<typeof waitUntilGuestReady>
      >);

    const response = await publish(
      request('invitationVisibility', {
        invitationFolderId: invite.folderId,
        visible: true,
      })
    );
    expect(await response.json()).toMatchObject({
      published: true,
      guestUrl: invite.guestUrl,
    });
    expect(publishPermissionWithRetry).toHaveBeenCalledWith(invite.folderId);

    const kakao = await readShare(
      new Request(
        `https://invia.test/api/drive/shareUrl?invitationFolderId=${invite.folderId}`
      )
    );
    expect(await kakao.json()).toMatchObject({
      data: {
        title: '카카오 제목',
        description: '카카오 본문',
        imageFileId: copies.get(SHARE)?.id,
        showLocationButton: true,
        locationInfo: { lat: 37, lng: 127, placeName: '서울' },
        invitationUrl: invite.guestUrl,
      },
    });
  });

  it('기본 초대장을 복제할 때 하객 그룹과 다른 임시 하위 폴더를 복사하지 않는다', async () => {
    const { documents } = mockDrive();
    for (const kind of [
      'invitation_audience',
      'invitation_audience_staging',
      'invitation_clone_staging',
    ]) {
      documents.set(kind, {
        id: kind,
        name: `images ${kind}`,
        mimeType: FOLDER,
        parents: [SOURCE],
        appProperties: { app_id: APP, kind },
      });
    }
    expect((await clone()).status).toBe(200);
    expect(
      fetchDrive.mock.calls.some(
        ([, init]) =>
          init?.method === 'POST' &&
          String(init.body).includes('images invitation_')
      )
    ).toBe(false);
    expect(
      fetchDrive.mock.calls.some(
        ([url, init]) =>
          !init?.method &&
          /invitation_(?:audience|clone)_?/.test(
            new URL(url).searchParams.get('q') ?? ''
          )
      )
    ).toBe(false);
  });

  it('원본 다운로드 실패 시 하객 그룹 예약을 해제하고 새 요청으로 다시 생성한다', async () => {
    mockDrive({ failFirstDataDownload: true });
    jest.mocked(claimAudienceLink).mockResolvedValue({
      status: 'claimed',
      dataJsonFileId: null,
    });
    const createFamily = (requestId: string) =>
      createAudience(
        request('invitationAudiences', {
          folderId: SOURCE,
          sourceFolderId: SOURCE,
          requestId,
          name: '가족',
          slug: 'family',
        })
      );

    expect((await createFamily('first-attempt')).status).toBe(502);
    const [, reservation] = jest.mocked(claimAudienceLink).mock.calls[0];
    expect(releaseAudienceLink).toHaveBeenCalledWith(DATA, {
      slug: 'family',
      requestId: reservation.requestId,
    });
    expect((await createFamily('second-attempt')).status).toBe(200);
    expect(releaseAudienceLink).toHaveBeenCalledTimes(1);
  });

  it('기본을 가족용으로 복제한 뒤 편집된 가족용 데이터와 에셋을 친구용으로 새로 복제한다', async () => {
    const { documents, copies } = mockDrive();
    jest
      .mocked(claimAudienceLink)
      .mockResolvedValue({ status: 'claimed', dataJsonFileId: null });
    jest.mocked(resolveShortCode).mockResolvedValue(DATA);

    const familyResponse = await createAudience(
      request('invitationAudiences', {
        folderId: SOURCE,
        sourceFolderId: SOURCE,
        requestId: 'family-copy',
        name: '가족',
        slug: 'family',
      })
    );
    expect(familyResponse.status).toBe(200);
    const { group: family } = await familyResponse.json();
    const familyData = [...documents.values()].find(
      doc => doc.name === 'data.json' && doc.parents.includes(family.folderId)
    )!;
    const familyPhotoId = copies.get(GALLERY)!.id;
    familyData.body = {
      ...(familyData.body as typeof sourceData),
      bulkData: { ...sourceData.bulkData, backgroundColor: '#ff00ee' },
    };

    const friendsResponse = await createAudience(
      request('invitationAudiences', {
        folderId: family.folderId,
        sourceFolderId: family.folderId,
        requestId: 'friends-copy',
        name: '친구',
        slug: 'friends',
      })
    );
    expect(friendsResponse.status).toBe(200);
    const { group: friends } = await friendsResponse.json();
    const friendsData = [...documents.values()].find(
      doc => doc.name === 'data.json' && doc.parents.includes(friends.folderId)
    )!;

    expect(documents.get(DATA)?.body).toEqual(sourceData);
    expect(friends.folderId).not.toBe(family.folderId);
    expect(friends.invitationUuid).not.toBe(family.invitationUuid);
    expect(documents.get(friends.folderId)?.parents).toEqual([SOURCE]);
    expect(friendsData.id).not.toBe(familyData.id);
    expect(friendsData.body).toMatchObject({
      bulkData: { backgroundColor: '#ff00ee' },
      invitationImage: [{ file: copies.get(familyPhotoId)?.id }],
      shareUrl: { invitationUrl: `${GUEST_URL}?to=friends` },
    });
    expect((familyData.body as typeof sourceData).invitationImage[0].file).toBe(
      familyPhotoId
    );
    expect(copies.get(familyPhotoId)?.id).not.toBe(familyPhotoId);
  });

  it('기존 메타와 앱 속성이 없는 데이터와 에셋 폴더도 복제한다', async () => {
    const { documents, copies } = mockDrive();
    documents.delete('original-meta');
    const data = documents.get(DATA);
    if (data) data.appProperties = undefined;

    const response = await clone();
    const { invite } = await response.json();

    expect(response.status).toBe(200);
    expect(invite.hasKakaoShareData).toBe(true);
    expect(documents.get(invite.dataJsonFileId)?.appProperties?.kind).toBe(
      'invitation_data_json'
    );
    expect(
      documents.get(copies.get(BGM)?.parents[0] ?? '')?.appProperties?.kind
    ).toBe('assets_audios');
  });

  it('기존 kakao-share.json을 읽어 복제본 메타에 공유 설정을 저장한다', async () => {
    const { documents, copies } = mockDrive();
    documents.delete('original-meta');
    documents.set('legacy-kakao-share', {
      id: 'legacy-kakao-share',
      name: 'kakao-share.json',
      parents: [SOURCE],
      mimeType: JSON_FILE,
      appProperties: { app_id: APP, kind: 'kakao_share_json' },
      body: {
        title: '기존 공유 제목',
        description: '기존 공유 본문',
        showLocationButton: false,
        showShareButton: true,
        imageFileId: SHARE,
        invitationUrl: GUEST_URL,
      },
    });

    const { invite } = await (await clone()).json();
    const kakao = await readShare(
      new Request(
        `https://invia.test/api/drive/shareUrl?invitationFolderId=${invite.folderId}`
      )
    );

    expect(await kakao.json()).toMatchObject({
      data: {
        title: '기존 공유 제목',
        description: '기존 공유 본문',
        showLocationButton: false,
        showShareButton: true,
        imageFileId: copies.get(SHARE)?.id,
        invitationUrl: invite.guestUrl,
      },
    });
    expect(copies.has('legacy-kakao-share')).toBe(false);
  });

  it('같은 요청 ID 재시도는 같은 복제본을 반환한다', async () => {
    const { documents } = mockDrive();
    const first = await (await clone()).json();
    const second = await (await clone()).json();

    expect(second).toEqual(first);
    expect(
      [...documents.values()].filter(doc => doc.parents.includes(WORKSPACE))
    ).toHaveLength(2);
  });

  it('최종 폴더 반영이 실패하면 준비가 끝난 임시 복제본을 다시 사용한다', async () => {
    const { documents, setFailNextCommit } = mockDrive();
    setFailNextCommit();
    jest.mocked(isShortUrlStoreConfigured).mockReturnValue(true);
    const redisValues = new Map<string, string>();
    jest.mocked(Redis.fromEnv).mockReturnValue({
      set: async (key: string, value: string) => {
        redisValues.set(key, value);
        return 'OK';
      },
      get: async (key: string) => redisValues.get(key) ?? null,
      eval: async (_script: string, [key]: string[]) => redisValues.delete(key),
    } as unknown as Redis);

    expect((await clone()).status).toBe(502);
    const stage = [...documents.values()].find(
      doc => doc.appProperties?.kind === 'invitation_clone_staging'
    );
    expect(stage).toBeDefined();
    const copyCount = fetchDrive.mock.calls.filter(([url]) =>
      url.includes('/copy?')
    ).length;

    const retry = await clone();
    expect(retry.status).toBe(200);
    expect(await retry.json()).toMatchObject({
      invite: { folderId: stage?.id },
    });
    expect(
      fetchDrive.mock.calls.filter(([url]) => url.includes('/copy?'))
    ).toHaveLength(copyCount);
  });

  it('복사 도중 실패하면 임시 폴더를 삭제해 같은 요청을 다시 시도할 수 있다', async () => {
    const { documents, deleted, setFailedAsset } = mockDrive();
    setFailedAsset(POSTER);
    const failure = await clone();

    expect(failure.status).toBe(502);
    expect(deleted).toHaveLength(1);
    expect(
      [...documents.values()].filter(doc => doc.parents.includes(WORKSPACE))
    ).toEqual([documents.get(SOURCE)]);

    setFailedAsset(null);
    expect((await clone()).status).toBe(200);
  });

  it.each(['다른 작업공간', '공유받은 초대장'])(
    '%s의 폴더를 복제하지 않는다',
    async reason => {
      const { source } = mockDrive();
      if (reason === '다른 작업공간') source.parents = ['another-workspace'];
      else source.ownedByMe = false;

      expect((await clone()).status).toBe(404);
      expect(fetchDrive.mock.calls.every(([, init]) => !init?.method)).toBe(
        true
      );
    }
  );

  it('로그인하지 않은 사용자의 복제 요청을 거부한다', async () => {
    fetchDrive.mockRejectedValue(new Error('유효한 요청이 아닙니다.'));

    expect((await clone()).status).toBe(401);
  });

  it('공개할 수 없는 형식의 저장 데이터는 임시 폴더를 만들기 전에 거부한다', async () => {
    const { documents } = mockDrive();
    const data = documents.get(DATA);
    if (data) data.body = {};

    expect((await clone()).status).toBe(422);
    expect(fetchDrive.mock.calls.every(([, init]) => !init?.method)).toBe(true);
  });

  it('요청 ID가 없으면 Drive를 호출하기 전에 거부한다', async () => {
    const invalid = await POST(
      request('cloneInvitation', { folderId: SOURCE })
    );

    expect(invalid.status).toBe(400);
    expect(fetchDrive).not.toHaveBeenCalled();
  });
});
