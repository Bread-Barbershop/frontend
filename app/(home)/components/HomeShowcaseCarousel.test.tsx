import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ShowcasePreviewProvider from '@/features/showcase/components/ShowcasePreviewProvider';

import HomeShowcaseCarousel from './HomeShowcaseCarousel';
import { showcaseItems } from './showcaseItems';

const mockScroll = { play: jest.fn(), stop: jest.fn() };
const mockApi = {
  on: jest.fn(),
  off: jest.fn(),
  plugins: () => ({ autoScroll: mockScroll }),
  scrollSnapList: () => [0, 1],
};
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [undefined, mockApi],
}));

function renderShowcase() {
  render(
    <ShowcasePreviewProvider>
      <HomeShowcaseCarousel items={showcaseItems.slice(0, 2)} />
    </ShowcasePreviewProvider>
  );
  return screen.getByRole('button', {
    name: '어반 모노크롬 웨딩 초대장 미리보기',
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

it('쇼케이스는 선택된 카드 없이 흐르고, 카드에서 포인터를 떼면 이동을 재개한다', () => {
  const card = renderShowcase();
  expect(card).not.toHaveAttribute('aria-pressed');
  expect(
    screen.queryByRole('button', { name: '초대장 복사' })
  ).not.toBeInTheDocument();
  expect(mockScroll.play).toHaveBeenCalledTimes(1);
  fireEvent.pointerOver(card);
  expect(mockScroll.stop).toHaveBeenCalledTimes(1);
  fireEvent.pointerOut(card, { relatedTarget: document.body });
  expect(mockScroll.play).toHaveBeenCalledTimes(2);
});

it.each(['클릭', 'Enter'])(
  '%s하면 해당 초대장을 열고 미리보는 동안 이동을 멈춘다',
  async input => {
    const user = userEvent.setup();
    const card = renderShowcase();
    if (input === '클릭') {
      await user.click(card);
    } else {
      await user.tab();
      await user.tab();
      expect(card).toHaveFocus();
      await user.keyboard('{Enter}');
    }
    expect(screen.getByTitle('어반 모노크롬 초대장 내용')).toHaveAttribute(
      'src',
      '/showcase/showcase-1'
    );
    expect(mockScroll.stop).toHaveBeenCalled();
    const playCount = mockScroll.play.mock.calls.length;
    fireEvent.pointerOut(card, { relatedTarget: document.body });
    expect(mockScroll.play).toHaveBeenCalledTimes(playCount);
  }
);
