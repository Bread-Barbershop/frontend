import { FabricImage } from 'fabric';
import { ChangeEvent, useRef } from 'react';

import { ImageUploadButton } from '@/components/atoms/button/ImageUploadButton';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { SlotImageObject } from '../../utils/imageSlot';

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

export const TemplateImagePanel = () => {
  const {
    canvas,
    compressImage,
    replaceSlotImage,
    getSlotImagePosition,
    updateSlotImagePosition,
  } = useFabricContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const activeObject = canvas?.getActiveObject();
  const activeSlotImage =
    activeObject instanceof FabricImage &&
    (activeObject as SlotImageObject).slot?.replaceable
      ? (activeObject as SlotImageObject)
      : null;
  const position = activeSlotImage
    ? getSlotImagePosition(activeSlotImage)
    : { x: 50, y: 50, canMoveX: false, canMoveY: false };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !canvas || !activeSlotImage) return;

    const reader = new FileReader();
    reader.onload = async loadEvent => {
      const base64 = loadEvent.target?.result;
      if (typeof base64 !== 'string') return;

      const compressed = await compressImage(base64);
      await replaceSlotImage(activeSlotImage, compressed);
    };
    reader.readAsDataURL(file);
  };

  const handleSlotPositionChange = (axis: 'x' | 'y', value: number) => {
    if (canvas && activeSlotImage) {
      updateSlotImagePosition(activeSlotImage, axis, value);
    }
  };

  const handleSlotPositionCommit = (axis: 'x' | 'y', value: number) => {
    if (canvas && activeSlotImage) {
      updateSlotImagePosition(activeSlotImage, axis, value, {
        saveHistory: true,
      });
    }
  };

  return (
    <LeftEditorWrapper ariaLabel="템플릿 사진 편집">
      <NavigationBar>템플릿 사진</NavigationBar>
      <div className="py-5" data-crop-controls="true">
        <ImageUploadButton
          ref={inputRef}
          onButtonClick={handleUploadClick}
          onInputChange={handleChangeImage}
        >
          <p className="text-base font-[500] text-black">
            <span className="font-[600] text-[#1F72EF]">이곳</span>을 클릭하여
            사진을 변경해주세요.
          </p>
        </ImageUploadButton>
      </div>
      <div className="w-full space-y-4" data-crop-controls="true">
        <label className="block text-sm text-text-secondary">
          좌우 조절
          <input
            type="range"
            min={0}
            max={100}
            value={clampPercent(position.x)}
            disabled={!position.canMoveX || !activeSlotImage || !canvas}
            className="mt-2 w-full"
            onChange={event => {
              const next = clampPercent(Number(event.target.value));
              handleSlotPositionChange('x', next);
            }}
            onMouseUp={event => {
              handleSlotPositionCommit('x', Number(event.currentTarget.value));
            }}
            onTouchEnd={event => {
              handleSlotPositionCommit('x', Number(event.currentTarget.value));
            }}
          />
        </label>
        <label className="block text-sm text-text-secondary">
          상하 조절
          <input
            type="range"
            min={0}
            max={100}
            value={clampPercent(position.y)}
            disabled={!position.canMoveY || !activeSlotImage || !canvas}
            className="mt-2 w-full"
            onChange={event => {
              const next = clampPercent(Number(event.target.value));
              handleSlotPositionChange('y', next);
            }}
            onMouseUp={event => {
              handleSlotPositionCommit('y', Number(event.currentTarget.value));
            }}
            onTouchEnd={event => {
              handleSlotPositionCommit('y', Number(event.currentTarget.value));
            }}
          />
        </label>
      </div>
      <EditorNoticeList
        notices={[
          {
            id: 'template-slot-image',
            text: '이미지는 틀 안에서만 이동하며, 비율은 템플릿이 제공하는 비율에 고정됩니다.',
            colorClass: 'text-[#1F72EF]',
          },
        ]}
      />
    </LeftEditorWrapper>
  );
};
