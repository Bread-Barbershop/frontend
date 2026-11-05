import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { PicturePopViewer } from '@/components/molecules/picture/PicturePopViewer';
import Gallery from '@/components/organisms/gallery/Gallery';
import { gallerySchema } from '@/components/organisms/gallery/Gallery.schema';
import GalleryNavButtons from '@/components/organisms/gallery/components/GalleryNavButtons';
import GalleryType1 from '@/components/organisms/gallery/components/GalleryType1';
import GalleryType2 from '@/components/organisms/gallery/components/GalleryType2';
import GalleryType3 from '@/components/organisms/gallery/components/GalleryType3';
import GalleryType4 from '@/components/organisms/gallery/components/GalleryType4';
import GalleryType5 from '@/components/organisms/gallery/components/GalleryType5';
import GalleryPreview from '@/components/organisms/gallery/GalleryPreview';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

jest.mock('@/shared/store/editorStore/useEditorStore');

// Mock SVG icons
jest.mock('@/shared/assets/icons/slideArrow.svg', () => ({
  __esModule: true,
  default: (props: any) => <svg data-testid="slide-arrow" {...props} />,
}));
jest.mock('@/shared/assets/icons/loadingSpinner.svg', () => ({
  __esModule: true,
  default: (props: any) => <svg data-testid="loading-spinner" {...props} />,
}));
jest.mock('@/shared/assets/icons/add.svg', () => ({
  __esModule: true,
  default: (props: any) => <svg data-testid="add-icon" {...props} />,
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { fill, unoptimized, priority, ...rest } = props;
    void priority;
    void fill;
    void unoptimized;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={(rest.alt as string) || ''} {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

// Mock useResolvedImageSources
jest.mock('@/shared/hooks/useResolvedImageSources', () => ({
  useResolvedImageSources: (images: unknown[]) =>
    Array.isArray(images) ? images : [],
}));

// Mock embla-carousel-react
const mockScrollPrev = jest.fn();
const mockScrollNext = jest.fn();
const mockCanScrollPrev = jest.fn(() => true);
const mockCanScrollNext = jest.fn(() => true);
const mockSelectedScrollSnap = jest.fn(() => 0);
const mockSlideNodes = jest.fn(() => [] as HTMLElement[]);
const eventHandlers: Record<string, (() => void)[]> = {};
const mockOn = jest.fn((evt: string, cb: () => void) => {
  if (!eventHandlers[evt]) eventHandlers[evt] = [];
  eventHandlers[evt].push(cb);
  return mockEmblaApi;
});
const mockOff = jest.fn((evt: string, cb: () => void) => {
  if (eventHandlers[evt]) {
    eventHandlers[evt] = eventHandlers[evt].filter(fn => fn !== cb);
  }
  return mockEmblaApi;
});
const mockReInit = jest.fn();

const mockEmblaApi = {
  scrollPrev: mockScrollPrev,
  scrollNext: mockScrollNext,
  scrollTo: jest.fn(),
  canScrollPrev: mockCanScrollPrev,
  canScrollNext: mockCanScrollNext,
  selectedScrollSnap: mockSelectedScrollSnap,
  slideNodes: mockSlideNodes,
  on: mockOn,
  off: mockOff,
  reInit: mockReInit,
  scrollProgress: jest.fn(() => 0),
};

const mockUseEmblaCarousel = jest.fn((...args: any[]) => {
  void args;
  return [jest.fn(), mockEmblaApi];
});

function dispatchPointerEvent(
  target: Element | Window,
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  { pointerId = 1, button = 0, isPrimary = true, clientX = 0, clientY = 0 } = {}
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    button: { value: button },
    isPrimary: { value: isPrimary },
    clientX: { value: clientX },
    clientY: { value: clientY },
  });
  fireEvent(target, event);
}

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: (...args: any[]) => mockUseEmblaCarousel(...args),
}));

