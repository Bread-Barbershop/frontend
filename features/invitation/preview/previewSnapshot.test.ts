import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { createPreviewSnapshot, parsePreviewSnapshot } from './previewSnapshot';

describe('저장 전 초대장 미리보기 데이터', () => {
  const createUrl = jest.fn(() => 'blob:local-preview-photo');
  const revokeUrl = jest.fn();
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  beforeEach(() => {
    URL.createObjectURL = createUrl;
    URL.revokeObjectURL = revokeUrl;
    useEditorStore.getState().reset();
    useBgmStore.getState().reset();
    jest.clearAllMocks();
  });
  afterEach(() => {
    useEditorStore.getState().reset();
    useBgmStore.getState().reset();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  it('현재 포스터·본문·미업로드 사진을 복사하고 원본 File과 편집 상태를 보존한다', () => {
    const file = new File(['photo'], 'our-photo.webp', { type: 'image/webp' });
    const state = useEditorStore.getState();
    state.addBlock('wedding', 'gallery', 'photos');
    state.updateBlock('photos', { images: [file, file] });
    const original = useEditorStore.getState().block;
    const { snapshot, dispose } = createPreviewSnapshot(
      'data:image/webp;base64,current'
    );
    expect(snapshot.payload.mainPoster.thumbnailFileId).toBe(
      'data:image/webp;base64,current'
    );
    expect(snapshot.payload.blocks[0].props).toMatchObject({
      images: ['blob:local-preview-photo', 'blob:local-preview-photo'],
    });
    expect(createUrl).toHaveBeenCalledTimes(1);
    expect(useEditorStore.getState().block).toBe(original);
    expect((original[0].props as { images: unknown[] }).images[0]).toBe(file);
    dispose();
    dispose();
    expect(revokeUrl).toHaveBeenCalledTimes(1);
  });

  it('다시 열 때 최신 편집값을 읽고 잘못된 전달 데이터는 거부한다', () => {
    const state = useEditorStore.getState();
    state.addBlock('wedding', 'afterParty', 'party');
    state.updateBlock('party', { venue: '저장 전 라운지' });
    const first = createPreviewSnapshot('data:image/png;base64,one');
    state.updateBlock('party', { venue: '수정한 라운지' });
    const second = createPreviewSnapshot('data:image/png;base64,two');
    expect(first.snapshot.payload.blocks[0].props).toMatchObject({
      venue: '저장 전 라운지',
    });
    expect(
      parsePreviewSnapshot(second.snapshot)?.payload.blocks[0].props
    ).toMatchObject({ venue: '수정한 라운지' });
    expect(
      parsePreviewSnapshot({ payload: {}, previewFolderId: '' })
    ).toBeNull();
    expect(
      parsePreviewSnapshot({
        ...second.snapshot,
        localAudioSrc: 'javascript:alert(1)',
      })?.localAudioSrc
    ).toBeNull();
    first.dispose();
    second.dispose();
  });
});
