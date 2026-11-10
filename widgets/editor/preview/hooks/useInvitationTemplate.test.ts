import { act, renderHook } from '@testing-library/react';

import { useBgmStore } from '@/components/organisms/bgm/store/useBgmStore';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import {
  collectInvitationTemplateImageIds,
  useInvitationTemplate,
} from './useInvitationTemplate';

const mockCanvas = {
  disposed: false,
  destroyed: false,
  toObject: jest.fn(() => ({
    version: '7.1.0',
    objects: [
      { type: 'rect', id: 'old-canvas-object', slot: { key: 'old-slot' } },
    ],
  })),
  loadFromJSON: jest.fn(async () => undefined),
};

const mockRunHistoryTransaction = jest.fn(
  async (task: () => Promise<void> | void) => {
    await task();
  }
);
const mockConfirm = jest.fn<Promise<boolean>, [Record<string, unknown>]>();
const mockSuccess = jest.fn();
const mockError = jest.fn();
const mockPreloadFonts = jest.fn(async () => undefined);
const mockStabilizeCanvasAfterLoad = jest.fn(async () => undefined);

jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricContext: () => ({
    canvas: mockCanvas,
    runHistoryTransaction: mockRunHistoryTransaction,
  }),
}));

jest.mock('@/shared/hooks/useConfirm', () => ({
  useConfirm: () => ({ confirm: mockConfirm }),
}));

jest.mock('@/shared/hooks/useToast', () => ({
  useToast: () => ({ success: mockSuccess, error: mockError }),
}));

jest.mock('@/widgets/mainPoster/hooks/useTemplate', () => ({
  preloadFonts: () => mockPreloadFonts(),
  stabilizeCanvasAfterLoad: () => mockStabilizeCanvasAfterLoad(),
}));

jest.mock('@/shared/data/invitationTemplates', () => ({
  INVITATION_TEMPLATES: [
    { id: 'test-template', name: '테스트 템플릿', type: 'wedding' },
  ],
  createInvitationTemplate: jest.fn(() => ({
    blocks: [
      {
        id: 'new-page',
        type: 'wedding',
        component: 'greeting',
        props: { title: '새 초대장' },
      },
    ],
    backgroundColor: '#FAF8F2',
    titleData: {
      font: 'Hahmlet',
      fontSize: '22px',
      fontWeight: '500',
      color: '#98765A',
      isDefault: false,
    },
    bodyData: {
      font: 'SUIT',
      fontSize: '14px',
      fontWeight: '400',
      color: '#463B35',
      isDefault: false,
    },
    posterJson: {
      version: '7.1.0',
      width: 375,
      height: 812,
      background: '#FAF8F2',
      objects: [{ type: 'rect', id: 'background-layer' }],
    },
  })),
}));

const oldPhoto = new File(['old photo'], 'old-photo.png', {
  type: 'image/png',
});

const makeOldBlock = () =>
  ({
    id: 'old-block',
    type: 'wedding',
    component: 'gallery',
    props: {
      images: [oldPhoto, '/images/unrelated-copy.jpg'],
      child: { id: 'nested-photo', image: [oldPhoto] },
      copy: 'unrelated text',
      share: { images: 'shareUrl' },
    },
  }) as never;

