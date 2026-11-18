import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  within,
} from '@testing-library/react';

import { useEditorDirtyTracker } from '@/app/editor/hooks/useEditorDirtyTracker';
import { useInitData } from '@/app/editor/[id]/hooks/useInitData';
import type { SavedData } from '@/app/editor/[id]/types/savedata';
import {
  createPreviewSnapshot,
  parsePreviewSnapshot,
} from '@/features/invitation/preview/previewSnapshot';
import { DEFAULT_BACKGROUND_TEXTURE } from '@/shared/data/backgroundTextures';
import {
  selectUploadData,
  useEditorStore,
} from '@/shared/store/editorStore/useEditorStore';

import BackgroundTextureEdit from './BackgroundTextureEdit';

describe('배경 질감 편집', () => {
  beforeEach(() => useEditorStore.getState().reset());
  afterEach(() => act(() => useEditorStore.getState().reset()));

  it('질감 8개를 제공하고 선택한 질감에만 강도 조절을 표시한다', () => {
    render(<BackgroundTextureEdit />);

    const choices = within(screen.getByRole('group', { name: '질감' }));
    expect(choices.getAllByRole('button')).toHaveLength(8);
    expect(choices.getByRole('button', { name: '없음' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();

    const floral = choices.getByRole('button', { name: '꽃 엠보싱' });
    fireEvent.click(floral);

    const strength = screen.getByRole('slider', { name: '질감 강도' });
    expect(floral).toHaveAttribute('aria-pressed', 'true');
    expect(strength).toHaveAttribute('aria-valuetext', '50%');

    fireEvent.change(strength, { target: { value: '67' } });
    expect(strength).toHaveAttribute('aria-valuetext', '67%');

    fireEvent.click(choices.getByRole('button', { name: '없음' }));
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('질감 변경을 저장 대상으로 표시하고 미리보기에 전달한다', () => {
    renderHook(() => useEditorDirtyTracker(true));
    const texture = { material: 'leather', strength: 76 } as const;

    act(() => useEditorStore.getState().setBackgroundTexture(texture));

    const state = useEditorStore.getState();
    expect(state.isDirty).toBe(true);
    expect(selectUploadData(state).backgroundTexture).toEqual(texture);

    const resource = createPreviewSnapshot('data:image/png;base64,test');
    const restored = parsePreviewSnapshot(
      JSON.parse(JSON.stringify(resource.snapshot))
    );
    expect(restored?.payload.bulkData.backgroundTexture).toEqual(texture);
    resource.dispose();
  });

  it('저장한 질감을 불러오고 이전 초대장의 질감은 없음으로 초기화한다', () => {
    const state = useEditorStore.getState();
    const bulkData: SavedData['bulkData'] = {
      backgroundColor: state.backgroundColor,
      titleData: state.titleData,
      bodyData: state.bodyData,
      isZoom: state.isZoom,
      scrollAnimation: state.scrollAnimation,
    };
    const texture = { material: 'hanji', strength: 34 } as const;
    const { result, rerender } = renderHook(
      (savedBulkData: SavedData['bulkData']) =>
        useInitData({
          savedData: { bulkData: savedBulkData } as SavedData,
          uuid: '',
          invitationFolderId: '',
        }),
      { initialProps: { ...bulkData, backgroundTexture: texture } }
    );

    act(() => result.current.initBulkData());
    expect(useEditorStore.getState().backgroundTexture).toEqual(texture);

    rerender(bulkData);
    act(() => result.current.initBulkData());
    expect(useEditorStore.getState().backgroundTexture).toEqual(
      DEFAULT_BACKGROUND_TEXTURE
    );
  });
});
