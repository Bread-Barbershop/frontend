import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { showcaseItems } from '@/app/(home)/components/showcaseItems';

import CarouselBase from './CarouselBase';

const mockScrollTo = jest.fn();
const mockApi = {
  selectedScrollSnap: () => 0,
  on: jest.fn(),
  off: jest.fn(),
  reInit: jest.fn(),
  scrollTo: mockScrollTo,
};
jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [jest.fn(), mockApi],
}));
jest.mock('./controller/CarouselController', () => ({
  __esModule: true,
  default: () => null,
}));

describe('홈 캐러셀 카드 열기', () => {
  it('쇼케이스에는 초대장 복사 버튼을 표시하지 않는다', () => {
    render(<CarouselBase items={showcaseItems.slice(0, 1)} />);

    expect(screen.queryByRole('button', { name: '초대장 복사' })).not.toBeInTheDocument();
  });

  it('카드를 한 번 클릭하면 선택한 초대장의 미리보기를 연다', async () => {
    const user = userEvent.setup();
    const openPreview = jest.fn();
    render(
      <CarouselBase
        items={showcaseItems.slice(0, 2)}
        onCardActivate={openPreview}
      />
    );
    await user.click(
      screen.getByRole('button', { name: '어반 모노크롬 웨딩 초대장 미리보기' })
    );
    expect(openPreview).toHaveBeenCalledTimes(1);
    expect(openPreview).toHaveBeenCalledWith('showcase-1');
    expect(mockScrollTo).toHaveBeenCalledWith(1);
  });

  it('키보드 Enter로도 선택한 카드의 미리보기를 연다', async () => {
    const user = userEvent.setup();
    const openPreview = jest.fn();
    render(
      <CarouselBase
        items={showcaseItems.slice(0, 1)}
        onCardActivate={openPreview}
      />
    );
    screen
      .getByRole('button', { name: '클래식 모먼트 웨딩 초대장 미리보기' })
      .focus();
    await user.keyboard('{Enter}');
    expect(openPreview).toHaveBeenCalledTimes(1);
    expect(openPreview).toHaveBeenCalledWith('showcase-0');
  });
});
