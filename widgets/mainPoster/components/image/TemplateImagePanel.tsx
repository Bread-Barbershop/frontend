import { FabricImage } from 'fabric';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { RangeControl } from '@/components/molecules/range-control/RangeControl';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { SlotImageObject } from '../../utils/imageSlot';

import { AspectRatioSelector } from './AspectRatioSelector';
import { ImagePreview } from './ImagePreview';

const POSITION_MIN = -50;
const POSITION_MAX = 50;
const SCALE_MIN = 100;
const SCALE_MAX = 300;
const SCALE_OFFSET_MIN = 0;
const SCALE_OFFSET_MAX = 300;

const clampPosition = (value: number) =>
  Math.min(POSITION_MAX, Math.max(POSITION_MIN, value));
const clampScale = (value: number) =>
  Math.min(SCALE_MAX, Math.max(SCALE_MIN, value));
const clampScaleOffset = (value: number) =>
  Math.min(SCALE_OFFSET_MAX, Math.max(SCALE_OFFSET_MIN, value));
const scaleToOffset = (value: number) => clampScale(value) - SCALE_MIN;

export const TemplateImagePanel = () => {
  const {
    canvas,
    activeInfo,
    compressImage,
    replaceSlotImage,
    restoreSlotPlaceholder,
    getSlotImagePosition,
    updateSlotImagePosition,
    getSlotImageScale,
    updateSlotImageScale,
    exportSlotImagePreview,
    setBackgroundImage,
    runHistoryTransaction,
  } = useFabricContext();
  const setActiveTab = useEditorStore(state => state.setActiveTab);
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState('');
  const [displayValue, setDisplayValue] = useState({
    x: '0',
    y: '0',
    scale: '0',
  });
  const activeObject = canvas?.getActiveObject();
  const activeSlotImage =
    activeObject instanceof FabricImage &&
    (activeObject as SlotImageObject).slot?.replaceable
      ? (activeObject as SlotImageObject)
      : null;

  const position = activeSlotImage
    ? getSlotImagePosition(activeSlotImage)
    : { x: 0, y: 0 };
  const scale = activeSlotImage
    ? getSlotImageScale(activeSlotImage)
    : SCALE_MIN;

  const activeSlotKey = activeSlotImage?.slot?.key ?? null;

  const syncBackgroundSelection = () => {
    if (!canvas) return;

    const backgroundObject = canvas
      .getObjects()
      .find(obj => obj.get('id') === 'background-layer');

    if (!backgroundObject) return;

    backgroundObject.set({ selectable: true, evented: true });
    canvas.setActiveObject(backgroundObject);
    canvas.requestRenderAll();
  };

  useEffect(() => {
    setDisplayValue({
      x: String(clampPosition(position.x)),
      y: String(clampPosition(position.y)),
      scale: String(scaleToOffset(scale)),
    });
  }, [activeSlotKey, position.x, position.y, scale]);

  useEffect(() => {
    if (!activeSlotImage) {
      setImageSrc('');
      return;
    }
    setImageSrc(exportSlotImagePreview(activeSlotImage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, activeInfo, activeSlotKey]);

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
    const nextValue = clampPosition(value);
    setDisplayValue(current => ({
      ...current,
      [axis]: String(nextValue),
    }));

    if (canvas && activeSlotImage) {
      updateSlotImagePosition(activeSlotImage, axis, nextValue);
    }
  };

  const handleSlotPositionCommit = (axis: 'x' | 'y', value: number) => {
    const nextValue = clampPosition(value);
    setDisplayValue(current => ({
      ...current,
      [axis]: String(nextValue),
    }));

    if (canvas && activeSlotImage) {
      updateSlotImagePosition(activeSlotImage, axis, nextValue, {
        saveHistory: true,
        syncActiveObjectInfo: true,
      });
      setImageSrc(exportSlotImagePreview(activeSlotImage));
    }
  };

  const handleSlotScaleChange = (value: number) => {
    const nextScale = clampScale(value);
    setDisplayValue(current => ({
      ...current,
      scale: String(scaleToOffset(nextScale)),
    }));

    if (canvas && activeSlotImage) {
      updateSlotImageScale(activeSlotImage, nextScale);
    }
  };

  const handleSlotScaleCommit = (value: number) => {
    const nextScale = clampScale(value);
    setDisplayValue(current => ({
      ...current,
      scale: String(scaleToOffset(nextScale)),
    }));

    if (canvas && activeSlotImage) {
      updateSlotImageScale(activeSlotImage, nextScale, {
        saveHistory: true,
        syncActiveObjectInfo: true,
      });
      setImageSrc(exportSlotImagePreview(activeSlotImage));
    }
  };

  const handleSetAsBackground = async (checked: boolean) => {
    if (!checked || !canvas || !activeSlotImage) return;

    const previewDataUrl = exportSlotImagePreview(activeSlotImage);
    if (!previewDataUrl) return;

    await runHistoryTransaction(
      async () => {
        await setBackgroundImage(previewDataUrl, { saveHistory: false });
        restoreSlotPlaceholder(activeSlotImage, { saveHistory: false });
      },
      { save: true }
    );
    syncBackgroundSelection();
    setActiveTab('image');
  };

  return (
    <LeftEditorWrapper
      ariaLabel="프레임 이미지 편집"
      className="overflow-y-scroll gap-2"
      data-crop-controls="true"
    >
      <ImagePreview
        src={imageSrc}
        alt="프레임 이미지 미리보기"
        inputRef={inputRef}
        onUploadClick={handleUploadClick}
        onInputChange={handleChangeImage}
        allowPreviewClick={true}
        emptyStateContent={
          <p className="text-base font-medium text-black">
            이미지를 추가해주세요
          </p>
        }
      />
      <AspectRatioSelector disabled startCrop={() => {}} />
      <RangeControl
        label="X축"
        min={POSITION_MIN}
        max={POSITION_MAX}
        step={1}
        value={position.x}
        displayValue={displayValue.x}
        allowNegative
        disabled={!activeSlotImage || !canvas}
        onDisplayValueChange={value => {
          setDisplayValue(current => ({
            ...current,
            x: value,
          }));
        }}
        onChange={value => {
          handleSlotPositionChange('x', value);
        }}
        onCommit={value => {
          handleSlotPositionCommit('x', value);
        }}
      />
      <RangeControl
        label="Y축"
        min={POSITION_MIN}
        max={POSITION_MAX}
        step={1}
        value={position.y}
        displayValue={displayValue.y}
        allowNegative
        disabled={!activeSlotImage || !canvas}
        onDisplayValueChange={value => {
          setDisplayValue(current => ({
            ...current,
            y: value,
          }));
        }}
        onChange={value => {
          handleSlotPositionChange('y', value);
        }}
        onCommit={value => {
          handleSlotPositionCommit('y', value);
        }}
      />
      <RangeControl
        label="배율"
        min={SCALE_OFFSET_MIN}
        max={SCALE_OFFSET_MAX}
        step={5}
        value={scaleToOffset(scale)}
        displayValue={displayValue.scale}
        disabled={!activeSlotImage || !canvas}
        onDisplayValueChange={value => {
          setDisplayValue(current => ({
            ...current,
            scale: value,
          }));
        }}
        onChange={value => {
          handleSlotScaleChange(SCALE_MIN + clampScaleOffset(value));
        }}
        onCommit={value => {
          handleSlotScaleCommit(SCALE_MIN + clampScaleOffset(value));
        }}
      />
      <div className="w-full pb-2 flex items-center gap-2">
        <Label className="font-semibold">추가기능</Label>
        <Checkbox
          checked={false}
          disabled={!activeSlotImage}
          onChange={async event => {
            await handleSetAsBackground(event.target.checked);
          }}
        >
          <span className="text-[13px]">해당 이미지를 배경으로 적용하기</span>
        </Checkbox>
      </div>
      <EditorNoticeList
        notices={[
          {
            id: 'image-crop',
            text: '자르기 실행 후 원하는 형태로 자르기 하신 뒤 아무곳이나 클릭하시면 적용됩니다.',
            colorClass: 'text-[#1F72EF]',
          },
          {
            id: 'image-position',
            text: 'X축, Y축 조정을 통해 이미지가 보이는 위치를 변경할 수 있습니다.',
          },
        ]}
      />
    </LeftEditorWrapper>
  );
};
