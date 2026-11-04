import useEmblaCarousel from 'embla-carousel-react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { Image } from '@/components/atoms/image';
import GalleryNavButtons from '@/components/organisms/gallery/components/GalleryNavButtons';
import { cn } from '@/shared/utils/cn';

interface Props {
  isOpen: boolean;
  images: string[];
  ratio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  startIndex: number;
  onClose: () => void;
}

const emptySubscribe = () => () => {};

export const PicturePopViewer = ({
  isOpen,
  images,
  startIndex = 0,
  onClose,
  ratio = '1:1',
}: Props) => {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const pathname = usePathname();

  const initialIndex = useMemo(() => {
    if (!images.length) return 0;
    return Math.max(0, Math.min(startIndex, images.length - 1));
  }, [startIndex, images.length]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: initialIndex,
    loop: false,
    align: 'center',
    containScroll: 'trimSnaps',
    watchDrag: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // isOpen 또는 startIndex 변경 시 해당 슬라이드로 이동 (embla select 이벤트가 selectedIndex를 갱신)
  useEffect(() => {
    if (!isOpen || !emblaApi) return;
    const target = Math.max(0, Math.min(startIndex, images.length - 1));
    emblaApi.scrollTo?.(target, true);
  }, [isOpen, startIndex, emblaApi, images.length]);

  const ratioData = useMemo(() => {
    switch (ratio) {
      case '1:1':
        return { style: { aspectRatio: '1 / 1' }, value: 1 };
      case '4:3':
        return { style: { aspectRatio: '4 / 3' }, value: 4 / 3 };
      case '3:4':
        return { style: { aspectRatio: '3 / 4' }, value: 3 / 4 };
      case '16:9':
        return { style: { aspectRatio: '16 / 9' }, value: 16 / 9 };
      case '9:16':
        return { style: { aspectRatio: '9 / 16' }, value: 9 / 16 };
      default:
        return { style: { aspectRatio: '1 / 1' }, value: 1 };
    }
  }, [ratio]);

  // 키보드 조작: Escape(닫기), ArrowLeft(이전), ArrowRight(다음)
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        emblaApi?.scrollPrev();
      } else if (e.key === 'ArrowRight') {
        emblaApi?.scrollNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, emblaApi]);

  if (!isOpen || !isClient) return null;

  const portalElement =
    document.getElementById('preview-container') ||
    (typeof document !== 'undefined' ? document.body : null);
  if (!portalElement) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="사진 확대 보기"
      className={cn(
        'inset-0 z-50 bg-black/75 backdrop-blur-[2px] flex justify-center items-center flex-col px-4 select-none',
        pathname?.startsWith('/editor') ? 'absolute' : 'fixed'
      )}
      onClick={onClose}
    >
      {/* 닫기 (X) 버튼 */}
      <button
        type="button"
        aria-label="닫기"
        onClick={e => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white transition-all cursor-pointer"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* 이미지 뷰어 컨테이너 */}
      <div
        className={cn(
          'w-full relative mx-auto flex items-center justify-center'
        )}
        style={{
          ...ratioData.style,
          maxWidth: `calc(85vh * ${ratioData.value})`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Embla 캐러셀 뷰포트 */}
        <div
          className="relative w-full h-full overflow-hidden rounded-lg bg-black/20"
          ref={emblaRef}
        >
          <div className="flex h-full touch-pan-y">
            {images.map((src, idx) => (
              <div
                key={idx}
                className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center select-none"
              >
                <Image
                  src={src}
                  alt={`팝업 이미지 ${idx + 1}`}
                  fill
                  className="object-cover select-none pointer-events-none"
                  draggable={false}
                  priority={idx === selectedIndex}
                />
              </div>
            ))}
            {images.length === 0 && (
              <div className="w-full h-full bg-gray-900 text-white flex-center">
                이미지를 불러올 수 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 이전 / 다음 (< >) 버튼 */}
        {images.length > 1 && (
          <GalleryNavButtons
            emblaApi={emblaApi}
            className="pointer-events-none"
            buttonClassName="w-10 h-10 bg-black/50 hover:bg-black/80 text-white border-white/20 shadow-lg active:scale-90"
          />
        )}
      </div>

      {/* 페이지 인디케이터 (1 / 5) */}
      {images.length > 1 && (
        <div className="mt-3 px-3 py-1 bg-black/50 backdrop-blur-sm text-white/90 text-xs font-medium rounded-full pointer-events-none">
          {selectedIndex + 1} / {images.length}
        </div>
      )}
    </div>,
    portalElement
  );
};
