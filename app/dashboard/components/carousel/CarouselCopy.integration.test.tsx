import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useEmblaCarousel from 'embla-carousel-react';

import CarouselWrapper from './CarouselWrapper';
import {
  clonedInvitation,
  sourceInvitation,
} from './fixtures/dashboardCopyInvitations';

jest.mock('embla-carousel-react');
jest.mock('@/shared/assets/icons/edit.svg', () => ({
  __esModule: true,
  default: () => <svg />,
}));
jest.mock('@/shared/assets/icons/kakao2.svg', () => ({
  __esModule: true,
  default: () => <svg />,
}));
jest.mock('@/shared/assets/icons/link.svg', () => ({
  __esModule: true,
  default: () => <svg />,
}));
jest.mock('@/shared/assets/icons/preview.svg', () => ({
  __esModule: true,
  default: () => <svg />,
}));
jest.mock('next/navigation', () => {
  const router = { push: jest.fn(), replace: jest.fn(), refresh: jest.fn() };
  return { useRouter: () => router };
});
jest.mock('./controller/CarouselController', () => ({
  __esModule: true,
  default: () => null,
}));

const realFetch = global.fetch;
const mockFetch = jest.fn();

function showDashboard() {
  return render(
    <CarouselWrapper initialInvites={[sourceInvitation]} loadOnMount={false} />
  );
}

function cloneResponse(invite = clonedInvitation) {
  return {
    ok: true,
    json: async () => ({ success: true, invite }),
  };
}

describe('대시보드 초대장 복사', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    window.sessionStorage.clear();

    let viewport: HTMLElement | null = null;
    let selectedIndex = 0;
    const listeners = new Map<string, () => void>();
    const emblaApi = {
      selectedScrollSnap: () => selectedIndex,
      slideNodes: () => Array.from(viewport?.firstElementChild?.children ?? []),
      on: (event: string, listener: () => void) =>
        listeners.set(event, listener),
      off: (event: string) => listeners.delete(event),
      reInit: () => listeners.get('reInit')?.(),
      scrollTo: (index: number) => {
        selectedIndex = index;
        listeners.get('select')?.();
      },
    };

    jest.mocked(useEmblaCarousel).mockReturnValue([
      node => {
        viewport = node;
      },
      emblaApi as unknown as ReturnType<typeof useEmblaCarousel>[1],
    ]);
    jest.spyOn(window, 'Image').mockImplementation(() => {
      const image = document.createElement('img');
      Object.defineProperty(image, 'src', {
        set: () => {
          queueMicrotask(() => image.dispatchEvent(new Event('load')));
        },
      });
      return image;
    });
  });

  afterEach(() => {
    global.fetch = realFetch;
    jest.restoreAllMocks();
  });

  it('미리보기 위에 있는 복사 버튼을 키보드로 열고 취소하면 원래 버튼에 포커스가 돌아온다', async () => {
    const user = userEvent.setup();
    showDashboard();

    const trigger = await screen.findByRole('button', { name: '초대장 복사' });
    expect(trigger.nextElementSibling).toBe(
      screen.getByRole('button', { name: '초대장 미리보기' })
    );
    trigger.focus();
    await user.keyboard('{Enter}');

    const dialog = screen.getByRole('dialog', { name: /원본 초대장/ });
    expect(dialog).toHaveAccessibleDescription(
      '복사본은 비공개로 생성되며 따로 편집할 수 있어요.'
    );
    const cancel = within(dialog).getByRole('button', { name: '취소' });
    await waitFor(() => expect(cancel).toHaveFocus());
    await user.keyboard('{Escape}');

    expect(dialog).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('진행 중 중복 요청 없이 복사본을 비공개 카드로 표시하고 포커스를 옮긴다', async () => {
    const user = userEvent.setup();
    let resolveRequest!: () => void;
    mockFetch.mockReturnValue(
      new Promise(resolve => {
        resolveRequest = () => resolve(cloneResponse());
      })
    );
    showDashboard();

    await user.click(
      await screen.findByRole('button', { name: '초대장 복사' })
    );
    await user.click(screen.getByRole('button', { name: '복사', exact: true }));
    const busyButton = screen.getByRole('button', { name: '복사 중…' });
    expect(busyButton).toHaveAttribute('aria-disabled', 'true');
    await user.click(busyButton);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/drive/cloneInvitation');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toEqual({
      folderId: sourceInvitation.folderId,
      requestId: expect.any(String),
    });

    await act(async () => resolveRequest());

    const card = screen.getByRole('button', { name: clonedInvitation.name });
    expect(card).toHaveFocus();
    expect(
      within(card).getByRole('button', { name: '비공개' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: sourceInvitation.name })
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('복사에 실패하면 같은 요청 ID로 키보드에서 다시 시도할 수 있다', async () => {
    const user = userEvent.setup();
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: '잠시 후 다시 시도해 주세요.',
        }),
      })
      .mockResolvedValueOnce(cloneResponse());
    showDashboard();

    await user.click(
      await screen.findByRole('button', { name: '초대장 복사' })
    );
    await user.click(screen.getByRole('button', { name: '복사', exact: true }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '잠시 후 다시 시도해 주세요.'
    );

    const retry = screen.getByRole('button', { name: '다시 시도' });
    expect(retry).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][1].body).toBe(
      mockFetch.mock.calls[0][1].body
    );
    expect(
      await screen.findByRole('button', { name: clonedInvitation.name })
    ).toBeInTheDocument();
  });

  it('같은 원본을 새로 복사할 때는 별도 요청 ID를 사용한다', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce(cloneResponse()).mockResolvedValueOnce(
      cloneResponse({
        ...clonedInvitation,
        folderId: 'second-clone-folder',
        invitationUuid: 'second-clone-uuid',
        name: '두 번째 복사본',
      })
    );
    showDashboard();

    await user.click(
      await screen.findByRole('button', { name: '초대장 복사' })
    );
    await user.click(screen.getByRole('button', { name: '복사', exact: true }));
    await screen.findByRole('button', { name: clonedInvitation.name });

    const original = screen.getByRole('button', {
      name: sourceInvitation.name,
    });
    await user.click(original);
    await user.click(
      within(original).getByRole('button', { name: '초대장 복사' })
    );
    await user.click(screen.getByRole('button', { name: '복사', exact: true }));

    expect(
      await screen.findByRole('button', { name: '두 번째 복사본' })
    ).toBeInTheDocument();
    const [first, second] = mockFetch.mock.calls.map(([, options]) =>
      JSON.parse(options.body)
    );
    expect(first.folderId).toBe(second.folderId);
    expect(first.requestId).not.toBe(second.requestId);
  });
});
