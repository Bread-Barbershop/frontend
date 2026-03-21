/**
 * @jest-environment node
 */

/**
 * 목적:
 * app/api/drive/updateInvitation/route.ts 의 GET 핸들러를 테스트한다.
 *
 * 이 테스트에서 검증하는 것:
 * 1) 정상 요청 시 config / images / audios / folderId 구조를 반환하는지
 * 2) 초대장 파일 목록이 비어 있으면 500 fallback 응답을 반환하는지
 * 3) load 과정에서 예외가 나면 500 + 기본 fallback 구조를 반환하는지
 *
 * 왜 중요한가:
 * 이 라우트는 기존 초대장을 다시 불러와 수정 가능한 상태로 복원하는
 * 관리/운영 흐름의 핵심 API다.
 */

// ------------------------------
// updateInvitation route가 사용하는 helper 함수 mock
// 실제 Google Drive를 조회하지 않고 가짜 응답으로 분기만 검증한다.
// ------------------------------
jest.mock('@/app/api/drive/_lib/getSaveDataFetch', () => ({
  loadInvitations: jest.fn(),
  getFilesInFolder: jest.fn(),
  downloadFiles: jest.fn(),
}));

import { GET } from '@/app/api/drive/updateInvitation/route';
import {
  downloadFiles,
  getFilesInFolder,
  loadInvitations,
} from '@/app/api/drive/_lib/getSaveDataFetch';

let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;

