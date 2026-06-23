import { FabricImage } from 'fabric';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { ImageUploadButton } from '@/components/atoms/button/ImageUploadButton';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { SlotImageObject } from '../../utils/imageSlot';

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));
const clampSliderOffset = (value: number) => Math.min(50, Math.max(-50, value));
const percentToSliderOffset = (value: number) =>
  clampSliderOffset(Math.round(clampPercent(value) - 50));
const sliderOffsetToPercent = (value: number) =>
  clampPercent(clampSliderOffset(value) + 50);

const sliderClassName =
  'h-1 w-full cursor-pointer appearance-none rounded-full bg-[#E5E7EB] accent-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-50 ' +
  '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3B82F6] ' +
  '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#3B82F6] [&::-moz-range-thumb]:border-none';

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
  const activeSlotKey = activeSlotImage?.slot?.key ?? null;
  const [dragPosition, setDragPosition] = useState<{
    slotKey: string;
    x: number;
    y: number;
  } | null>(null);
  const [displayValue, setDisplayValue] = useState({ x: '0', y: '0' });
  const sliderPosition =
    dragPosition && dragPosition.slotKey === activeSlotKey
      ? {
          x: percentToSliderOffset(dragPosition.x),
          y: percentToSliderOffset(dragPosition.y),
        }
      : {
          x: percentToSliderOffset(position.x),
          y: percentToSliderOffset(position.y),
        };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayValue({
      x: String(sliderPosition.x),
      y: String(sliderPosition.y),
    });
  }, [sliderPosition.x, sliderPosition.y, activeSlotKey]);

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
    const nextSliderValue = clampSliderOffset(value);
    const nextValue = sliderOffsetToPercent(nextSliderValue);

    setDisplayValue(current => ({
      ...current,
      [axis]: String(nextSliderValue),
    }));

    if (activeSlotKey) {
      const currentX =
        dragPosition?.slotKey === activeSlotKey
          ? dragPosition.x
          : clampPercent(position.x);
      const currentY =
        dragPosition?.slotKey === activeSlotKey
          ? dragPosition.y
          : clampPercent(position.y);

      setDragPosition({
        slotKey: activeSlotKey,
        x: axis === 'x' ? nextValue : currentX,
        y: axis === 'y' ? nextValue : currentY,
      });
    }

    if (canvas && activeSlotImage) {
      updateSlotImagePosition(activeSlotImage, axis, nextValue);
    }
  };

  const handleSlotPositionCommit = (axis: 'x' | 'y', value: number) => {
    const nextSliderValue = clampSliderOffset(value);
    const nextValue = sliderOffsetToPercent(nextSliderValue);

    if (canvas && activeSlotImage) {
      updateSlotImagePosition(activeSlotImage, axis, nextValue, {
        saveHistory: true,
        syncActiveObjectInfo: true,
      });
    }

    setDisplayValue(current => ({
      ...current,
      [axis]: String(nextSliderValue),
    }));
    setDragPosition(null);
  };

  return (
    <LeftEditorWrapper ariaLabel="이미지 위치 조절">
      <div className="py-5" data-crop-controls="true">
        <ImageUploadButton
          ref={inputRef}
          onButtonClick={handleUploadClick}
          onInputChange={handleChangeImage}
        >
          <p className="text-base font-[500] text-black">
            <span className="font-[600] text-[#1F72EF]">이곳</span>을 클릭하여
            이미지를 추가해주세요.
          </p>
        </ImageUploadButton>
      </div>
      <div className="w-full space-y-3 pb-5" data-crop-controls="true">
        <div className="bg-bg-base flex w-full items-center gap-4 py-1">
          <p className="w-[52px] px-2 text-center text-sm font-semibold text-text-primary">
            X축
          </p>
          <div className="flex-1 px-1">
            <input
              type="range"
              min={-50}
              max={50}
              step={1}
              value={sliderPosition.x}
              disabled={!position.canMoveX || !activeSlotImage || !canvas}
              className={sliderClassName}
              onChange={event => {
                handleSlotPositionChange('x', Number(event.target.value));
              }}
              onMouseUp={event => {
                handleSlotPositionCommit(
                  'x',
                  Number(event.currentTarget.value)
                );
              }}
              onTouchEnd={event => {
                handleSlotPositionCommit(
                  'x',
                  Number(event.currentTarget.value)
                );
              }}
            />
          </div>
          <input
            type="text"
            value={displayValue.x}
            disabled={!position.canMoveX || !activeSlotImage || !canvas}
            onChange={event => {
              const numericValue = event.target.value.replace(/[^0-9-]/g, '');
              if (
                numericValue !== '' &&
                numericValue !== '-' &&
                !/^-?\d+$/.test(numericValue)
              )
                return;

              setDisplayValue(current => ({
                ...current,
                x: numericValue,
              }));

              if (numericValue !== '' && numericValue !== '-') {
                handleSlotPositionChange('x', Number(numericValue));
              }
            }}
            onBlur={() => {
              const parsed = Number(displayValue.x);
              const nextValue =
                displayValue.x === '' || displayValue.x === '-' || isNaN(parsed)
                  ? sliderPosition.x
                  : parsed;
              handleSlotPositionCommit('x', nextValue);
            }}
            className="flex h-[32px] w-[47px] items-center justify-center rounded-lg border border-border-neutral bg-bg-base text-center text-xs focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="bg-bg-base flex w-full items-center gap-4 py-1">
          <p className="w-[52px] px-2 text-center text-sm font-semibold text-text-primary">
            Y축
          </p>
          <div className="flex-1 px-1">
            <input
              type="range"
              min={-50}
              max={50}
              step={1}
              value={sliderPosition.y}
              disabled={!position.canMoveY || !activeSlotImage || !canvas}
              className={sliderClassName}
              onChange={event => {
                handleSlotPositionChange('y', Number(event.target.value));
              }}
              onMouseUp={event => {
                handleSlotPositionCommit(
                  'y',
                  Number(event.currentTarget.value)
                );
              }}
              onTouchEnd={event => {
                handleSlotPositionCommit(
                  'y',
                  Number(event.currentTarget.value)
                );
              }}
            />
          </div>
          <input
            type="text"
            value={displayValue.y}
            disabled={!position.canMoveY || !activeSlotImage || !canvas}
            onChange={event => {
              const numericValue = event.target.value.replace(/[^0-9-]/g, '');
              if (
                numericValue !== '' &&
                numericValue !== '-' &&
                !/^-?\d+$/.test(numericValue)
              )
                return;

              setDisplayValue(current => ({
                ...current,
                y: numericValue,
              }));

              if (numericValue !== '' && numericValue !== '-') {
                handleSlotPositionChange('y', Number(numericValue));
              }
            }}
            onBlur={() => {
              const parsed = Number(displayValue.y);
              const nextValue =
                displayValue.y === '' || displayValue.y === '-' || isNaN(parsed)
                  ? sliderPosition.y
                  : parsed;
              handleSlotPositionCommit('y', nextValue);
            }}
            className="flex h-[32px] w-[47px] items-center justify-center rounded-lg border border-border-neutral bg-bg-base text-center text-xs focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
      <EditorNoticeList
        notices={[
          {
            id: 'template-slot-image-crop',
            text: '자르기 실행 후 원하는 형태로 자르기 하신 뒤 아무곳이나 클릭하시면 적용됩니다.',
            colorClass: 'text-[#1F72EF]',
          },
          {
            id: 'template-slot-image-position',
            text: 'X축, Y축 조정을 통해 이미지가 보이는 위치를 변경할 수 있습니다.',
          },
        ]}
      />
    </LeftEditorWrapper>
  );
};
