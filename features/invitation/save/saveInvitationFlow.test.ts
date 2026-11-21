/**
 * @jest-environment jsdom
 */

jest.mock('./updateFileToDrive', () => ({
  updateFileToDrive: jest.fn(),
}));
jest.mock('./uploadFileToDrive');

jest.mock('@sentry/nextjs', () => ({
  withScope: jest.fn((callback: CallableFunction) =>
    callback({
      setTag: jest.fn(),
      setContext: jest.fn(),
    })
  ),
  captureException: jest.fn(),
}));

import { saveInvitationFlow } from './saveInvitationFlow';
import { createHash, webcrypto } from 'node:crypto';
import { updateFileToDrive } from './updateFileToDrive';
import { uploadFileToDrive } from './uploadFileToDrive';
import * as Sentry from '@sentry/nextjs';
import type { BulkJson } from '@/shared/types/invitationSave';
import {
  readSponsorEntries,
  serializeSponsorEntries,
} from '@/components/organisms/sponsorshipInfomation/sponsorEntries';

const mockFetch = jest.fn();

const bulkData: BulkJson = {
  backgroundColor: '#ffffff',
  titleData: {
    font: 'font-lineseed',
    fontSize: '20px',
    fontWeight: '700',
    color: '#111111',
    isDefault: false,
  },
  bodyData: {
    font: 'font-lineseed',
    fontSize: '16px',
    fontWeight: '500',
    color: '#222222',
    isDefault: false,
  },
  isZoom: false,
  scrollAnimation: { animationType: 'fade-up', triggerMode: 'down-only', animationDurationMs: 700, animationEasing: 'natural' },
};

const shareUrl = {
  title: '초대장',
  description: '초대합니다',
  images: [],
  urlTitle: '초대장',
  urlDescription: '초대합니다',
  urlImage: [],
  showLocationButton: false,
  locationInfo: {
    lat: 0,
    lng: 0,
    placeName: '',
  },
};

const bgmData = {
  selectedBgmId: null,
  isLoop: false,
  volume: 0.2,
  userBgmTitle: null,
  userBgmDuration: null,
  userBgmFileId: null,
};

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: jest.fn().mockResolvedValue(body),
  };
}