describe('useInvitationTemplate', () => {
  const originalShareUrl = useEditorStore.getState().shareUrl;

  beforeEach(() => {
    mockCanvas.disposed = false;
    mockCanvas.destroyed = false;
    mockCanvas.toObject.mockClear();
    mockCanvas.loadFromJSON.mockReset().mockResolvedValue(undefined);
    mockRunHistoryTransaction.mockReset().mockImplementation(async task => {
      await task();
    });
    mockConfirm.mockReset().mockResolvedValue(true);
    mockSuccess.mockReset();
    mockError.mockReset();
    mockPreloadFonts.mockReset().mockResolvedValue(undefined);
    mockStabilizeCanvasAfterLoad.mockReset().mockResolvedValue(undefined);

    useEditorStore.setState({
      block: [makeOldBlock()],
      images: [
        { id: 'old-block', file: [oldPhoto] },
        { id: 'nested-photo', file: [oldPhoto] },
        { id: 'unrelated-image', file: [oldPhoto] },
        { id: 'shareUrl', file: [oldPhoto] },
      ],
      backgroundColor: '#FFFFFF',
      titleData: { ...useEditorStore.getState().titleData },
      bodyData: { ...useEditorStore.getState().bodyData },
      selectedId: 'old-block',
      activeTab: 'template',
      isEdit: true,
      isDirty: false,
      invitationUuid: 'saved-invitation-uuid',
      invitationFolderId: 'saved-invitation-folder',
      imageFolderId: 'saved-image-folder',
      audioFolderId: 'saved-audio-folder',
      shareUrl: { ...originalShareUrl, title: '보존할 공유 제목' },
      hashFiles: ['old-hash::old-drive-id'],
    });
    useBgmStore.setState({
      selectedBgmId: 'saved-bgm-id',
      isLoop: true,
      volume: 0.73,
      audioFileId: 'saved-audio-file-id',
    });
  });

  it('확인 취소 시 포스터와 편집 상태를 바꾸지 않는다', async () => {
    mockConfirm.mockResolvedValue(false);
    const initialBlock = useEditorStore.getState().block;
    const initialImages = useEditorStore.getState().images;
    const { result } = renderHook(() => useInvitationTemplate());
    let applied!: boolean;

    await act(async () => {
      applied = await result.current.applyTemplate('test-template');
    });

    expect(applied).toBe(false);
    expect(mockCanvas.loadFromJSON).not.toHaveBeenCalled();
    expect(useEditorStore.getState().block).toBe(initialBlock);
    expect(useEditorStore.getState().images).toBe(initialImages);
    expect(useEditorStore.getState().isDirty).toBe(false);
  });

  it('확인 창이 열린 동안 중복 적용 요청을 막는다', async () => {
    mockConfirm.mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve(false), 0);
        })
    );
    const { result } = renderHook(() => useInvitationTemplate());
    let firstApply!: Promise<boolean>;

    await act(async () => {
      firstApply = result.current.applyTemplate('test-template');
      expect(result.current.applyTemplate('test-template')).resolves.toBe(
        false
      );
      expect(mockConfirm).toHaveBeenCalledTimes(1);
      await firstApply;
    });
    expect(result.current.isApplying).toBe(false);
  });

  it('전체 스냅샷을 히스토리 트랜잭션으로 복구하고 에디터 값은 보존한다', async () => {
    const initialShareUrl = useEditorStore.getState().shareUrl;
    const setStateSpy = jest.spyOn(useEditorStore, 'setState');
    const { result } = renderHook(() => useInvitationTemplate());

    await act(async () => {
      await result.current.applyTemplate('test-template');
    });

    const state = useEditorStore.getState();
    expect(setStateSpy).toHaveBeenCalledTimes(1);
    expect(state.block[0].id).toBe('new-page');
    expect(state.backgroundColor).toBe('#FAF8F2');
    expect(state.titleData.font).toBe('Hahmlet');
    expect(state.bodyData.font).toBe('SUIT');
    expect(state.selectedId).toBe('mainPoster');
    expect(state.activeTab).toBeNull();
    expect(state.isEdit).toBe(false);
    expect(state.isDirty).toBe(true);
    expect(state.invitationUuid).toBe('saved-invitation-uuid');
    expect(state.invitationFolderId).toBe('saved-invitation-folder');
    expect(state.imageFolderId).toBe('saved-image-folder');
    expect(state.audioFolderId).toBe('saved-audio-folder');
    expect(state.images.map(image => image.id)).toEqual([
      'unrelated-image',
      'shareUrl',
    ]);
    expect(state.shareUrl).toEqual(initialShareUrl);
    expect(state.hashFiles).toEqual(['old-hash::old-drive-id']);
    expect(useBgmStore.getState()).toMatchObject({
      selectedBgmId: 'saved-bgm-id',
      isLoop: true,
      volume: 0.73,
      audioFileId: 'saved-audio-file-id',
    });
    expect(mockCanvas.toObject).toHaveBeenCalledWith(
      expect.arrayContaining([
        'lockMovementX',
        'lockScalingY',
        'selectable',
        'slot',
        'slotFrameTop',
      ])
    );
    expect(mockCanvas.loadFromJSON).toHaveBeenCalledTimes(1);
    expect(mockStabilizeCanvasAfterLoad).toHaveBeenCalledTimes(1);
    expect(mockRunHistoryTransaction).toHaveBeenCalledWith(
      expect.any(Function),
      { save: true }
    );
    expect(mockSuccess).toHaveBeenCalledWith(
      '테스트 템플릿 템플릿을 적용했습니다.',
      expect.any(Object)
    );

    setStateSpy.mockRestore();
  });

  it('포스터 적용에 실패하면 캔버스 스냅샷을 복원하고 에디터 스토어를 유지한다', async () => {
    const snapshot = mockCanvas.toObject();
    const initialBlock = useEditorStore.getState().block;
    mockRunHistoryTransaction
      .mockImplementationOnce(async task => {
        await task();
        throw new Error('apply failed');
      })
      .mockImplementationOnce(async task => {
        await task();
      });
    const { result } = renderHook(() => useInvitationTemplate());

    await act(async () => {
      await result.current.applyTemplate('test-template');
    });

    expect(mockCanvas.loadFromJSON).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ objects: snapshot.objects })
    );
    expect(mockRunHistoryTransaction).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
      { save: false }
    );
    expect(useEditorStore.getState().block).toBe(initialBlock);
    expect(mockError).toHaveBeenCalledTimes(1);
  });

  it('오래된 블록에서 이미지 ID만 재귀 수집하고 공유 URL과 문구는 제외한다', () => {
    const ids = collectInvitationTemplateImageIds([makeOldBlock()]);

    expect(ids.has('old-block')).toBe(true);
    expect(ids.has('nested-photo')).toBe(true);
    expect(ids.has('shareUrl')).toBe(false);
    expect(ids.has('unrelated text')).toBe(false);
    expect(ids.has('/images/unrelated-copy.jpg')).toBe(false);
  });

  it('폰트 준비가 제한 시간 안에 끝나지 않으면 변경 없이 잠금을 풀어 재시도할 수 있다', async () => {
    jest.useFakeTimers();
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockPreloadFonts.mockReturnValue(new Promise<void>(() => {}));
    const initialBlock = useEditorStore.getState().block;
    const initialImages = useEditorStore.getState().images;
    const { result } = renderHook(() => useInvitationTemplate());
    let firstApply!: Promise<boolean>;

    try {
      await act(async () => {
        firstApply = result.current.applyTemplate('test-template');
        await Promise.resolve();
      });
      expect(mockPreloadFonts).toHaveBeenCalledTimes(1);
      expect(result.current.isApplying).toBe(true);

      await act(async () => {
        await jest.advanceTimersByTimeAsync(5000);
        await firstApply;
      });

      expect(result.current.isApplying).toBe(false);
      expect(mockCanvas.toObject).not.toHaveBeenCalled();
      expect(mockCanvas.loadFromJSON).not.toHaveBeenCalled();
      expect(useEditorStore.getState().block).toBe(initialBlock);
      expect(useEditorStore.getState().images).toBe(initialImages);
      expect(useEditorStore.getState().isDirty).toBe(false);
      expect(mockSuccess).not.toHaveBeenCalled();
      expect(mockError).toHaveBeenCalledTimes(1);

      mockPreloadFonts.mockResolvedValue(undefined);
      await act(async () => {
        await result.current.applyTemplate('test-template');
      });

      expect(mockCanvas.loadFromJSON).toHaveBeenCalledTimes(1);
      expect(mockSuccess).toHaveBeenCalledTimes(1);
    } finally {
      consoleError.mockRestore();
      jest.useRealTimers();
    }
  });

  it('폰트 준비 중 언마운트되면 기존 포스터와 스토어를 유지한다', async () => {
    let releaseFontLoad!: () => void;
    mockPreloadFonts.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          releaseFontLoad = resolve;
        })
    );
    const initialBlock = useEditorStore.getState().block;
    const initialImages = useEditorStore.getState().images;
    const { result, unmount } = renderHook(() => useInvitationTemplate());
    let application!: Promise<boolean>;

    await act(async () => {
      application = result.current.applyTemplate('test-template');
      await Promise.resolve();
    });
    expect(mockPreloadFonts).toHaveBeenCalledTimes(1);

    unmount();
    await act(async () => {
      releaseFontLoad();
      await application;
    });

    expect(mockCanvas.toObject).not.toHaveBeenCalled();
    expect(mockCanvas.loadFromJSON).not.toHaveBeenCalled();
    expect(useEditorStore.getState().block).toBe(initialBlock);
    expect(useEditorStore.getState().images).toBe(initialImages);
    expect(useEditorStore.getState().isDirty).toBe(false);
    expect(mockSuccess).not.toHaveBeenCalled();
  });
});
