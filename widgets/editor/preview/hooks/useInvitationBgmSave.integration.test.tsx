import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';

import {
  mappedAudio,
  savedAudioResponse,
} from '@/app/editor/[id]/hooks/fixtures/savedAudio';
import { useInitData } from '@/app/editor/[id]/hooks/useInitData';
import { useSavedData } from '@/app/editor/[id]/hooks/useSavedData';
import { fetchAudioFiles } from '@/app/editor/[id]/utils/fetchFile';
import GuestBgm from '@/app/guest/[id]/components/GuestBgm';
import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { updateFileToDrive } from '@/features/invitation/save/updateFileToDrive';
import { uploadFileToDrive } from '@/features/invitation/save/uploadFileToDrive';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { mockBgmSaveApi, readInvitationPayload } from './fixtures/bgmSave';
import { useInvitationUpload } from './useInvitationUpload';

jest.mock('@/features/invitation/save/updateFileToDrive');
jest.mock('@/features/invitation/save/uploadFileToDrive');
jest.mock('@/app/editor/[id]/utils/fetchFile', () => ({
  fetchAudioFiles: jest.fn(),
}));
jest.mock('@sentry/nextjs', () => ({ withScope: jest.fn() }));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricContext: () => ({
    exportIntersectedJSON: () => null,
    exportCanvasPreview: () => null,
  }),
}));

const upload = jest.mocked(uploadFileToDrive);
const update = jest.mocked(updateFileToDrive);
const originalFetch = global.fetch;
const originalCreate = URL.createObjectURL;
const originalRevoke = URL.revokeObjectURL;

function selectTrack(content: string) {
  const file = new File([content], 'opening.mp3', { type: 'audio/mpeg' });
  act(() => {
    useBgmStore.getState().setUserFile(file, file.name, '01:00');
    useBgmStore.getState().setSelectedBgmId('user-bgm');
  });
  return file;
}

function openEditor() {
  const { result } = renderHook(useInvitationUpload);
  return async () => {
    await act(async () => {
      expect(await result.current.handleUpload()).toBeTruthy();
    });
    const [file] = update.mock.lastCall!;
    return (await readInvitationPayload(file)).bgm;
  };
}

describe('편집기에서 사용자 배경음악 저장', () => {
  beforeEach(() => {
    global.fetch = jest.fn(mockBgmSaveApi);
    URL.createObjectURL = jest.fn(() => 'blob:test');
    URL.revokeObjectURL = jest.fn();
    upload.mockReset().mockImplementation(async file => ({
      fileId: `audio-${upload.mock.calls.length}`,
      name: file.name,
    }));
    update.mockReset().mockResolvedValue({ fileId: 'data', name: 'data.json' });
  });

  afterEach(() => {
    useEditorStore.getState().reset();
    useBgmStore.getState().reset();
    global.fetch = originalFetch;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    jest.restoreAllMocks();
  });

  it('문구와 음량 수정 후 같은 음원을 유지하고 하객 플레이어에서 해당 파일을 연다', async () => {
    selectTrack('opening');
    const save = openEditor();
    expect((await save()).userBgmFileId).toBe('audio-1');
    act(() => {
      useEditorStore.getState().setShareUrl({
        ...useEditorStore.getState().shareUrl,
        title: '수정한 초대장 제목',
      });
      useBgmStore.getState().setVolume(0.6);
    });
    const bgm = await save();
    expect(upload).toHaveBeenCalledTimes(1);
    expect(bgm).toMatchObject({ userBgmFileId: 'audio-1', volume: 0.6 });

    jest
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => {});
    jest.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
    const { container } = render(<GuestBgm bgm={bgm} />);
    fireEvent.click(screen.getByRole('button', { name: '배경음악 켜기' }));
    expect(container.querySelector('audio')?.src).toContain('id=audio-1&');
  });

  it('같은 파일명의 다른 곡은 한 번 업로드하고 삭제하면 파일 참조도 지운다', async () => {
    selectTrack('opening');
    const save = openEditor();
    await save();
    selectTrack('ending');
    expect((await save()).userBgmFileId).toBe('audio-2');
    expect((await save()).userBgmFileId).toBe('audio-2');
    act(() => useBgmStore.getState().clearUserFile());
    expect(await save()).toMatchObject({
      selectedBgmId: null,
      userBgmFileId: null,
    });
    expect(upload).toHaveBeenCalledTimes(2);
  });

  it('하객 그룹 편집기를 다시 열고 저장하면 복원한 음원을 추가 업로드 없이 사용한다', async () => {
    const uuid = 'aud_family';
    const response = savedAudioResponse(mappedAudio.id);
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...response, audioFolderId: `${uuid}-audio` }),
    } as Response);
    jest.mocked(fetchAudioFiles).mockResolvedValueOnce([
      {
        id: mappedAudio.id,
        file: new File(['restored'], mappedAudio.name, {
          type: mappedAudio.mimeType,
        }),
      },
    ]);
    const { result } = renderHook(() => {
      const { savedData } = useSavedData('family-folder', uuid);
      const init = useInitData({
        savedData,
        uuid,
        invitationFolderId: 'family-folder',
      });
      return { savedData, init };
    });
    await waitFor(() => expect(result.current.savedData).toBeTruthy());
    await act(async () => {
      await result.current.init.initEditStore();
      result.current.init.initBgmStore();
      useBgmStore.getState().setVolume(0.4);
    });
    const save = openEditor();
    expect(await save()).toMatchObject({
      volume: 0.4,
      userBgmFileId: mappedAudio.id,
    });
    expect(upload).not.toHaveBeenCalled();
  });

  it('저장 도중 선택한 새 곡에 이전 곡의 업로드 결과를 적용하지 않는다', async () => {
    selectTrack('opening');
    const save = openEditor();
    upload.mockImplementationOnce(async file => {
      selectTrack('ending');
      useEditorStore.getState().setIsDirty(true);
      return { fileId: 'first-track', name: file.name };
    });
    expect((await save()).userBgmFileId).toBe('first-track');
    expect(useEditorStore.getState().isDirty).toBe(true);
    expect((await save()).userBgmFileId).toBe('audio-2');
    expect(upload).toHaveBeenCalledTimes(2);
  });

  it('하객 그룹이 바뀌면 해당 그룹 폴더에 업로드하고 그 복사본을 재사용한다', async () => {
    const file = selectTrack('opening');
    const save = openEditor();
    await save();
    act(() => useEditorStore.getState().setInvitationUuid('aud_family'));
    expect((await save()).userBgmFileId).toBe('audio-2');
    expect((await save()).userBgmFileId).toBe('audio-2');
    expect(upload.mock.calls.map(([track, folder]) => [track, folder])).toEqual(
      [
        [file, 'invitation-audio'],
        [file, 'aud_family-audio'],
      ]
    );
  });

  it('음원 전송이 한 번 실패하면 재시도에 성공한 파일만 다음 저장에 재사용한다', async () => {
    selectTrack('opening');
    upload.mockRejectedValueOnce(new Error('Drive upload failed: 503'));
    const save = openEditor();
    expect((await save()).userBgmFileId).toBe('audio-2');
    expect((await save()).userBgmFileId).toBe('audio-2');
    expect(upload).toHaveBeenCalledTimes(2);
  });
});
