import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

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
    const { fill, unoptimized, ...rest } = props;
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
const mockSlideNodes = jest.fn(() => []);
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
  canScrollPrev: mockCanScrollPrev,
  canScrollNext: mockCanScrollNext,
  selectedScrollSnap: mockSelectedScrollSnap,
  slideNodes: mockSlideNodes,
  on: mockOn,
  off: mockOff,
  reInit: mockReInit,
  scrollProgress: jest.fn(() => 0),
};

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [jest.fn(), mockEmblaApi],
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
      mockCanScrollPrev.mockReturnValueOnce(false);
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

  describe('드래그(스와이프) 시 클릭 방지 기능', () => {
    it('드래그/스와이프 중(Embla scroll 발생)일 때 imageClick이 호출되지 않아야 함', () => {
      const mockImageClick = jest.fn();

      render(
        <GalleryType1
          preview={['https://example.com/1.jpg', 'https://example.com/2.jpg']}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={false}
        />
      );

      // Embla drag interaction simulation
      eventHandlers['pointerDown']?.forEach(cb => cb());
      eventHandlers['scroll']?.forEach(cb => cb());

      const slideButton = screen.getByRole('button', { name: 'slide-0' });
      fireEvent.click(slideButton);

      expect(mockImageClick).not.toHaveBeenCalled();
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
      fireEvent.click(slideButton);

      expect(mockImageClick).toHaveBeenCalledWith(0);
    });
  });

  describe('각 Gallery 템플릿(Type1~Type5) 캐러셀 렌더링', () => {
    const images = ['https://example.com/1.jpg', 'https://example.com/2.jpg'];
    const mockImageClick = jest.fn();

    it('GalleryType2 렌더링 및 네비게이션 버튼 표시', () => {
      render(
        <GalleryType2
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={true}
        />
      );
      expect(
        screen.getByRole('button', { name: '이전 사진' })
      ).toBeInTheDocument();
    });

    it('GalleryType3 렌더링 및 네비게이션 버튼 표시', () => {
      render(
        <GalleryType3
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={true}
        />
      );
      expect(
        screen.getByRole('button', { name: '이전 사진' })
      ).toBeInTheDocument();
    });

    it('GalleryType4 렌더링 및 네비게이션 버튼 표시', () => {
      render(
        <GalleryType4
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={true}
        />
      );
      expect(
        screen.getByRole('button', { name: '이전 사진' })
      ).toBeInTheDocument();
    });

    it('GalleryType5 렌더링 및 네비게이션 버튼 표시', () => {
      render(
        <GalleryType5
          preview={images}
          ratio="1:1"
          imageClick={mockImageClick}
          isAutoPlay={true}
        />
      );
      expect(
        screen.getByRole('button', { name: '이전 사진' })
      ).toBeInTheDocument();
    });
  });

  describe('GalleryPreview 캐러셀 렌더링', () => {
    it('이미지가 2장 이상일 때 네비게이션 버튼이 노출되어야 함', () => {
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
          isPopupViewer: false,
          isSubTitle: true,
          isAutoPlay: true,
        },
      };

      render(
        <GalleryPreview
          blockInfo={mockBlock}
          className=""
          onClick={() => {}}
        />
      );

      expect(
        screen.getByRole('button', { name: '이전 사진' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '다음 사진' })
      ).toBeInTheDocument();
    });
  });
});
