import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';

import { useSavedData } from '@/app/editor/[id]/hooks/useSavedData';
import { fetchImageFiles } from '@/app/editor/[id]/utils/fetchFile';
import {
  applySquareCrop,
  mockCropBrowser,
} from '@/components/molecules/picture/test-utils/cropControls';
import { updateFileToDrive } from '@/features/invitation/save/updateFileToDrive';
import { uploadFileToDrive } from '@/features/invitation/save/uploadFileToDrive';
import { blockRegistry } from '@/shared/data/registry/registry';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { mockBgmSaveApi, readInvitationPayload } from './fixtures/bgmSave';
import { useInvitationUpload } from './useInvitationUpload';

jest.mock('@/features/invitation/save/updateFileToDrive');
jest.mock('@/features/invitation/save/uploadFileToDrive');
jest.mock('@/app/editor/[id]/utils/fetchFile');
jest.mock('@/shared/assets/icons/add.svg', () => () => null);
jest.mock('@/shared/assets/icons/cancel.svg', () => () => null);
jest.mock('@/shared/assets/icons/loadingSpinner.svg', () => () => null);
jest.mock('@sentry/nextjs', () => ({ withScope: jest.fn() }));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricContext: () => ({
    exportIntersectedJSON: () => null,
    exportCanvasPreview: () => null,
  }),
}));

const { editComponent: Gallery, viewComponent: GalleryPreview } = blockRegistry.gallery;
const originalFetch = global.fetch;
const originalCreate = URL.createObjectURL;
const originalRevoke = URL.revokeObjectURL;
const originalResize = global.ResizeObserver;

describe('갤러리 자르기 저장', () => {
  afterEach(() => {
    act(() => useEditorStore.getState().reset());
    global.fetch = originalFetch;
    global.ResizeObserver = originalResize;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    jest.restoreAllMocks();
  });

  it('두 번째 사진만 자르면 저장 후 편집기와 하객용 갤러리에서 같은 자리에 보인다', async () => {
    mockCropBrowser();
    global.fetch = jest.fn(mockBgmSaveApi);
    global.ResizeObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
    URL.createObjectURL = source => 'blob:' + (source as File).name;
    URL.revokeObjectURL = jest.fn();

    const originalId = 'original-image-id';
    const cropId = 'cropped-image-id';
    const original = new File(['original'], 'family.jpg', {
      type: 'image/jpeg',
    });
    const photos = [originalId, originalId];
    const upload = jest
      .mocked(uploadFileToDrive)
      .mockResolvedValue({ fileId: cropId, name: 'photo-crop.webp' });
    const update = jest
      .mocked(updateFileToDrive)
      .mockResolvedValue({ fileId: 'data', name: 'data.json' });
    useEditorStore.getState().addBlock('wedding', 'gallery', 'family', {
      images: photos,
      template: 'galleryType6',
    });
    const block = useEditorStore.getState().block[0] as EditorBlock<'gallery'>;
    const editor = render(<Gallery blockInfo={block} id={block.id} />);
    const save = renderHook(useInvitationUpload);

    fireEvent.click(screen.getAllByRole('button', { name: '자르기' })[1]);
    applySquareCrop();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await act(async () => {
      expect(await save.result.current.handleUpload()).toBeTruthy();
    });
    expect(upload).toHaveBeenCalledTimes(1);
    const [croppedFile] = upload.mock.calls[0];
    const payload = await readInvitationPayload(update.mock.calls[0][0]);
    const saved = payload.blocks[0] as EditorBlock<'gallery'>;
    expect(saved.props.images).toEqual([originalId, cropId]);
    editor.unmount();
    save.unmount();
    useEditorStore.getState().reset();

    const files = [
      { id: originalId, file: original },
      { id: cropId, file: croppedFile },
    ];
    jest.mocked(fetchImageFiles).mockResolvedValue(files);
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        config: payload,
        images: {
          files: files.map(({ id, file }) => ({
            id,
            name: file.name,
            mimeType: file.type,
          })),
        },
        audios: { files: [] },
      }),
    } as Response);
    const reopened = renderHook(() => useSavedData('folder', 'invitation'));
    await waitFor(() => expect(reopened.result.current.savedData).toBeTruthy());
    const restored = reopened.result.current.savedData!
      .blocks[0] as EditorBlock<'gallery'>;
    const reopenedEditor = render(
      <Gallery blockInfo={restored} id={restored.id} />
    );
    expect(
      screen
        .getAllByAltText('이미지 미리보기')
        .map(img => img.getAttribute('src'))
    ).toEqual(['blob:family.jpg', 'blob:photo-crop.webp']);
    reopenedEditor.unmount();

    render(
      <GalleryPreview
        blockInfo={saved}
        className=""
        onClick={() => {}}
        isGuestPage
      />
    );
    expect(screen.getByAltText('갤러리 이미지 1')).toHaveAttribute(
      'src',
      'https://lh3.googleusercontent.com/d/' + originalId
    );
    expect(screen.getByAltText('갤러리 이미지 2')).toHaveAttribute(
      'src',
      'https://lh3.googleusercontent.com/d/' + cropId
    );
  });
});
