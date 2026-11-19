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
import { updateFileToDrive } from './updateFileToDrive';
import { uploadFileToDrive } from './uploadFileToDrive';
import * as Sentry from '@sentry/nextjs';
import type { BulkJson } from '@/shared/types/invitationSave';

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
    expect(result.guestUrl).toBe('http://localhost/i/aB7kQ2x');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/drive/shareUrl',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('사진이 끝나면 다음 사진을 전송하고 갤러리는 입력 순서대로 저장한다', async () => {
    jest.useFakeTimers();
    const uploads = jest.mocked(uploadFileToDrive);
    const files = Array.from({ length: 10 }, (_, i) => new File([], `photo-${i + 1}.jpg`));
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