describe('saveInvitationFlow', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (Sentry.withScope as jest.Mock).mockImplementation(
      (callback: CallableFunction) =>
        callback({
          setTag: jest.fn(),
          setContext: jest.fn(),
        })
    );
    global.fetch = mockFetch as unknown as typeof fetch;
    (updateFileToDrive as jest.Mock).mockResolvedValue({
      fileId: 'data-json-file-id',
      name: 'data.json',
    });

    mockFetch.mockImplementation((input: unknown) => {
      const url = String(input);

      if (url === '/api/drive/saveInvitation') {
        return Promise.resolve(
          jsonResponse({
            workspaceFolderId: 'workspace-folder-id',
            invitationFolderId: 'invitation-folder-id',
            invitationUuid: 'invitation-uuid',
            dataJsonFileId: 'data-json-file-id',
            imageFolderId: 'image-folder-id',
            audioFolderId: 'audio-folder-id',
            accessToken: 'access-token',
            expiresAt: Date.now() + 600_000,
          })
        );
      }

      if (url === '/api/drive/shareUrl') {
        return Promise.resolve(
          jsonResponse({
            ok: true,
            guestUrl: '/i/aB7kQ2x',
            data: {
              ...shareUrl,
              invitationUrl: '/i/aB7kQ2x',
            },
          })
        );
      }

      if (url === '/api/drive/thumbnail') {
        return Promise.resolve(
          jsonResponse({ ok: false, error: 'Drive upload failed' }, {
            ok: false,
            status: 503,
          })
        );
      }

      if (url === '/api/drive/invitationVisibility') {
        return Promise.resolve(
          jsonResponse({
            ok: true,
            published: true,
            ready: true,
            guestUrl: '/i/aB7kQ2x',
            dataJsonFileId: 'data-json-file-id',
          })
        );
      }

      throw new Error(`unexpected fetch: ${url}`);
    });
  });

  it('shareUrl API가 돌려준 짧은 URL을 최종 guestUrl로 사용한다', async () => {
    const onProgress = jest.fn();
    const result = await saveInvitationFlow({
      onProgress,
      bulkData,
      images: [],
      audio: null,
      data: [],
      shareUrl,
      bgmData,
      mainPoster: {
        version: '7.1.0',
        objects: [],
      },
      invitationThumbnail: {
        name: 'invitation-thumbnail.png',
        mimeType: 'image/png',
        dataUrl: '',
        width: 0,
        height: 0,
        createdAt: '',
      },
    });

    expect(result.success).toBe(true);
    expect(result.guestUrl).toBe('http://localhost/i/aB7kQ2x');
    expect(onProgress.mock.calls.map(([step]) => step)).not.toContain('loadingPhotos');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/drive/shareUrl',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('공지사항만 수정하면 같은 표지를 재사용하고 표지가 바뀌면 새 이미지를 보낸다', async () => {
    const originalSubtle = Object.getOwnPropertyDescriptor(crypto, 'subtle');
    Object.defineProperty(crypto, 'subtle', {
      configurable: true,
      value: webcrypto.subtle,
    });
    const defaultFetch = mockFetch.getMockImplementation()!;
    const uploads: string[] = [];
    let metadataAvailable = true;
    let savedChecksum = '';
    mockFetch.mockImplementation((input, init) => {
      const url = new URL(String(input), 'http://localhost');
      if (url.pathname !== '/api/drive/thumbnail')
        return defaultFetch(input, init);
      if (init?.method === 'POST') {
        const { thumbnailData } = JSON.parse(init.body);
        uploads.push(thumbnailData.dataUrl);
        savedChecksum = createHash('sha256')
          .update(Buffer.from(thumbnailData.dataUrl.split(',')[1], 'base64'))
          .digest('hex');
        return Promise.resolve(
          jsonResponse({
            ok: true,
            thumbnailFileId: `cover-${uploads.length}`,
          })
        );
      }
      expect(url.searchParams.get('invitationFolderId')).toBe(
        'invitation-folder-id'
      );
      expect(url.searchParams.get('metadata')).toBe('1');
      if (!metadataAvailable)
        return Promise.resolve(jsonResponse({}, { ok: false, status: 503 }));
      return Promise.resolve(
        jsonResponse({
          ok: true,
          sha256Checksum: savedChecksum,
          thumbnailFileId: `cover-${uploads.length}`,
        })
      );
    });
    const original =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aXkAAAAASUVORK5CYII=';
    const replacement =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const save = (title: string, dataUrl: string, invitationUuid?: string) =>
      saveInvitationFlow({
        bulkData,
        images: [],
        audio: null,
        shareUrl,
        bgmData,
        invitationUuid,
        data: [
          {
            id: 'notice',
            type: 'wedding',
            component: 'notice',
            props: { title },
          },
        ],
        mainPoster: { version: '7.1.0', objects: [] },
        invitationThumbnail: {
          name: 'invitation-thumbnail',
          mimeType: 'image/png',
          dataUrl,
          width: 1,
          height: 1,
          createdAt: new Date().toISOString(),
        },
      });
    try {
      const first = await save('오후 6시 입장', original);
      expect(first.success).toBe(true);
      const second = await save(
        '오후 7시 입장',
        original,
        first.invitationUuid
      );
      expect(second.success).toBe(true);
      expect(uploads).toHaveLength(1);
      expect(second.files.thumbnailFileId).toBe(first.files.thumbnailFileId);
      const [savedFile] = jest.mocked(updateFileToDrive).mock.lastCall!;
      const saved = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(savedFile);
      });
      expect(JSON.parse(saved)).toMatchObject({
        blocks: [{ props: { title: '오후 7시 입장' } }],
        mainPoster: { thumbnailFileId: 'cover-1' },
      });
      const updated = await save(
        '오후 7시 입장',
        replacement,
        first.invitationUuid
      );
      expect(updated.success).toBe(true);
      expect(uploads).toEqual([original, replacement]);
      expect(updated.files.thumbnailFileId).toBe('cover-2');
      metadataAvailable = false;
      const fallback = await save(
        '오후 8시 입장',
        original,
        first.invitationUuid
      );
      expect(fallback.success).toBe(true);
      expect(uploads).toEqual([original, replacement, original]);
    } finally {
      if (originalSubtle)
        Object.defineProperty(crypto, 'subtle', originalSubtle);
      else Reflect.deleteProperty(crypto, 'subtle');
    }
  });

  it('사진이 끝나면 다음 사진을 전송하고 갤러리는 입력 순서대로 저장한다', async () => {
    jest.useFakeTimers();
    const uploads = jest.mocked(uploadFileToDrive);
    const files = Array.from({ length: 10 }, (_, i) => new File([], `photo-${i + 1}.jpg`));
    const completedCounts: number[] = [];
    let active = 0;
    let peak = 0;
    uploads.mockImplementation(async file => {
      active++;
      peak = Math.max(peak, active);
      const slow = file === files[0] || file === files[5];
      await new Promise(resolve => setTimeout(resolve, slow ? 4000 : 1000));
      active--;
      return { fileId: `drive-${file.name}`, name: file.name };
    });

    try {
      const saving = saveInvitationFlow({
        onProgress: (_, photos) => {
          if (photos) completedCounts.push(photos.completed);
        },
        bulkData,
        shareUrl,
        bgmData,
        audio: null,
        images: files.map(file => ({ id: 'gallery', file })),
        data: [
          {
            id: 'gallery',
            type: 'wedding',
            component: 'gallery',
            props: {
              title: '갤러리',
              images: files,
              template: 'galleryType1',
              ratio: '1:1',
              isPopupViewer: false,
              isSubTitle: true,
            },
          },
        ],
        mainPoster: { version: '7.1.0', objects: [] },
        invitationThumbnail: {
          name: '', mimeType: 'image/png', dataUrl: '', width: 0, height: 0, createdAt: '',
        },
      });
      await jest.advanceTimersByTimeAsync(0);
      expect(uploads).toHaveBeenCalledTimes(5);
      await jest.advanceTimersByTimeAsync(1000);
      expect(uploads.mock.calls.map(([file]) => file)).toEqual(files.slice(0, 9));
      await jest.advanceTimersByTimeAsync(4000);
      expect((await saving).success).toBe(true);
      expect(peak).toBe(5);
      expect(completedCounts).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    } finally {
      jest.useRealTimers();
    }

    const [dataFile] = jest.mocked(updateFileToDrive).mock.calls[0];
    const reader = new FileReader();
    const savedText = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
    });
    reader.readAsText(dataFile);
    const payload = JSON.parse(await savedText);
    expect(payload.blocks[0].props.images).toEqual(files.map(file => `drive-${file.name}`));
  });

  it.each([
    { folder: 'image-folder-id', expectedRetry: [1, 2], secondId: 'drive-1' },
    {
      folder: 'new-image-folder',
      expectedRetry: [0, 1, 2],
      secondId: 'drive-3',
    },
  ])(
    '폴더 복구 후 $folder 안에 저장된 사진만 재사용한다',
    async ({ folder, expectedRetry, secondId }) => {
      const first = new File([], 'first.jpg');
      const second = new File([], 'second.jpg');
      const normalFetch = mockFetch.getMockImplementation()!;
      mockFetch.mockImplementation(async (input, init) => {
        const response = await normalFetch(input, init);
        if (
          input === '/api/drive/saveInvitation' &&
          JSON.parse(init.body).invitationUuid
        ) {
          return jsonResponse({
            ...(await response.json()),
            imageFolderId: folder,
          });
        }
        return response;
      });
      let created = 0;
      const upload = jest
        .mocked(uploadFileToDrive)
        .mockRejectedValueOnce(new Error('Drive upload failed: 403'))
        .mockImplementation(async file => ({
          name: file.name,
          fileId: `drive-${++created}`,
        }));
      const firstAttempt: number[] = [];
      const retryAttempt: number[] = [];
      const result = await saveInvitationFlow({
        bulkData,
        shareUrl,
        bgmData,
        audio: null,
        data: [],
        images: [first, second].map(file => ({ id: 'gallery', file })),
        mainPoster: { version: '7.1.0', objects: [] },
        invitationThumbnail: {
          name: '',
          mimeType: 'image/png',
          dataUrl: '',
          width: 0,
          height: 0,
          createdAt: '',
        },
        onProgress: (_, photos) => {
          if (!photos) return;
          expect(photos.total).toBe(2);
          const counts = photos.retrying ? retryAttempt : firstAttempt;
          counts.push(photos.completed);
        },
      });
      expect(result.success).toBe(true);
      const sameFolder = folder === 'image-folder-id';
      expect(created).toBe(sameFolder ? 2 : 3);
      expect(
        upload.mock.calls.slice(2).map(([file, id]) => [file.name, id])
      ).toEqual(
        sameFolder
          ? [[first.name, folder]]
          : [
              [first.name, folder],
              [second.name, folder],
            ]
      );
      expect(
        result.results.images.ok.map(image => image.fileId).sort()
      ).toEqual(['drive-2', secondId].sort());
      expect(updateFileToDrive).toHaveBeenCalledTimes(1);
      const [jsonFile] = jest.mocked(updateFileToDrive).mock.calls[0];
      const saved = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(jsonFile);
      });
      expect(JSON.parse(saved).invitationImage).toEqual([
        { id: 'gallery', file: 'drive-2' },
        { id: 'gallery', file: secondId },
      ]);
      expect(firstAttempt).toEqual([0, 1]);
      expect(retryAttempt).toEqual(expectedRetry);
    }
  );

  it('후원사 로고를 Drive ID로 저장하고 이름만 있는 후원사와 구분해 다시 읽는다', async () => {
    const logo = new File(['logo'], 'logo.png', { type: 'image/png' });
    Object.defineProperty(logo, 'driveFileId', { value: 'saved-logo-id' });
    const props = serializeSponsorEntries([
      { id: 'hanbit', name: '한빛재단', logo: null },
      { id: 'moa', name: '모아스튜디오', logo },
    ]);
    const result = await saveInvitationFlow({
      bulkData,
      bgmData,
      shareUrl,
      images: [{ id: 'sponsor-block', file: logo }],
      uploadImages: [],
      audio: null,
      data: [
        {
          id: 'sponsor-block',
          type: 'seminar',
          component: 'sponsorshipInfomation',
          props: { title: '후원사', ...props },
        },
      ],
      mainPoster: { version: '7.1.0', objects: [] },
      invitationThumbnail: {
        name: '',
        mimeType: 'image/png',
        dataUrl: '',
        width: 0,
        height: 0,
        createdAt: '',
      },
    });
    expect(result.success).toBe(true);
    const savedFile = jest.mocked(updateFileToDrive).mock.calls[0][0];
    const content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(savedFile);
    });
    expect(readSponsorEntries(JSON.parse(content).blocks[0].props)).toEqual([
      { id: 'hanbit', name: '한빛재단', logo: null },
      { id: 'moa', name: '모아스튜디오', logo: 'saved-logo-id' },
    ]);
  });

  it('하객 그룹을 저장하고 전환할 때 전용 링크와 그룹 정보를 보존한다', async () => {
    const defaultFetch = mockFetch.getMockImplementation();
    mockFetch.mockImplementation(async (input: unknown, ...args: unknown[]) => {
      if (String(input) === '/api/drive/saveInvitation') {
        const response = await defaultFetch?.(input, ...args);
        const prepared = await response.json();
        return jsonResponse({
          ...prepared,
          invitationFolderId: 'family-folder',
          invitationUuid: 'aud_family-uuid',
          audienceSlug: 'family',
        });
      }
      if (String(input) === '/api/drive/shareUrl') {
        return jsonResponse({ ok: true, guestUrl: '/i/aB7kQ2x?to=family' });
      }
      return defaultFetch?.(input, ...args);
    });

    const result = await saveInvitationFlow({
      bulkData,
      images: [],
      audio: null,
      data: [],
      shareUrl,
      bgmData,
      invitationUuid: 'aud_family-uuid',
      preserveVisibility: true,
      mainPoster: { version: '7.1.0', objects: [] },
      invitationThumbnail: {
        name: 'invitation-thumbnail.png',
        mimeType: 'image/png',
        dataUrl: '',
        width: 0,
        height: 0,
        createdAt: '',
      },
    });

    expect(result).toMatchObject({
      success: true,
      audienceSlug: 'family',
      guestUrl: 'http://localhost/i/aB7kQ2x?to=family',
    });
    expect(mockFetch.mock.calls.map(([url]) => url)).not.toContain(
      '/api/drive/invitationVisibility'
    );
  });

  it('파일 저장은 성공했지만 공개 준비 중인 상태를 결과에 보존한다', async () => {
    const defaultFetch = mockFetch.getMockImplementation();
    mockFetch.mockImplementation((input: unknown, ...args: unknown[]) => {
      if (String(input) === '/api/drive/invitationVisibility') {
        return Promise.resolve(
          jsonResponse(
            {
              ok: true,
              published: true,
              ready: false,
              status: 202,
            },
            { status: 202 }
          )
        );
      }

      return defaultFetch?.(input, ...args);
    });

    const result = await saveInvitationFlow({
      bulkData,
      images: [],
      audio: null,
      data: [],
      shareUrl,
      bgmData,
      mainPoster: {
        version: '7.1.0',
        objects: [],
      },
      invitationThumbnail: {
        name: 'invitation-thumbnail.png',
        mimeType: 'image/png',
        dataUrl: '',
        width: 0,
        height: 0,
        createdAt: '',
      },
    });

    expect(result.success).toBe(true);
    expect(result.visibility).toMatchObject({
      attempted: true,
      ok: true,
      published: true,
      ready: false,
      status: 202,
    });
  });

  it('저장 결과로 처리된 실패는 단계 정보와 함께 한 번만 Sentry에 기록한다', async () => {
    const scope = {
      setTag: jest.fn(),
      setContext: jest.fn(),
    };
    (Sentry.withScope as jest.Mock).mockImplementation(
      (callback: CallableFunction) => callback(scope)
    );

    const result = await saveInvitationFlow({
      bulkData,
      images: [],
      audio: null,
      data: [],
      shareUrl,
      bgmData,
      mainPoster: {
        version: '7.1.0',
        objects: [],
      },
      invitationThumbnail: {
        name: 'invitation-thumbnail.png',
        mimeType: 'image/png',
        dataUrl: 'data:image/png;base64,aGVsbG8=',
        width: 1,
        height: 1,
        createdAt: '',
      },
    });

    expect(result.success).toBe(false);
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'thumbnail save failed: 503' })
    );
    expect(scope.setTag).toHaveBeenCalledWith('operation', 'invitation_save');
    expect(scope.setTag).toHaveBeenCalledWith('failed_stage', 'save_thumbnail');
    expect(scope.setContext).toHaveBeenCalledWith(
      'invitation_save',
      expect.objectContaining({
        imageFailureCount: 0,
        audioFailureCount: 0,
        dataFailureCount: 0,
        httpStatus: 503,
      })
    );
  });
});
