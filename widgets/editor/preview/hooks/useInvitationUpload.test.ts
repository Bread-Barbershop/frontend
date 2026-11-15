import { act, renderHook } from '@testing-library/react';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { saveInvitationFlow } from '@/features/invitation/save/saveInvitationFlow';
import { createInvitationTemplate } from '@/shared/data/invitationTemplates';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { useInvitationUpload } from './useInvitationUpload';

jest.mock('@/features/invitation/save/saveInvitationFlow', () => ({
  saveInvitationFlow: jest.fn(),
}));
jest.mock('@/shared/hooks/useToast', () => ({
  useToast: () => ({ success: jest.fn(), error: jest.fn(), info: jest.fn() }),
}));
jest.mock('@/shared/utils/fileUtils', () => ({
  getFileKey: async (file: File, id: string) => `${id}:${file.name}`,
}));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricContext: () => ({
    exportIntersectedJSON: () => ({ version: '7.1.0', objects: [] }),
    exportCanvasPreview: () => null,
  }),
}));

const mockSave = jest.mocked(saveInvitationFlow);

describe('템플릿 사진을 남겨 편집한 갤러리 저장', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    useBgmStore.getState().reset();
    global.fetch = jest.fn();
    mockSave.mockReset().mockImplementation(
      async params =>
        ({
          success: true,
          invitationUuid: 'invitation-uuid',
          guestUrl: '/guest/data-file',
          files: {
            dataJsonFileId: 'data-file',
            thumbnailFileId: 'thumbnail-file',
          },
          folders: {
            workspaceFolderId: 'workspace-folder',
            invitationFolderId: 'invitation-folder',
            imageFolderId: 'image-folder',
            audioFolderId: 'audio-folder',
          },
          results: {
            images: {
              ok: (params.uploadImages ?? []).map(task => ({
                ...task,
                fileId: 'uploaded-image-id',
              })),
              fail: [],
            },
            audio: { ok: [], fail: [] },
            data: { ok: [], fail: [] },
          },
          visibility: {
            attempted: true,
            ok: true,
            published: true,
            ready: true,
            status: 'ready',
            error: undefined,
          },
          debug: { refreshedToken: false, usedAccessToken: 'mock-token' },
        }) as Awaited<ReturnType<typeof saveInvitationFlow>>
    );
  });

  function setGallery(images: (File | string)[]) {
    const template = createInvitationTemplate('showcase-18');
    const gallery = template.blocks.find(
      block => block.component === 'gallery'
    )!;
    gallery.props = { ...gallery.props, images };
    useEditorStore.setState({
      block: template.blocks,
      images: [{ id: gallery.id, file: images }],
      isDirty: true,
    });
    return gallery.id;
  }

  it('샘플 URL과 새 파일이 섞인 상태에서 파일만 업로드하고 본문 URL을 유지한다', async () => {
    const file = new File(['photo'], 'my-photo.png', { type: 'image/png' });
    const sample = '/images/showcase/birthday-evening.webp';
    const id = setGallery([file, sample]);
    const { result } = renderHook(() => useInvitationUpload());
    await act(async () => {
      await result.current.handleUpload();
    });
    const input = mockSave.mock.calls[0][0];
    expect(input.images).toEqual([{ id, file }]);
    expect(input.uploadImages).toEqual([{ id, file }]);
    expect(
      input.data.find(block => block.component === 'gallery')?.props.images
    ).toEqual([file, sample]);
    expect(result.current.isFail).toBe(false);
    expect(result.current.pendingInvitation?.published).toBe(true);
    expect(useEditorStore.getState().isDirty).toBe(false);
  });

  it('샘플 사진을 재정렬하거나 일부만 남겼다면 파일 업로드 없이 저장한다', async () => {
    const sample = '/images/showcase/birthday-table.webp';
    setGallery([sample]);
    const { result } = renderHook(() => useInvitationUpload());
    await act(async () => {
      await result.current.handleUpload();
    });
    expect(mockSave.mock.calls[0][0].images).toEqual([]);
    expect(mockSave.mock.calls[0][0].uploadImages).toEqual([]);
    expect(
      mockSave.mock.calls[0][0].data.find(
        block => block.component === 'gallery'
      )?.props.images
    ).toEqual([sample]);
    expect(result.current.isFail).toBe(false);
  });

  it('샘플과 기존 Drive 파일이 섞여도 기존 파일의 중복 업로드를 생략한다', async () => {
    const file = new File(['photo'], 'saved-photo.png', { type: 'image/png' });
    Object.defineProperty(file, 'driveFileId', {
      value: 'existing-drive-id',
      configurable: true,
    });
    const id = setGallery(['/images/showcase/birthday-evening.webp', file]);
    useEditorStore.setState({
      hashFiles: [`${id}:${file.name}::existing-drive-id`],
    });
    const { result } = renderHook(() => useInvitationUpload());
    await act(async () => {
      await result.current.handleUpload();
    });
    expect(mockSave.mock.calls[0][0].images).toEqual([{ id, file }]);
    expect(mockSave.mock.calls[0][0].uploadImages).toEqual([]);
    expect(useEditorStore.getState().hashFiles).toContain(
      `${id}:${file.name}::existing-drive-id`
    );
    expect(result.current.isFail).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });
});
