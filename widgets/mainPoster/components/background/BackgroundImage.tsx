import { FabricImage } from 'fabric';
import Image from 'next/image';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { ImageUploadButton } from '@/components/atoms/button/ImageUploadButton';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { PhotoPresetOptions } from '../../types/fabric';
import { ImageFilterSelector } from '../image/ImageFilterSelector';

export const BackgroundImage = () => {
  const {
    canvas,
    compressImage,
    setBackgroundImage,
    activeInfo,
    applyImageFilter,
  } = useFabricContext();
  const { activeTab } = useEditorStore(
    useShallow(state => ({
      activeTab: state.activeTab,
    }))
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState('');

  const updateImageSrc = async () => {
    if (!canvas) return;
    // 항상 배경 레이어를 타겟으로 함 (다른 객체가 선택되어도 프리뷰는 배경 유지)
    const target = canvas
      .getObjects()
      .find(obj => obj.get('id') === 'background-layer') as FabricImage;

    if (!target || !(target instanceof FabricImage)) {
      setImageSrc('');
      return;
    }

    // 1. 객체 복제 (원본 객체에 영향 주지 않기 위함)
    const clonedObject = await target.clone();

    // 2. 리사이징용 캔버스 생성 (335px 제한) - 필터 적용 속도 최적화
    const originalElem = clonedObject.getElement();
    const offscreenCanvas = document.createElement('canvas');
    const MAX_SIZE = 335;

    let width = originalElem.width;
    let height = originalElem.height;

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

    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const ctx = offscreenCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(originalElem, 0, 0, width, height);
    clonedObject.setElement(offscreenCanvas);

    clonedObject.set({
      angle: 0,
      scaleX: 1,
      scaleY: 1,
      left: 0,
      top: 0,
      width: width,
      height: height,
      cropX: 0,
      cropY: 0,
    });

    if (target.filters && target.filters.length > 0) {
      if (!clonedObject.filters || clonedObject.filters.length === 0) {
        clonedObject.filters = [...target.filters];
      }
      clonedObject.applyFilters();
    }

    const newDataUrl = clonedObject.toDataURL({
      format: 'webp',
      quality: 0.8,
    });
    setImageSrc(newDataUrl);
  };

  // 배경 편집 모드 활성화 (배경 탭 활성화 시에만 배경 레이어 선택 가능하도록 함)
  useEffect(() => {
    if (!canvas) return;

    const isActive = activeTab === 'background';
    const objects = canvas.getObjects();
    const bgObj = objects.find(obj => obj.get('id') === 'background-layer');

    if (isActive) {
      // 배경 모드: 배경 선택 가능
      if (bgObj) {
        bgObj.set({ selectable: true, evented: true });
        canvas.setActiveObject(bgObj);
        canvas.sendObjectToBack(bgObj);
      }
    } else {
      // 일반 모드: 배경 비활성화
      if (bgObj) {
        bgObj.set({ selectable: false, evented: false });
      }
      
      // 혹시 배경이 선택되어 있었다면 해제
      const currentActive = canvas.getActiveObject();
      if (currentActive === bgObj) {
        canvas.discardActiveObject();
      }
    }

    canvas.requestRenderAll();
    updateImageSrc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, activeTab]);

  // 객체 변경 시 프리뷰 업데이트
  useEffect(() => {
    updateImageSrc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInfo]);

  const handleImageUpload = () => {
    inputRef.current?.click();
  };

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      const base64 = event.target?.result as string;
      const compressed = await compressImage(base64);
      if (canvas) {
        await setBackgroundImage(compressed);

        // 배경 객체 생성/업데이트 후 다시 활성화
        const bgObj = canvas
          .getObjects()
          .find(obj => obj.get('id') === 'background-layer');
        if (bgObj) {
          bgObj.set({ selectable: true, evented: true });
          canvas.setActiveObject(bgObj);
          canvas.requestRenderAll();
        }
      }
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleApply = (
    options: PhotoPresetOptions,
    type: 'bw' | 'warm' | 'cool' | 'fade' | 'filmGrain' | 'vignette' | null
  ) => {
    if (canvas) {
      // 배경 탭이므로 필터 적용 전 배경 레이어를 활성화하여 타겟팅 보장
      const bgObj = canvas
        .getObjects()
        .find(obj => obj.get('id') === 'background-layer');
      if (bgObj) {
        canvas.setActiveObject(bgObj);
      }
      applyImageFilter(options, canvas, type);
    }
    updateImageSrc();
  };

  return (
    <section className="flex flex-col gap-3">
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
      <ImageFilterSelector onApply={handleApply} activeInfo={activeInfo} />
    </section>
  );
};