jest.mock('embla-carousel-auto-scroll', () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

describe('갤러리 캐러셀 기능 및 필름 효과 테스트', () => {
  const mockUpdateBlock = jest.fn();
  const mockUpdateImage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCanScrollPrev.mockReturnValue(true);
    mockCanScrollNext.mockReturnValue(true);
    mockSlideNodes.mockReturnValue([]);
    mockEmblaApi.scrollProgress.mockReturnValue(0);
    (useEditorStore as unknown as jest.Mock).mockReturnValue({
      block: [],
      images: [],
      updateBlock: mockUpdateBlock,
      updateImage: mockUpdateImage,
    });
  });

  describe('Gallery.schema.ts', () => {
    it('isAutoPlay 필드가 정의되어 있고 기본값은 false여야 함', () => {
      expect(gallerySchema.fields.isAutoPlay).toBeDefined();
      expect(gallerySchema.fields.isAutoPlay.default).toBe(false);
      expect(gallerySchema.fields.isAutoPlay.required).toBe(false);
    });
  });

  describe('GalleryNavButtons 컴포넌트', () => {
    it('이전/다음 버튼이 렌더링되고 클릭 시 scrollPrev/scrollNext가 호출되어야 함', () => {
      render(<GalleryNavButtons emblaApi={mockEmblaApi as any} show={true} />);

      const prevBtn = screen.getByRole('button', { name: '이전 사진' });
      const nextBtn = screen.getByRole('button', { name: '다음 사진' });

      expect(prevBtn).toBeInTheDocument();
      expect(nextBtn).toBeInTheDocument();

      fireEvent.click(prevBtn);
      expect(mockScrollPrev).toHaveBeenCalledTimes(1);

      fireEvent.click(nextBtn);
      expect(mockScrollNext).toHaveBeenCalledTimes(1);
    });

    it('canScrollPrev가 false이면 이전 버튼이 disabled되어야 함', () => {
      mockCanScrollPrev.mockReturnValue(false);
      render(<GalleryNavButtons emblaApi={mockEmblaApi as any} show={true} />);

      const prevBtn = screen.getByRole('button', { name: '이전 사진' });
      expect(prevBtn).toBeDisabled();
    });
  });

  describe('Gallery 편집기 (추가기능)', () => {
    it('추가기능에 필름 효과 체크박스가 표시되고 클릭 시 updateBlock이 호출되어야 함', () => {
      const mockBlock: EditorBlock<'gallery'> = {
        id: 'gallery-test-1',
        type: 'wedding',
        component: 'gallery',
        props: {
          title: '갤러리',
          subTitle: 'GALLERY',
          images: [],
          template: 'galleryType1',
          ratio: '1:1',
          isPopupViewer: false,
          isSubTitle: true,
          isAutoPlay: false,
        },
      };

      (useEditorStore as unknown as jest.Mock).mockReturnValue({
        block: [mockBlock],
        images: [{ id: 'gallery-test-1', file: [] }],
        updateBlock: mockUpdateBlock,
        updateImage: mockUpdateImage,
      });

      render(<Gallery blockInfo={mockBlock} id="gallery-test-1" />);

      const checkbox = screen.getByLabelText(
        '필름 효과 (천천히 무한 반복 재생)'
      );
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);

      expect(mockUpdateBlock).toHaveBeenCalledWith('gallery-test-1', {
        isAutoPlay: true,
      });
    });
  });

  describe('실제 포인터 드래그와 클릭 구분', () => {
    it('Embla scroll이나 포인터 hover 이동만으로는 클릭을 막지 않는다', () => {
      const mockImageClick = jest.fn();

      render(
        <GalleryType1
          preview={['https://example.com/1.jpg', 'https://example.com/2.jpg']}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={false}
        />
      );

      // 자동 재생 scroll 이벤트만으로는 사용자 drag로 간주하지 않는다.
      eventHandlers['pointerDown']?.forEach(cb => cb());
      eventHandlers['scroll']?.forEach(cb => cb());
      dispatchPointerEvent(window, 'pointermove', { clientX: 20 });

      const slideButton = screen.getByRole('button', { name: 'slide-0' });
      fireEvent.click(slideButton, { detail: 1 });

      expect(mockImageClick).toHaveBeenCalledWith(0);
    });

    it('실제 드래그 직후 click은 막고 다음 일반 tap은 허용한다', () => {
      const mockImageClick = jest.fn();

      render(
        <GalleryType1
          preview={['https://example.com/1.jpg', 'https://example.com/2.jpg']}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={false}
        />
      );

      const slideButton = screen.getByRole('button', { name: 'slide-0' });
      dispatchPointerEvent(slideButton, 'pointerdown', { clientX: 0 });
      dispatchPointerEvent(window, 'pointermove', { clientX: 12 });
      dispatchPointerEvent(window, 'pointerup', { clientX: 12 });
      fireEvent.click(slideButton, { detail: 1 });
      expect(mockImageClick).not.toHaveBeenCalled();

      dispatchPointerEvent(slideButton, 'pointerdown', { clientX: 12 });
      dispatchPointerEvent(window, 'pointerup', { clientX: 12 });
      fireEvent.click(slideButton, { detail: 1 });
      expect(mockImageClick).toHaveBeenCalledWith(0);
    });

    it('단순 탭/클릭 시에는 imageClick이 정상 호출되어야 함', () => {
      const mockImageClick = jest.fn();

      render(
        <GalleryType1
          preview={['https://example.com/1.jpg', 'https://example.com/2.jpg']}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={false}
        />
      );

      const slideButton = screen.getByRole('button', { name: 'slide-0' });
      fireEvent.click(slideButton, { detail: 1 });

      expect(mockImageClick).toHaveBeenCalledWith(0);
    });
  });

  describe('각 Gallery 템플릿(Type1~Type5) 캐러셀 렌더링', () => {
    const images = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];
    const mockImageClick = jest.fn();

    it('GalleryType2가 정상 렌더링되고 슬라이드 카드가 표시된다', () => {
      render(
        <GalleryType2
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={true}
        />
      );
      const slideButtons = screen.getAllByRole('button').filter(el =>
        el.getAttribute('role') === 'button'
      );
      expect(slideButtons.length).toBeGreaterThan(0);
    });

    it('GalleryType3가 정상 렌더링되고 슬라이드 카드가 표시된다', () => {
      render(
        <GalleryType3
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={true}
        />
      );
      const slideButtons = screen.getAllByRole('button').filter(el =>
        el.getAttribute('role') === 'button'
      );
      expect(slideButtons.length).toBeGreaterThan(0);
    });

    it('GalleryType4가 정상 렌더링되고 슬라이드 카드가 표시된다', () => {
      render(
        <GalleryType4
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={true}
        />
      );
      const slideButtons = screen.getAllByRole('button').filter(el =>
        el.getAttribute('role') === 'button'
      );
      expect(slideButtons.length).toBeGreaterThan(0);
    });

    it('GalleryType5가 정상 렌더링되고 슬라이드 카드가 표시된다', () => {
      render(
        <GalleryType5
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={true}
        />
      );
      const slideButtons = screen.getAllByRole('button').filter(el =>
        el.getAttribute('role') === 'button'
      );
      expect(slideButtons.length).toBeGreaterThan(0);
    });

    it('사진이 소량(예: 2~5장)이어도 끊김 없는 무한 롤링을 위해 슬라이드가 충분한 개수로 반복 렌더링된다', () => {
      // 수동 스와이프(isAutoPlay=false): 최소 5개 기준 (2장 -> 6장)
      const { container: manualContainer } = render(
        <GalleryType1
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={false}
        />
      );
      const manualSlides = manualContainer.querySelectorAll('.flex-\\[0_0_50\\%\\]');
      expect(manualSlides.length).toBeGreaterThanOrEqual(12);

      // 자동 재생(isAutoPlay=true): 최소 8개 기준 (2장 -> 8장)
      const { container: autoContainer } = render(
        <GalleryType1
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={true}
        />
      );
      const autoSlides = autoContainer.querySelectorAll('.flex-\\[0_0_50\\%\\]');
      expect(autoSlides.length).toBeGreaterThanOrEqual(12);
    });
  });

  describe('갤러리 포커스 애니메이션 경계 회귀 테스트', () => {
    const images = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];

    it('Type3는 넓은 뷰포트에서도 접힌 카드 폭에 맞춰 충분한 슬라이드를 확보한다', () => {
      const originalRect = HTMLElement.prototype.getBoundingClientRect;
      HTMLElement.prototype.getBoundingClientRect = jest.fn(
        () => ({ width: 1440, height: 240 } as DOMRect)
      );
      try {
        const { container } = render(
          <GalleryType3 preview={images} ratio="1:1" imageClick={jest.fn()} />
        );
        // 1440px 양쪽 버퍼와 선택 카드의 추가 폭을 고려한 최소 개수.
        expect(container.querySelectorAll('[data-card]').length).toBeGreaterThanOrEqual(77);
      } finally {
        HTMLElement.prototype.getBoundingClientRect = originalRect;
      }
    });

    it('Type1은 reduced-motion에서도 선택 카드 대비를 유지하되 전환 애니메이션을 제거한다', () => {
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));
      try {
        const { container } = render(
          <GalleryType1 preview={images} ratio="1:1" imageClick={jest.fn()} />
        );
        const slideVisuals = container.querySelectorAll<HTMLElement>(
          '[class*="flex-[0_0_50%]"] > div'
        );
        expect(slideVisuals.length).toBeGreaterThan(1);
        expect(slideVisuals[0].style.transform).toBe('scale(1)');
        expect(slideVisuals[1].style.transform).toBe('scale(0.68)');
        expect(slideVisuals[1].style.opacity).toBe('0.75');
        expect(slideVisuals[1].style.transition).toBe('none');
      } finally {
        window.matchMedia = originalMatchMedia;
      }
    });

    it('Type2의 멀리 있는 슬라이드는 거리 2~3에서 투명도가 연속적으로 0에 수렴한다', () => {
      const { container } = render(
        <GalleryType2 preview={images} ratio="1:1" imageClick={jest.fn()} />
      );
      const slideVisuals = container.querySelectorAll<HTMLElement>(
        '[style*="transform-origin"]'
      );
      expect(slideVisuals.length).toBeGreaterThanOrEqual(8);
      // applyStyles는 Embla.slideNodes().length가 0이면 조기 반환한다.
      // 실제 렌더링된 노드를 mock에 연결해야 opacity 보간이 검증된다.
      const slideNodes = Array.from(slideVisuals, visual => visual.parentElement!);
      mockSlideNodes.mockReturnValue(slideNodes);
      const count = slideVisuals.length;
      const opacityAt = (distance: number) => {
        mockEmblaApi.scrollProgress.mockReturnValue(distance / count);
        act(() => {
          eventHandlers.scroll?.forEach(handler => handler());
        });
        return Number(slideVisuals[0].style.opacity);
      };
      const near = opacityAt(2.1);
      const farther = opacityAt(2.9);
      const hidden = opacityAt(3);
      expect(near).toBeGreaterThan(0);
      expect(near).toBeLessThan(0.3);
      expect(farther).toBeGreaterThan(0);
      expect(farther).toBeLessThan(near);
      expect(hidden).toBe(0);
      opacityAt(0);
      expect(slideNodes[0].classList.contains('pointer-events-none')).toBe(true);
      expect(Number(slideNodes[0].style.zIndex)).toBeGreaterThan(
        Number(slideNodes[1].style.zIndex)
      );
    });
  });

  describe('GalleryPreview 팝업 오버레이 및 네비게이션 버튼', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="preview-container"></div>';
    });

    it('isPopupViewer가 true일 때 이미지 클릭 시 오버레이가 열리고 < > 이전/다음 버튼이 노출된다', () => {
      const mockBlock: EditorBlock<'gallery'> = {
        id: 'gallery-test-2',
        type: 'wedding',
        component: 'gallery',
        props: {
          title: '갤러리',
          subTitle: 'GALLERY',
          images: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
          template: 'galleryType1',
          ratio: '1:1',
          isPopupViewer: true,
          isSubTitle: true,
          isAutoPlay: false,
        },
      };

      render(
        <GalleryPreview
          blockInfo={mockBlock}
          className=""
          onClick={() => {}}
        />
      );

      // 본문 템플릿에는 이전/다음 화살표 버튼이 없어야 함
      expect(
        screen.queryByRole('button', { name: '이전 사진' })
      ).not.toBeInTheDocument();

      // 슬라이드 카드 클릭하여 오버레이 팝업 열기
      const slideButtons = screen.getAllByRole('button').filter(el =>
        el.getAttribute('tabIndex') === '0'
      );
      fireEvent.click(slideButtons[0]);

      // 오버레이 다이얼로그와 이전/다음 버튼 노출 확인
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '이전 사진' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '다음 사진' })
      ).toBeInTheDocument();
    });
  });

  describe('키보드 접근성 (a11y) - role="button" Enter/Space 조작', () => {
    const images = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];
    const mockImageClick = jest.fn();

    beforeEach(() => {
      mockImageClick.mockClear();
    });

    it('GalleryType1에서 Enter 키를 누르면 imageClick이 호출된다', () => {
      render(
        <GalleryType1
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
        />
      );
      // Find slide buttons
      const slideButtons = screen.getAllByRole('button').filter(el =>
        el.getAttribute('tabIndex') === '0'
      );
      expect(slideButtons.length).toBeGreaterThan(0);

      fireEvent.keyDown(slideButtons[0], { key: 'Enter' });
      expect(mockImageClick).toHaveBeenCalledTimes(1);
      expect(mockImageClick).toHaveBeenCalledWith(0);
    });

    it('GalleryType1에서 Space 키를 누르면 imageClick이 호출되고 preventDefault된다', () => {
      render(
        <GalleryType1
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
        />
      );
      const slideButtons = screen.getAllByRole('button').filter(el =>
        el.getAttribute('tabIndex') === '0'
      );

      fireEvent.keyDown(slideButtons[0], { key: ' ' });
      expect(mockImageClick).toHaveBeenCalledTimes(1);
      expect(mockImageClick).toHaveBeenCalledWith(0);
    });


    it('필름 모드에서 복제된 슬라이드는 tabIndex=-1 및 aria-hidden=true가 적용되어 중복 포커스를 방지한다', () => {
      render(
        <GalleryType1
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={true}
        />
      );

      // 전체 slide card elements
      const allButtons = screen.getAllByRole('button', { hidden: true }).filter(el =>
        el.getAttribute('role') === 'button' && el.hasAttribute('tabIndex')
      );

      // 원본 개수(2개)만 tabIndex="0" 이어야 함
      const focusableButtons = allButtons.filter(el => el.getAttribute('tabIndex') === '0');
      expect(focusableButtons).toHaveLength(images.length);

      // 복제된 슬라이드들은 tabIndex="-1" 및 aria-hidden="true"
      const hiddenButtons = allButtons.filter(el => el.getAttribute('tabIndex') === '-1');
      expect(hiddenButtons.length).toBeGreaterThan(0);
      hiddenButtons.forEach(el => {
        expect(el.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('다른 키(예: ArrowDown, Tab)를 누를 때는 imageClick이 호출되지 않는다', () => {
      render(
        <GalleryType1
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
        />
      );
      const slideButtons = screen.getAllByRole('button').filter(el =>
        el.getAttribute('tabIndex') === '0'
      );

      fireEvent.keyDown(slideButtons[0], { key: 'ArrowDown' });
      fireEvent.keyDown(slideButtons[0], { key: 'Tab' });
      expect(mockImageClick).not.toHaveBeenCalled();
    });

    it('복제된 가상 슬라이드 클릭 시에도 올바른 원본 인덱스(i % preview.length)로 imageClick이 호출된다', () => {
      render(
        <GalleryType1
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={true}
        />
      );

      const hiddenButtons = screen.getAllByRole('button', { hidden: true }).filter(el =>
        el.getAttribute('tabIndex') === '-1'
      );
      expect(hiddenButtons.length).toBeGreaterThan(0);

      fireEvent.click(hiddenButtons[0]);
      expect(mockImageClick).toHaveBeenCalledWith(expect.any(Number));
      const clickedIndex = mockImageClick.mock.calls[0][0];
      expect(clickedIndex).toBeLessThan(images.length);
      expect(clickedIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('PicturePopViewer 무한 루프 wrap 동작 검증', () => {
    const testImages = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];
    it('이미지가 2장 이상일 때 loop: true로 초기화되고 네비게이션을 통해 경계 wrap이 동작한다', () => {
      render(
        <PicturePopViewer
          isOpen={true}
          images={testImages}
          ratio="1:1"
          startIndex={0}
          onClose={jest.fn()}
        />
      );

      const emblaCall = mockUseEmblaCarousel.mock.calls.find(
        call => call[0]?.loop === true
      );
      expect(emblaCall).toBeDefined();
      expect(emblaCall[0].loop).toBe(true);

      const prevBtn = screen.getByLabelText('이전 사진');
      const nextBtn = screen.getByLabelText('다음 사진');

      fireEvent.click(prevBtn);
      expect(mockScrollPrev).toHaveBeenCalled();

      fireEvent.click(nextBtn);
      expect(mockScrollNext).toHaveBeenCalled();
    });
  });
});
