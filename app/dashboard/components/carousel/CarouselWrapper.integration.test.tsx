import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toDataURL } from 'qrcode';

import type { InviteListItem } from '@/app/dashboard/types';
import {
  parsePreviewSnapshot,
  PREVIEW_MESSAGE,
} from '@/features/invitation/preview/previewSnapshot';

import CarouselWrapper from './CarouselWrapper';
import { sourceInvitation } from './fixtures/dashboardCopyInvitations';
import { privateInvite, savedPayload } from './fixtures/invitationPreview';
import {
  baseGroup,
  familyGroup,
  shareAudienceResponse,
  shareInvite,
  workGroup,
} from './fixtures/shareAudiences';

jest.mock('qrcode', () => ({ toDataURL: jest.fn() }));

const mockRouter = { push: jest.fn(), replace: jest.fn(), refresh: jest.fn() };
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

describe('대시보드 초대장', () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();

  beforeEach(() => {
    mockRouter.push.mockClear();
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

  describe('행사 카드 삭제', () => {
    const weddingInvite = {
      ...privateInvite,
      displayTitle: '민서·지훈 결혼식',
    };
    const optionsUrl = `/api/drive/invitationAudiences?folderId=${weddingInvite.folderId}&view=editor-options`;

    async function openDeleteDialog(invite: InviteListItem = weddingInvite) {
      const user = userEvent.setup();
      render(
        <div id="app-root">
          <CarouselWrapper
            initialInvites={[sourceInvitation, invite]}
            loadOnMount={false}
          />
        </div>
      );
      const card = await screen.findByRole('button', {
        name: invite.displayTitle ?? invite.name,
      });
      await user.click(card);
      const trigger = await screen.findByRole('button', {
        name: '초대장 삭제',
      });
      await user.click(trigger);
      return { user, trigger, dialog: screen.getByRole('dialog') };
    }

    it('행사 제목과 함께 삭제될 그룹 이름·개수와 링크 영향을 표시하고 원본 폴더만 삭제한다', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ audiences: [familyGroup, workGroup] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });
      const { user, dialog } = await openDeleteDialog();
      expect(dialog).toHaveAccessibleName(
        '‘민서·지훈 결혼식’ 전체를 삭제할까요?'
      );
      expect(dialog).toHaveAccessibleDescription(
        '기본 초대장과 하객 그룹 2개(가족용·직장용)가 함께 삭제돼요. 이미 보낸 링크로도 초대장을 열 수 없어요.'
      );
      await waitFor(() =>
        expect(screen.getByRole('button', { name: '취소' })).toHaveFocus()
      );
      expect(mockFetch.mock.calls.map(([url]) => url)).toEqual([optionsUrl]);
      await user.click(
        screen.getByRole('button', { name: '초대장 전체 삭제' })
      );
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith(
        '/api/drive/deleteInvitation',
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ folderId: weddingInvite.folderId }),
        })
      );
      expect(
        screen.queryByRole('button', { name: weddingInvite.displayTitle })
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: sourceInvitation.name })
      ).toBeVisible();
    });

    it('기본 초대장 하나면 간결하게 표시하고 취소하면 휴지통으로 포커스를 돌려준다', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ audiences: [] }),
      });
      const { user, trigger, dialog } = await openDeleteDialog({
        ...privateInvite,
        name: '하은 돌잔치',
      });
      expect(dialog).toHaveAccessibleName('‘하은 돌잔치’ 초대장을 삭제할까요?');
      expect(dialog).toHaveAccessibleDescription(
        '이미 보낸 링크로도 초대장을 열 수 없어요.'
      );
      expect(screen.getByRole('button', { name: '초대장 삭제' })).toBeEnabled();
      await waitFor(() =>
        expect(screen.getByRole('button', { name: '취소' })).toHaveFocus()
      );
      await user.keyboard('{Enter}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('그룹을 확인하는 동안 삭제할 수 없고 취소한 조회의 응답은 다음 확인창에 반영되지 않는다', async () => {
      let finish!: () => void;
      mockFetch
        .mockImplementationOnce(
          () =>
            new Promise(resolve => {
              finish = () =>
                resolve({ ok: true, json: async () => ({ audiences: [] }) });
            })
        )
        .mockRejectedValueOnce(new Error('offline'));
      const { user, trigger } = await openDeleteDialog();
      expect(screen.getByRole('button', { name: '확인 중…' })).toBeDisabled();
      const signal = mockFetch.mock.calls[0][1].signal;
      await user.keyboard('{Escape}');
      expect(signal.aborted).toBe(true);
      await user.click(trigger);
      await act(async () => finish());
      const reopened = screen.getByRole('dialog');
      expect(reopened).toHaveAccessibleDescription(
        /하객 그룹 목록을 불러오지 못했어요.*모든 하객 그룹이 함께 삭제돼요/
      );
      expect(
        screen.getByRole('button', { name: '초대장 전체 삭제' })
      ).toBeEnabled();
      expect(mockFetch.mock.calls.map(([url]) => url)).toEqual([
        optionsUrl,
        optionsUrl,
      ]);
    });
  });

  async function renderEditButton() {
    render(
      <CarouselWrapper
        initialInvites={[
          { ...sourceInvitation, displayTitle: '민서·지훈 결혼식' },
        ]}
        loadOnMount={false}
      />
    );
    return screen.findByRole('button', { name: '재편집하기' });
  }

  it('기본 초대장 하나면 선택창 없이 바로 편집한다', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ audiences: [] }),
    });
    await user.click(await renderEditButton());
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/drive/invitationAudiences?folderId=source-folder&view=editor-options',
      expect.objectContaining({ cache: 'no-store' })
    );
    expect(mockRouter.push).toHaveBeenCalledWith(
      '/editor/source-folder?uuid=source-uuid'
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    ['기본 초대장', '/editor/source-folder?uuid=source-uuid'],
    ['직장용', '/editor/work-folder?uuid=aud_work'],
  ])('대표 카드 한 장에서 %s 편집기를 선택한다', async (name, href) => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        audiences: [
          {
            name: '가족용',
            slug: 'family',
            folderId: 'family-folder',
            invitationUuid: 'aud_family',
          },
          {
            name: '직장용',
            slug: 'work',
            folderId: 'work-folder',
            invitationUuid: 'aud_work',
          },
        ],
      }),
    });
    const trigger = await renderEditButton();
    expect(
      screen.queryByRole('button', { name: '직장용' })
    ).not.toBeInTheDocument();
    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: '어떤 초대장을 편집할까요?',
    });
    expect(dialog).toHaveAccessibleDescription('민서·지훈 결혼식');
    expect(screen.getByRole('button', { name: '가족용' })).toBeVisible();
    expect(mockRouter.push).not.toHaveBeenCalled();
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.click(await screen.findByRole('button', { name, exact: true }));
    expect(mockRouter.push).toHaveBeenCalledWith(href);
  });

  it('편집 버튼을 두 번 눌러도 한 번만 조회하고 다른 작업으로 옮기면 늦은 응답을 무시한다', async () => {
    const user = userEvent.setup();
    let finish!: () => void;
    mockFetch.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          finish = () =>
            resolve({ ok: true, json: async () => ({ audiences: [] }) });
        })
    );
    const trigger = await renderEditButton();
    await user.dblClick(trigger);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAccessibleName('그룹 확인 중…');
    await user.tab();
    expect(mockFetch.mock.calls[0][1].signal.aborted).toBe(true);
    await act(async () => finish());
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(trigger).toHaveAccessibleName('재편집하기');
  });

  it('그룹 조회에 실패하면 기본으로 이동하지 않고 다시 시도할 수 있다', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audiences: [] }),
      });
    const trigger = await renderEditButton();
    await user.click(trigger);
    expect(mockRouter.push).not.toHaveBeenCalled();
    await user.click(trigger);
    expect(mockRouter.push).toHaveBeenCalledWith(
      '/editor/source-folder?uuid=source-uuid'
    );
  });

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

  describe('하객별 링크와 QR 공유', () => {
    beforeEach(() => {
      (toDataURL as jest.Mock)
        .mockReset()
        .mockResolvedValue('data:image/png;base64,cXI=');
    });

    function showCard() {
      return render(
        <CarouselWrapper initialInvites={[shareInvite]} loadOnMount={false} />
      );
    }

    it.each([
      ['기본 초대장', 'http://localhost/i/wedding'],
      ['직장용', 'http://localhost/i/wedding?to=work'],
    ])(
      '%s을 선택한 뒤에만 같은 주소를 복사하고 QR을 만든다',
      async (name, url) => {
        const user = userEvent.setup();
        const copy = jest.spyOn(navigator.clipboard, 'writeText');
        mockFetch.mockResolvedValue(
          shareAudienceResponse([baseGroup, familyGroup, workGroup])
        );
        showCard();
        const trigger = await screen.findByRole('button', {
          name: 'URL 링크 공유하기',
        });
        await user.click(trigger);
        const picker = screen.getByRole('dialog', {
          name: '누구에게 보낼 초대장인가요?',
        });
        expect(picker).toHaveAccessibleDescription('민서·지훈 결혼식');
        expect(screen.getByRole('button', { name: '가족용' })).toBeVisible();
        fireEvent(picker, new Event('cancel', { cancelable: true }));
        expect(trigger).toHaveFocus();
        expect(copy).not.toHaveBeenCalled();
        expect(toDataURL).not.toHaveBeenCalled();
        await user.keyboard('{Enter}');
        await user.click(screen.getByRole('button', { name, exact: true }));
        expect(copy).toHaveBeenCalledTimes(1);
        expect(copy).toHaveBeenCalledWith(url);
        expect(screen.getByText(`민서·지훈 결혼식 · ${name}`)).toBeVisible();
        expect(
          screen.getByRole('textbox', { name: '초대장 링크' })
        ).toHaveValue(url);
        expect(screen.getByText(/비공개 초대장이에요/)).toBeVisible();
        expect(
          await screen.findByRole('img', { name: '초대장 공유 QR 코드' })
        ).toBeVisible();
        expect(toDataURL).toHaveBeenCalledWith(url, expect.any(Object));
        await user.click(screen.getByRole('button', { name: '닫기' }));
        expect(trigger).toHaveFocus();
      }
    );

    it('목록을 다시 불러온 뒤 기본 초대장만 있으면 한 번의 공유 클릭으로 복사한다', async () => {
      const user = userEvent.setup();
      const copy = jest.spyOn(navigator.clipboard, 'writeText');
      mockFetch
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce(shareAudienceResponse([baseGroup]));
      showCard();
      await user.click(
        await screen.findByRole('button', { name: '공유 다시 준비하기' })
      );
      expect(copy).not.toHaveBeenCalled();
      await user.click(
        await screen.findByRole('button', { name: 'URL 링크 공유하기' })
      );
      expect(copy).toHaveBeenCalledWith('http://localhost/i/wedding');
      expect(
        screen.queryByRole('dialog', { name: '누구에게 보낼 초대장인가요?' })
      ).not.toBeInTheDocument();
      expect(
        await screen.findByRole('img', { name: '초대장 공유 QR 코드' })
      ).toBeVisible();
      expect(toDataURL).toHaveBeenCalledWith(
        'http://localhost/i/wedding',
        expect.any(Object)
      );
    });
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
