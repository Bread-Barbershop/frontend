import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PREVIEW_MESSAGE } from '@/features/invitation/preview/previewSnapshot';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import InvitationPreviewButton from './InvitationPreviewButton';

const mockExport = jest.fn(() => ({
  dataUrl: 'data:image/webp;base64,current-poster',
}));
jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricViewContext: () => ({ canvas: {} }),
  useFabricActionsContext: () => ({ exportCanvasPreview: mockExport }),
}));
jest.mock('@/components/organisms/bgm/context/EditorBgmPlayerContext', () => ({
  useEditorBgmPlayer: () => ({ isPlaying: false, togglePlay: jest.fn() }),
}));

describe('편집 화면 전체 초대장 미리보기', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    mockExport.mockReturnValue({
      dataUrl: 'data:image/webp;base64,current-poster',
    });
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  });
  afterEach(() => {
    useEditorStore.getState().reset();
    document.body.style.overflow = '';
    jest.restoreAllMocks();
  });

  it('저장 없이 현재 초대장을 모달에 전달하고 닫으면 편집 상태와 포커스를 유지한다', async () => {
    const user = userEvent.setup();
    act(() => {
      useEditorStore.getState().addBlock('wedding', 'afterParty', 'party');
      useEditorStore
        .getState()
        .updateBlock('party', { venue: '우리의 라운지' });
    });
    const original = useEditorStore.getState().block;
    render(<InvitationPreviewButton />);
    const button = screen.getByRole('button', { name: '미리보기' });
    await user.click(button);
    expect(
      screen.getByRole('dialog', { name: '초대장 미리보기' })
    ).toBeVisible();
    const frame = screen.getByTitle('초대장 미리보기') as HTMLIFrameElement;
    expect(frame).toHaveAttribute('src', '/preview/invitation');
    const send = jest.spyOn(frame.contentWindow!, 'postMessage');
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: window.location.origin,
        source: frame.contentWindow,
        data: { type: PREVIEW_MESSAGE.ready },
      })
    );
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PREVIEW_MESSAGE.snapshot,
        snapshot: expect.objectContaining({
          payload: expect.objectContaining({
            blocks: expect.arrayContaining([
              expect.objectContaining({
                props: expect.objectContaining({ venue: '우리의 라운지' }),
              }),
            ]),
          }),
        }),
      }),
      window.location.origin
    );
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: window.location.origin,
        source: frame.contentWindow,
        data: { type: PREVIEW_MESSAGE.rendered },
      })
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '미리보기 닫기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useEditorStore.getState().block).toBe(original);
    expect(button).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('현재 미리보기 프레임의 같은 출처 메시지만 닫기 요청으로 받는다', async () => {
    const user = userEvent.setup();
    render(<InvitationPreviewButton />);
    await user.click(screen.getByRole('button', { name: '미리보기' }));
    const frame = screen.getByTitle('초대장 미리보기') as HTMLIFrameElement;
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: 'https://other.example',
        source: frame.contentWindow,
        data: { type: PREVIEW_MESSAGE.close },
      })
    );
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: window.location.origin,
        source: window,
        data: { type: PREVIEW_MESSAGE.close },
      })
    );
    expect(screen.getByRole('dialog')).toBeVisible();
    fireEvent(
      window,
      new MessageEvent('message', {
        origin: window.location.origin,
        source: frame.contentWindow,
        data: { type: PREVIEW_MESSAGE.close },
      })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('포스터 준비에 실패해도 편집 내용을 보존하고 다시 미리볼 수 있다', async () => {
    const user = userEvent.setup();
    mockExport.mockImplementationOnce(() => {
      throw new Error('Poster is loading');
    });
    render(<InvitationPreviewButton />);
    await user.click(screen.getByRole('button', { name: '미리보기' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      '미리보기를 준비하지 못했어요.'
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '미리보기' }));
    expect(screen.getByRole('dialog')).toBeVisible();
  });
});
