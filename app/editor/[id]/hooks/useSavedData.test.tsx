import { renderHook, waitFor } from '@testing-library/react';

import { getSavedAudioFileId } from '@/features/invitation/save/savedAudioFiles';

import { fetchAudioFiles } from '../utils/fetchFile';

import {
  mappedAudio,
  olderAudio,
  savedAudioResponse,
} from './fixtures/savedAudio';
import { useSavedData } from './useSavedData';

jest.mock('../utils/fetchFile', () => ({
  fetchAudioFiles: jest.fn(),
}));

describe('다시 편집할 때 저장된 사용자 음원 복원', () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();
  const mockFetchAudio = jest.mocked(fetchAudioFiles);

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    mockFetchAudio.mockReset();
    mockFetchAudio.mockImplementation(async files =>
      files.map(({ id, name, mimeType }) => ({
        id,
        file: new File([id], name, { type: mimeType }),
      }))
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function openSavedInvitation(savedFileId?: string | null) {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => savedAudioResponse(savedFileId),
    });
    return renderHook(() => useSavedData('audience-invitation', 'aud_family'));
  }

  it('폴더의 첫 음원보다 저장된 복사본의 음원을 우선한다', async () => {
    const { result } = openSavedInvitation(mappedAudio.id);

    await waitFor(() =>
      expect(result.current.savedData?.bgm.bgmFile?.name).toBe(mappedAudio.name)
    );
    expect(mockFetchAudio).toHaveBeenCalledWith(
      [mappedAudio],
      expect.any(AbortSignal)
    );
    const bgmFile = result.current.savedData!.bgm.bgmFile;
    expect(getSavedAudioFileId(bgmFile, 'audio-folder')).toBe(mappedAudio.id);
    expect(getSavedAudioFileId(bgmFile, 'another-folder')).toBeNull();
  });

  it.each([undefined, null])(
    '저장된 음원 ID가 %s이면 예전 방식으로 첫 음원을 복원한다',
    async savedFileId => {
      const { result } = openSavedInvitation(savedFileId);

      await waitFor(() =>
        expect(result.current.savedData?.bgm.bgmFile?.name).toBe(
          olderAudio.name
        )
      );
      expect(
        getSavedAudioFileId(
          result.current.savedData!.bgm.bgmFile,
          'audio-folder'
        )
      ).toBe(olderAudio.id);
    }
  );

  it('저장된 음원이 사라진 경우 다른 음원으로 바꾸지 않는다', async () => {
    const { result } = openSavedInvitation('removed-audio');

    await waitFor(() =>
      expect(result.current.savedData?.bgm.bgmFile).toBeNull()
    );
    expect(mockFetchAudio).not.toHaveBeenCalled();
  });

  it('사용자 음원을 지운 후 다시 열면 폴더에 남아 있는 이전 곡을 복원하지 않는다', async () => {
    const data = savedAudioResponse(null);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ...data,
        config: {
          ...data.config,
          bgm: { ...data.config.bgm, selectedBgmId: null, userBgmTitle: null },
        },
      }),
    });
    const { result } = renderHook(() =>
      useSavedData('audience-invitation', 'aud_family')
    );
    await waitFor(() =>
      expect(result.current.savedData?.bgm.bgmFile).toBeNull()
    );
    expect(mockFetchAudio).not.toHaveBeenCalled();
  });
});
