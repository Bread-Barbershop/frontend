import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Image } from '@/components/atoms/image';
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
  const pathname = usePathname();
  const currentImage = images[startIndex];
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
    <div
      className={`inset-0 z-50 bg-black/80 flex justify-center items-center flex-col gap-2 px-7 ${pathname.startsWith('/editor') ? 'absolute' : 'fixed'}`}
      onClick={onClose}
    >
      <div
        className={cn('w-full relative mx-auto')}
        style={{
          ...ratioData.style,
          maxWidth: `calc(85vh * ${ratioData.value})`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          <Image
            src={currentImage}
            alt="팝업 이미지"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>,
    portalElement
  );
};
