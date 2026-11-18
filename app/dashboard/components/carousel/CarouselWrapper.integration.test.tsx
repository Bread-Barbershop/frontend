import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  parsePreviewSnapshot,
  PREVIEW_MESSAGE,
} from '@/features/invitation/preview/previewSnapshot';

import CarouselWrapper from './CarouselWrapper';
import { privateInvite, savedPayload } from './fixtures/invitationPreview';

const mockRouter = { replace: jest.fn(), refresh: jest.fn() };
jest.mock('next/navigation', () => ({ useRouter: () => mockRouter }));
jest.mock('@/shared/assets/icons/edit.svg', () => () => null);
jest.mock('@/shared/assets/icons/kakao2.svg', () => () => null);
jest.mock('@/shared/assets/icons/link.svg', () => () => null);
jest.mock('@/shared/assets/icons/preview.svg', () => () => null);

const mockEmblaApi = {
  selectedScrollSnap: () => 0,
  on: jest.fn(),
  off: jest.fn(),
  reInit: jest.fn(),
  scrollTo: jest.fn(),
};
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [jest.fn(), mockEmblaApi],
}));

const previewUrl = '/api/drive/previewInvitation?folderId=private-folder';
const previewResponse = {
  ok: true,
  json: async () => ({ ok: true, payload: savedPayload }),
};

function frameMessage(source: Window, type: string) {
  fireEvent(
    window,
    new MessageEvent('message', {
      data: { type },
      origin: window.location.origin,
      source,
    })
  );
}

describe('대시보드 초대장 미리보기', () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    jest.spyOn(window, 'Image').mockImplementation(() => {
      const image = document.createElement('img');
      queueMicrotask(() => image.dispatchEvent(new Event('load')));
      return image;
    });
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
      this.querySelector('button')?.focus();
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  async function renderDashboard() {
    render(
      <CarouselWrapper initialInvites={[privateInvite]} loadOnMount={false} />
    );
    return screen.findByRole('button', { name: '초대장 미리보기' });
  }

  it('키보드로 비공개 초대장을 열어 저장된 데이터를 공용 미리보기로 전달하고 닫으면 포커스를 복원한다', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(previewResponse);
    const trigger = await renderDashboard();

    trigger.focus();
    await user.keyboard('{Enter}');

    const dialog = screen.getByRole('dialog', { name: '초대장 미리보기' });
    expect(dialog).toHaveTextContent('저장된 초대장의 하객 화면이에요.');
    expect(mockFetch).toHaveBeenCalledWith(previewUrl, {
      cache: 'no-store',
      signal: expect.any(AbortSignal),
    });
    const frame = (await screen.findByTitle(
      '초대장 미리보기'
    )) as HTMLIFrameElement;
    expect(frame).toHaveAttribute('src', '/preview/invitation');
    const frameWindow = frame.contentWindow!;
    const postMessage = jest.spyOn(frameWindow, 'postMessage');
    frameMessage(frameWindow, PREVIEW_MESSAGE.ready);
    expect(postMessage).toHaveBeenCalledWith(
      {
        type: PREVIEW_MESSAGE.snapshot,
        snapshot: {
          payload: savedPayload,
          previewFolderId: privateInvite.folderId,
          localAudioSrc: null,
        },
      },
      window.location.origin
    );
    expect(parsePreviewSnapshot(postMessage.mock.calls[0][0].snapshot)).toEqual(
      {
        payload: savedPayload,
        previewFolderId: privateInvite.folderId,
        localAudioSrc: null,
      }
    );
    frameMessage(frameWindow, PREVIEW_MESSAGE.rendered);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '처음부터 보기' }));
    expect(screen.getByTitle('초대장 미리보기')).not.toBe(frame);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    frameMessage(frameWindow, PREVIEW_MESSAGE.rendered);
    expect(screen.getByRole('status')).toBeVisible();

    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('저장된 데이터를 읽지 못하면 같은 모달에서 다시 불러올 수 있다', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          ok: false,
          userMessage: '초대장 데이터를 불러오지 못했습니다.',
        }),
      })
      .mockResolvedValueOnce(previewResponse);
    const trigger = await renderDashboard();

    await user.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '초대장 데이터를 불러오지 못했습니다.'
    );
    expect(screen.queryByTitle('초대장 미리보기')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '다시 불러오기' }));
    expect(await screen.findByTitle('초대장 미리보기')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBe(dialog);
    expect(mockFetch).toHaveBeenLastCalledWith(previewUrl, expect.anything());
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('로딩 중 닫으면 요청을 취소하고 뒤늦게 도착한 응답을 무시한다', async () => {
    const user = userEvent.setup();
    let finishPrevious!: () => void;
    mockFetch
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            finishPrevious = () => resolve(previewResponse);
          })
      )
      .mockImplementationOnce(() => new Promise(() => {}));
    const trigger = await renderDashboard();

    await user.click(trigger);
    expect(screen.getByRole('status')).toHaveTextContent(
      '초대장을 준비하고 있어요.'
    );
    expect(screen.queryByTitle('초대장 미리보기')).not.toBeInTheDocument();
    const previousSignal = mockFetch.mock.calls[0][1].signal as AbortSignal;
    await user.click(screen.getByRole('button', { name: '미리보기 닫기' }));
    expect(previousSignal.aborted).toBe(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(trigger);
    await act(async () => finishPrevious());
    expect(screen.getByRole('status')).toHaveTextContent(
      '초대장을 준비하고 있어요.'
    );
    expect(screen.queryByTitle('초대장 미리보기')).not.toBeInTheDocument();
  });
});
