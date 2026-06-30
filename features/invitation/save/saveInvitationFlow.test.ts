/**
 * @jest-environment jsdom
 */

jest.mock('./updateFileToDrive', () => ({
  updateFileToDrive: jest.fn(),
}));

import { saveInvitationFlow } from './saveInvitationFlow';
import { updateFileToDrive } from './updateFileToDrive';

const mockFetch = jest.fn();

const bulkData = {
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
});
