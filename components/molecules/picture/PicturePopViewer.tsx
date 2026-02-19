import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';

interface Props {
  isOpen: boolean;
  images: string[];
  startIndex: number;
  onClose: () => void;
}

export const PicturePopViewer = ({
  isOpen,
  images,
  startIndex,
  onClose,
}: Props) => {
  const [portalElement, setPortalElement] = useState<Element | null>(null);

  useEffect(() => {
    setPortalElement(document.getElementById('preview-container'));
  }, []);

  if (!isOpen || !portalElement) return null;

  return createPortal(
    <div className="absolute inset-0 z-50 bg-black/80 flex-center">
      <button
        type="button"
        className="absolute top-4 right-4 z-100 flex-center rounded-full bg-black/32 w-8 h-8"
        onClick={() => {
          onClose();
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 1L1 13M1 1L13 13"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div className="w-[90%] aspect-square relative">
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
