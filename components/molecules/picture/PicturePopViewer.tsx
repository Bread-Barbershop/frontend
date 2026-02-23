import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/atoms/button';
import { Image } from '@/components/atoms/image';
import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';
import { cn } from '@/shared/utils/cn';

interface Props {
  isOpen: boolean;
  images: string[];
  ratio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  startIndex: number;
  onClose: () => void;
}

export const PicturePopViewer = ({
  isOpen,
  images,
  startIndex,
  onClose,
  ratio = '1:1',
}: Props) => {
  const [isMounted, setIsMounted] = useState(false);

  const ratioClass = useMemo(() => {
    switch (ratio) {
      case '1:1':
        return 'aspect-square';
      case '4:3':
        return 'aspect-[4/3]';
      case '3:4':
        return 'aspect-[3/4]';
      case '16:9':
        return 'aspect-[16/9]';
      case '9:16':
        return 'aspect-[9/16]';
      default:
        return 'aspect-square';
    }
  }, [ratio]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsMounted(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!isOpen || !isMounted) return null;

  const portalElement = document.getElementById('preview-container');
  if (!portalElement) return null;

  return createPortal(
    <div className="absolute inset-0 z-50 bg-black/80 flex-center">
      <Button
        type="button"
        className="group absolute top-4 right-4 z-100 flex-center rounded-full bg-black/32 w-8 h-8 "
        onClick={onClose}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>닫기 버튼</title>
          <path
            d="M13 1L1 13M1 1L13 13"
            className="stroke-white group-hover:stroke-black transition-colors"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
      <div className={cn('w-[90%] max-h-[85%] relative', ratioClass)}>
        <Carousel
          options={{
            startIndex,
            align: 'center',
          }}
          isButtonShow={true}
          buttonClassName="absolute top-1/2 z-0 justify-between w-full"
        >
          {images.map((src, index) => (
            <div key={index} className="flex-[0_0_100%] relative w-full h-full">
              <Image
                src={src}
                alt="팝업 이미지"
                fill
                className="object-cover"
              />
            </div>
          ))}
        </Carousel>
      </div>
    </div>,
    portalElement
  );
};
