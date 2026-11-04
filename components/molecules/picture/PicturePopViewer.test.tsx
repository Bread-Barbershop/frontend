import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { PicturePopViewer } from './PicturePopViewer';

const mockScrollPrev = jest.fn();
const mockScrollNext = jest.fn();
const mockScrollTo = jest.fn();
const mockCanScrollPrev = jest.fn(() => false);
const mockCanScrollNext = jest.fn(() => true);
const mockSelectedScrollSnap = jest.fn(() => 0);
const eventHandlers: Record<string, (() => void)[]> = {};

const mockEmblaApi = {
  scrollPrev: mockScrollPrev,
  scrollNext: mockScrollNext,
  scrollTo: mockScrollTo,
  canScrollPrev: mockCanScrollPrev,
  canScrollNext: mockCanScrollNext,
  selectedScrollSnap: mockSelectedScrollSnap,
  on: jest.fn((evt: string, cb: () => void) => {
    if (!eventHandlers[evt]) eventHandlers[evt] = [];
    eventHandlers[evt].push(cb);
    return mockEmblaApi;
  }),
  off: jest.fn((evt: string, cb: () => void) => {
    if (eventHandlers[evt]) {
      eventHandlers[evt] = eventHandlers[evt].filter(fn => fn !== cb);
    }
    return mockEmblaApi;
  }),
  reInit: jest.fn(),
};

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [jest.fn(), mockEmblaApi],
}));

jest.mock('@/shared/assets/icons/slideArrow.svg', () => ({
  __esModule: true,
  default: (props: any) => <svg data-testid="slide-arrow" {...props} />,
}));

jest.mock('@/components/atoms/image', () => ({
  Image: ({ alt, src }: { alt?: string; src: string }) => (
    <div data-testid="mock-image" data-src={src} aria-label={alt}>
      {alt}
    </div>
  ),
}));

describe('PicturePopViewer (오버레이 이미지 뷰어 캐러셀 및 스와이프)', () => {
  const mockImages = [
    'https://example.com/img1.jpg',
    'https://example.com/img2.jpg',
    'https://example.com/img3.jpg',
  ];
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Portal target div 설정
    document.body.innerHTML = '<div id="preview-container"></div>';
  });

  it('isOpen이 false이면 렌더링되지 않는다', () => {
    render(
      <PicturePopViewer
        isOpen={false}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('isOpen이 true이면 다이얼로그와 슬라이드 이미지들이 렌더링된다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('팝업 이미지 1')).toBeInTheDocument();
    expect(screen.getByLabelText('팝업 이미지 2')).toBeInTheDocument();
    expect(screen.getByLabelText('팝업 이미지 3')).toBeInTheDocument();
  });

  it('이미지가 2장 이상일 때 이전/다음 (< >) 버튼과 페이지 번호가 노출된다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('button', { name: '이전 사진' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다음 사진' })).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('이전/다음 버튼 클릭 시 emblaApi.scrollPrev 및 scrollNext가 호출된다', () => {
    mockCanScrollPrev.mockReturnValue(true);
    mockCanScrollNext.mockReturnValue(true);

    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    const prevButton = screen.getByRole('button', { name: '이전 사진' });
    const nextButton = screen.getByRole('button', { name: '다음 사진' });

    fireEvent.click(prevButton);
    expect(mockScrollPrev).toHaveBeenCalledTimes(1);

    fireEvent.click(nextButton);
    expect(mockScrollNext).toHaveBeenCalledTimes(1);
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '닫기' });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('Escape 키를 누르면 onClose가 호출된다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('ArrowLeft 및 ArrowRight 키를 누르면 이전/다음 사진으로 이동한다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={mockImages}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(mockScrollPrev).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(mockScrollNext).toHaveBeenCalledTimes(1);
  });

  it('이미지가 1장일 때는 이전/다음 버튼이 노출되지 않는다', () => {
    render(
      <PicturePopViewer
        isOpen={true}
        images={['https://example.com/single.jpg']}
        startIndex={0}
        ratio="1:1"
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByRole('button', { name: '이전 사진' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다음 사진' })).not.toBeInTheDocument();
  });
});
