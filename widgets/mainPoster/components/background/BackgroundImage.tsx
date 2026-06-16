import { FabricImage } from 'fabric';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { ImageUploadButton } from '@/components/atoms/button/ImageUploadButton';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export const BackgroundImage = () => {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get('type') === 'admin';
  const {
    canvas,
    compressImage,
    setBackgroundImage,
    updateBackgroundImageOpacity,
    backgroundImageOpacity,
    activeInfo,
  } = useFabricContext();
  const { activeTab } = useEditorStore(
    useShallow(state => ({
      activeTab: state.activeTab,
    }))
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState('');
  const [opacity, setOpacity] = useState(100);

  const updateImageSrc = async () => {
    if (!canvas) return;

    const target = canvas
      .getObjects()
      .find(obj => obj.get('id') === 'background-layer') as FabricImage;

    if (!target || !(target instanceof FabricImage)) {
      setImageSrc('');
      setOpacity(Math.round(backgroundImageOpacity * 100));
      return;
    }

    setOpacity(Math.round((target.opacity ?? 1) * 100));

    const clonedObject = await target.clone();
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
    } else if (height > MAX_SIZE) {
      width *= MAX_SIZE / height;
      height = MAX_SIZE;
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
      width,
      height,
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

  useEffect(() => {
    if (!canvas) return;

    const isActive = activeTab === 'background';
    const objects = canvas.getObjects();
    const bgObj = objects.find(obj => obj.get('id') === 'background-layer');

    if (isActive) {
      if (bgObj) {
        bgObj.set({ selectable: true, evented: true });
        canvas.setActiveObject(bgObj);
        canvas.sendObjectToBack(bgObj);
      }
    } else {
      if (bgObj) {
        bgObj.set({ selectable: false, evented: false });
      }

      const currentActive = canvas.getActiveObject();
      if (currentActive === bgObj) {
        canvas.discardActiveObject();
      }
    }

    canvas.requestRenderAll();
    void updateImageSrc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, activeTab]);

  useEffect(() => {
    void updateImageSrc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInfo, backgroundImageOpacity]);

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

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    updateBackgroundImageOpacity(value / 100);
  };

  return (
    <section className="flex w-full flex-col items-center gap-3">
      {isAdmin && (
        <div className="w-full px-1">
          <div className="mb-2 text-center text-[13px] font-semibold text-text-primary">
            투명도
          </div>
          <div className="flex w-full items-center gap-1.5">
            <input
              type="text"
              readOnly
              value={opacity}
              className="flex h-[32px] w-[47px] items-center justify-center rounded-lg border border-border-neutral bg-bg-base text-center text-xs focus:outline-none"
            />
            <div className="flex-1 px-1">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={opacity}
                disabled={!imageSrc}
                onChange={e => {
                  handleOpacityChange(parseInt(e.target.value, 10));
                }}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#E5E7EB] accent-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-40
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6]
                  [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#3B82F6] [&::-moz-range-thumb]:border-none"
              />
            </div>
          </div>
        </div>
      )}
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
    </section>
  );
};
