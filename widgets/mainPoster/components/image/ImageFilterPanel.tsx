import { Canvas, FabricImage } from 'fabric';
import Image from 'next/image';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { ImageUploadButton } from '@/components/atoms/button/ImageUploadButton';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/widgets/editor/store/useEditorStore';

import { PhotoPresetOptions } from '../../types/fabric';

import { AspectRatioSelector } from './AspectRatioSelector';
import { ImageFilterSelector } from './ImageFilterSelector';

interface Props {
  canvas: Canvas;
  addImage: (url: string, canvas: Canvas) => void;
  applyImageFilter: (options: PhotoPresetOptions, canvas: Canvas) => void;
  currentFilters?: PhotoPresetOptions;
  isCropping: boolean;
  startCrop: (canvas: Canvas) => void;
  applyCrop: (canvas: Canvas) => void;
  cancelCrop: (canvas: Canvas) => void;
}

const ImageFilterPanel = ({
  canvas,
  applyImageFilter,
  addImage,
  isCropping,
  startCrop,
  applyCrop,
  cancelCrop,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState('');

  const { activeObject } = useEditorStore(useShallow(state => state));

  // 이미지 Preview 업데이트 함수
  const updateImageSrc = () => {
    if (!activeObject || !(activeObject instanceof FabricImage)) {
      return;
    }
    const newDataUrl = activeObject.toDataURL({
      format: 'webp',
      quality: 0.8,
    });
    setImageSrc(newDataUrl);
  };

  const handleImageUpload = () => {
    inputRef.current?.click();
  };

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      addImage(url, canvas);
    };
    reader.readAsDataURL(file);
  };

  const handleApply = (options: PhotoPresetOptions) => {
    applyImageFilter(options, canvas);
    updateImageSrc(); // 필터 적용 후 Preview 갱신
  };
  const handleStartCrop = () => startCrop(canvas);
  const handleApplyCrop = () => applyCrop(canvas);
  const handleCancelCrop = () => cancelCrop(canvas);

  // 객체가 변경될 때마다 Preview 업데이트
  useEffect(() => {
    updateImageSrc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeObject]);

  return (
    <div className="flex flex-col items-center gap-1.5 w-full p-2">
      <NavigationBar>사진</NavigationBar>
      <div className="py-5">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt="Active Object Preview"
            className="object-contain"
            width={160}
            height={160}
          />
        ) : (
          <ImageUploadButton
            ref={inputRef}
            onButtonClick={handleImageUpload}
            onInputChange={handleChangeImage}
          />
        )}
      </div>
      <ImageFilterSelector onApply={handleApply} />
      <AspectRatioSelector />

      <div className="flex flex-wrap gap-2 items-center justify-center w-full mt-4">
        {!isCropping ? (
          <button
            onClick={handleStartCrop}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            크롭 모드
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleApplyCrop}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
            >
              적용
            </button>
            <button
              onClick={handleCancelCrop}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageFilterPanel;