describe('updateInvitation Route Handler 테스트', () => {
  beforeEach(() => {
    /**
     * 각 테스트가 독립적으로 동작하도록 mock 상태를 초기화한다.
     */
    jest.resetAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('정상 요청 시 config / images / audios / folderId 구조를 반환한다', async () => {
    /**
     * 목적:
     * 기존 초대장을 구성하는 folder / json 파일들을 읽어서
     * route가 최종적으로 편집기 복원용 구조를 반환하는지 확인한다.
     */

    (loadInvitations as jest.Mock).mockResolvedValue({
      files: [
        {
          id: 'image-folder-id',
          name: 'images',
          mimeType: 'application/vnd.google-apps.folder',
        },
        {
          id: 'audio-folder-id',
          name: 'audio',
          mimeType: 'application/vnd.google-apps.folder',
        },
        {
          id: 'data-json-id',
          name: 'data.json',
          mimeType: 'application/json',
        },
      ],
    });

    (getFilesInFolder as jest.Mock)
      /**
       * 첫 번째 폴더(images) 조회 결과
       */
      .mockResolvedValueOnce({
        image1: {
          id: 'img-1',
          name: 'photo-1.jpg',
        },
        image2: {
          id: 'img-2',
          name: 'photo-2.jpg',
        },
      })
      /**
       * 두 번째 폴더(audio) 조회 결과
       */
      .mockResolvedValueOnce({
        audio1: {
          id: 'audio-1',
          name: 'bgm.mp3',
        },
      });

    (downloadFiles as jest.Mock).mockResolvedValue({
      blocks: [
        {
          id: 'block-1',
          type: 'wedding',
          component: 'greeting',
          props: {
            title: '안녕하세요',
          },
        },
      ],
      mainPoster: 'poster-json-string',
      bgm: {
        selectedBgmId: null,
        isLoop: false,
        volume: 0.2,
        userBgmTitle: null,
        userBgmDuration: null,
        userBgmFileId: null,
      },
    });

    const req = new Request(
      'http://localhost:3000/api/drive/updateInvitation?id=folder-root-id',
      {
        method: 'GET',
      }
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);

    expect(json).toEqual({
      success: true,
      config: {
        blocks: [
          {
            id: 'block-1',
            type: 'wedding',
            component: 'greeting',
            props: {
              title: '안녕하세요',
            },
          },
        ],
        mainPoster: 'poster-json-string',
        bgm: {
          selectedBgmId: null,
          isLoop: false,
          volume: 0.2,
          userBgmTitle: null,
          userBgmDuration: null,
          userBgmFileId: null,
        },
      },
      images: {
        image1: {
          id: 'img-1',
          name: 'photo-1.jpg',
        },
        image2: {
          id: 'img-2',
          name: 'photo-2.jpg',
        },
      },
      audios: {
        audio1: {
          id: 'audio-1',
          name: 'bgm.mp3',
        },
      },
      imageFolderId: 'image-folder-id',
      audioFolderId: 'audio-folder-id',
    });

    /**
     * helper 호출 흐름 검증
     */
    expect(loadInvitations).toHaveBeenCalledWith('folder-root-id');
    expect(getFilesInFolder).toHaveBeenCalledTimes(2);
    expect(getFilesInFolder).toHaveBeenCalledWith('image-folder-id');
    expect(getFilesInFolder).toHaveBeenCalledWith('audio-folder-id');
    expect(downloadFiles).toHaveBeenCalledWith('data-json-id');
  });

  it('초대장 파일 목록이 비어 있으면 500 fallback 응답을 반환한다', async () => {
    /**
     * 목적:
     * loadInvitations 결과가 비어 있거나 files가 없을 경우
     * route가 예외로 처리하고 fallback 응답을 반환하는지 확인한다.
     */

    (loadInvitations as jest.Mock).mockResolvedValue({
      files: [],
    });

    const req = new Request(
      'http://localhost:3000/api/drive/updateInvitation?id=empty-folder-id',
      {
        method: 'GET',
      }
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(500);

    expect(json).toEqual({
      success: false,
      error: '초대장 목록이 없거나 불러오지 못했습니다.',
      config: {
        blocks: [],
        mainPoster: '',
        bgm: {
          selectedBgmId: null,
          isLoop: false,
          volume: 0.2,
          userBgmTitle: null,
          userBgmDuration: null,
          userBgmFileId: null,
        },
      },
      images: {},
      audios: {},
    });

    /**
     * files가 비어 있으므로 이후 folder/json 조회는 수행되지 않아야 한다.
     */
    expect(getFilesInFolder).not.toHaveBeenCalled();
    expect(downloadFiles).not.toHaveBeenCalled();
  });

  it('load 과정에서 예외가 발생하면 500과 기본 fallback 구조를 반환한다', async () => {
    /**
     * 목적:
     * helper 중 하나가 예외를 던지더라도
     * route가 편집기에서 사용할 수 있는 최소 fallback 구조를 반환하는지 확인한다.
     */

    (loadInvitations as jest.Mock).mockRejectedValue(
      new Error('drive load failed')
    );

    const req = new Request(
      'http://localhost:3000/api/drive/updateInvitation?id=broken-folder-id',
      {
        method: 'GET',
      }
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(500);

    expect(json).toEqual({
      success: false,
      error: 'drive load failed',
      config: {
        blocks: [],
        mainPoster: '',
        bgm: {
          selectedBgmId: null,
          isLoop: false,
          volume: 0.2,
          userBgmTitle: null,
          userBgmDuration: null,
          userBgmFileId: null,
        },
      },
      images: {},
      audios: {},
    });

    expect(getFilesInFolder).not.toHaveBeenCalled();
    expect(downloadFiles).not.toHaveBeenCalled();
  });

  it('json 파일만 있고 image/audio 폴더가 없으면 config만 복원한다', async () => {
    /**
     * 목적:
     * image/audio 폴더가 없더라도 data.json만 있으면
     * route가 config를 복원하고 나머지는 빈 객체로 유지하는지 확인한다.
     *
     * 이 케이스는 부분적으로 손상된 저장 구조를 방어적으로 다루는지 보는 데 유용하다.
     */

    (loadInvitations as jest.Mock).mockResolvedValue({
      files: [
        {
          id: 'data-json-only-id',
          name: 'data.json',
          mimeType: 'application/json',
        },
      ],
    });

    (downloadFiles as jest.Mock).mockResolvedValue({
      blocks: [],
      mainPoster: 'poster-only',
      bgm: {
        selectedBgmId: null,
        isLoop: true,
        volume: 0.5,
        userBgmTitle: null,
        userBgmDuration: null,
        userBgmFileId: null,
      },
    });

    const req = new Request(
      'http://localhost:3000/api/drive/updateInvitation?id=json-only-folder-id',
      {
        method: 'GET',
      }
    );

    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      success: true,
      config: {
        blocks: [],
        mainPoster: 'poster-only',
        bgm: {
          selectedBgmId: null,
          isLoop: true,
          volume: 0.5,
          userBgmTitle: null,
          userBgmDuration: null,
          userBgmFileId: null,
        },
      },
      images: {},
      audios: {},
      imageFolderId: '',
      audioFolderId: '',
    });

    expect(getFilesInFolder).not.toHaveBeenCalled();
    expect(downloadFiles).toHaveBeenCalledWith('data-json-only-id');
  });
});
