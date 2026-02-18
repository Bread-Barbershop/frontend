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
  applyImageFilter: (
    options: PhotoPresetOptions,
    canvas: Canvas,
    type: 'bw' | 'warm' | 'cool' | 'fade' | 'filmGrain' | 'vignette' | null
  ) => void;
  currentFilters?: PhotoPresetOptions;
  isCropping: boolean;
  startCrop: (canvas: Canvas, ratio: number | 'free') => void;
  applyCrop: (canvas: Canvas) => void;
  cancelCrop: (canvas: Canvas) => void;
}

const ImageFilterPanel = ({
  canvas,
  applyImageFilter,
  addImage,
  startCrop,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState('');

  const { activeObject } = useEditorStore(useShallow(state => state));

  // 이미지 Preview 업데이트 함수
  const updateImageSrc = async () => {
    if (!activeObject || !(activeObject instanceof FabricImage)) {
      return;
    }

    // 1. 객체 복제 (원본 객체에 영향 주지 않기 위함)
    const clonedObject = await activeObject.clone();

    // 2. 리사이징용 캔버스 생성 (300px 제한) - 필터 적용 속도 최적화
    const originalElem = clonedObject.getElement(); // 원본 엘리먼트 가져오기
    const canvas = document.createElement('canvas');
    const MAX_SIZE = 335;

    let width = originalElem.width;
    let height = originalElem.height;

    // 비율 유지 리사이징 계산
    if (width > height) {
      if (width > MAX_SIZE) {
        height *= MAX_SIZE / width;
        width = MAX_SIZE;
      }
    } else {
      if (height > MAX_SIZE) {
        width *= MAX_SIZE / height;
        height = MAX_SIZE;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 원본 이미지를 작게 그리기 (Downscaling)
    ctx.drawImage(originalElem, 0, 0, width, height);

    // 3. 복제된 객체의 소스를 작은 이미지로 교체
    // 이제 applyFilters()는 이 작은 캔버스(300px)에 대해 수행되므로 매우 빠름
    clonedObject.setElement(canvas);

    // 4. 변환 초기화 (정자세, 리사이징된 크기 반영)
    clonedObject.set({
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      left: 0,
      top: 0,
      width: width, // 실제 렌더링될 크기 업데이트
      height: height,
      cropX: 0,
      cropY: 0,
    });

    // 5. 필터 적용
    if (activeObject.filters && activeObject.filters.length > 0) {
      // clone()이 필터를 제대로 복사하지 못했을 경우를 대비해 수동 복사
      if (!clonedObject.filters || clonedObject.filters.length === 0) {
        clonedObject.filters = [...activeObject.filters];
      }

      // 필터 적용 (작은 이미지라 빠름)
      clonedObject.applyFilters();
    }

    const newDataUrl = clonedObject.toDataURL({
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

  const handleApply = (
    options: PhotoPresetOptions,
    type: 'bw' | 'warm' | 'cool' | 'fade' | 'filmGrain' | 'vignette' | null
  ) => {
    applyImageFilter(options, canvas, type);
    updateImageSrc(); // 필터 적용 후 Preview 갱신
  };
  const handleStartCrop = (ratio: number | 'free') => startCrop(canvas, ratio);

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
            width={335}
            height={335}
          />
        ) : (
          <ImageUploadButton
            ref={inputRef}
            onButtonClick={handleImageUpload}
            onInputChange={handleChangeImage}
          />
        )}
      </div>
      <AspectRatioSelector startCrop={handleStartCrop} />
      <ImageFilterSelector onApply={handleApply} />
    </div>
  );
};

export default ImageFilterPanel;
