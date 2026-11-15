import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { showcaseItems } from '@/app/(home)/components/showcaseItems';
import { buildShowcaseInvitation } from '@/shared/data/buildShowcaseInvitation';
import { SHOWCASE_INVITATIONS } from '@/shared/data/showcaseInvitations';

import ShowcaseDocument from './ShowcaseDocument';

import type GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';
import type { ComponentProps } from 'react';

const mockReducedMotion = jest.fn(() => false);
jest.mock(
  '@/components/organisms/gallery/hooks/usePrefersReducedMotion',
  () => ({ usePrefersReducedMotion: () => mockReducedMotion() })
);
jest.mock('@/app/guest/[id]/components/GuestRenderer', () => ({
  __esModule: true,
  default: ({ blocks, renderBlock }: ComponentProps<typeof GuestRenderer>) => (
    <div>
      {blocks.map(block => (
        <div key={block.id}>
          {renderBlock?.(block, <p>{block.component} 블록 내용</p>)}
        </div>
      ))}
    </div>
  ),
}));

const design = SHOWCASE_INVITATIONS[4];
function renderInvitation() {
  return render(
    <ShowcaseDocument
      {...buildShowcaseInvitation(design)}
      design={design}
      cover={showcaseItems[4].image}
      coverAlt={showcaseItems[4].alt}
    />
  );
}

describe('받아서 펼쳐 보는 초대장', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockReducedMotion.mockReturnValue(false);
    jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('봉투를 열면 초대장과 기존 블록이 나타나고, 다시 접으면 열기 버튼으로 돌아온다', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderInvitation();
    expect(
      screen.getByRole('heading', { name: '소중한 당신께,' })
    ).toBeVisible();
    expect(screen.getByText('greeting 블록 내용')).not.toBeVisible();
    await user.click(
      screen.getByRole('button', { name: '로맨틱 레터 초대장 열기' })
    );
    act(() => jest.advanceTimersByTime(720));
    act(() => jest.advanceTimersByTime(20));
    expect(
      screen.getByRole('heading', { name: '민성 그리고 아현' })
    ).toBeVisible();
    expect(screen.getByText('greeting 블록 내용')).toBeVisible();
    expect(screen.getByRole('region', { name: 'THE TWO OF US' })).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: '초대장 다시 접어 두기' })
    );
    act(() => jest.advanceTimersByTime(20));
    expect(
      screen.getByRole('button', { name: '로맨틱 레터 초대장 열기' })
    ).toHaveFocus();
    expect(screen.getByText('greeting 블록 내용')).not.toBeVisible();
  });

  it('키보드로 열 수 있고 모션을 줄이는 환경에서는 기다림 없이 본문을 표시한다', async () => {
    mockReducedMotion.mockReturnValue(true);
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderInvitation();
    screen.getByRole('button', { name: '로맨틱 레터 초대장 열기' }).focus();
    await user.keyboard('{Enter}');
    act(() => jest.advanceTimersByTime(0));
    expect(screen.getByText('greeting 블록 내용')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: '로맨틱 레터 초대장 열기' })
    ).not.toBeInTheDocument();
  });

  it('사진 팝업에서 누른 Escape가 바깥의 초대장까지 닫지 않게 한다', () => {
    renderInvitation();
    const popup = document.createElement('div');
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    document.body.appendChild(popup);
    const escape = new KeyboardEvent('keydown', {
      key: 'Escape',
      cancelable: true,
    });
    window.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(true);
    popup.remove();
  });
});
