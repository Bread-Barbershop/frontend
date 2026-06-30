'use client';
import { FabricImage } from 'fabric';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import EditorNoticeList from '@/components/molecules/editor-notice/EditorNoticeList';
import { RangeControl } from '@/components/molecules/range-control/RangeControl';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';
import { getPreviewExportMultiplier } from '@/widgets/mainPoster/utils/previewExport';

import { AspectRatioSelector } from '../image/AspectRatioSelector';
import { ImagePreview } from '../image/ImagePreview';

const POSITION_MIN = -50;
const POSITION_MAX = 50;
const SCALE_MIN = 100;
const SCALE_MAX = 400;
const SCALE_OFFSET_MIN = 0;
const SCALE_OFFSET_MAX = SCALE_MAX - SCALE_MIN;

const clampPosition = (value: number) =>
  Math.min(POSITION_MAX, Math.max(POSITION_MIN, value));
const clampScale = (value: number) =>
  Math.min(SCALE_MAX, Math.max(SCALE_MIN, value));
const clampScaleOffset = (value: number) =>
  Math.min(SCALE_OFFSET_MAX, Math.max(SCALE_OFFSET_MIN, value));
const scaleToOffset = (value: number) => clampScale(value) - SCALE_MIN;
const offsetToScale = (value: number) => SCALE_MIN + clampScaleOffset(value);

export const BackgroundImagePanel = () => {
  const {
    canvas,
    compressImage,
    setBackgroundImage,
    removeBackgroundImage,
    getBackgroundImageTransform,
    updateBackgroundImagePosition,
    updateBackgroundImageScale,
    activeInfo,
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
  const transform = getBackgroundImageTransform();
  const hasImage = transform.hasImage;

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

  const updateImageSrc = async () => {
    if (!canvas) return;

    const target = canvas
      .getObjects()
      .find(obj => obj.get('id') === 'background-layer') as FabricImage;
    if (!target || !(target instanceof FabricImage)) {
      setImageSrc('');
      return;
    }

    const objectsToHide = canvas.getObjects().filter(obj => obj !== target);
    const visibilitySnapshot = objectsToHide.map(obj => obj.visible);
    const activeObject = canvas.getActiveObject();

    if (activeObject && activeObject !== target) {
      canvas.discardActiveObject();
    }
    objectsToHide.forEach(obj => {
      obj.set('visible', false);
    });

    canvas.requestRenderAll();
    const previewDataUrl = canvas.toDataURL({
      format: 'webp',
      quality: 0.8,
      left: 0,
      top: 0,
      width: canvas.getWidth(),
      height: canvas.getHeight(),
      multiplier: getPreviewExportMultiplier(
        canvas.getWidth(),
        canvas.getHeight()
      ),
    });

    objectsToHide.forEach((obj, index) => {
      obj.set('visible', visibilitySnapshot[index]);
    });

    if (activeObject && activeObject !== target) {
      canvas.setActiveObject(activeObject);
    }

    canvas.requestRenderAll();
    setImageSrc(previewDataUrl);
  };

  useEffect(() => {
    syncBackgroundSelection();
    void updateImageSrc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas]);

  useEffect(() => {
    setDisplayValue({
      x: String(clampPosition(transform.x)),
      y: String(clampPosition(transform.y)),
      scale: String(scaleToOffset(transform.scale)),
    });
  }, [transform.hasImage, transform.x, transform.y, transform.scale]);

  useEffect(() => {
    void updateImageSrc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInfo, hasImage]);

  const handleImageUpload = () => {
    inputRef.current?.click();
  };

  const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = async loadEvent => {
      const base64 = loadEvent.target?.result;
      if (typeof base64 !== 'string') return;
      const compressed = await compressImage(base64);
      await runHistoryTransaction(
        async () => {
          await setBackgroundImage(compressed, { saveHistory: false });
        },
        { save: true }
      );
      syncBackgroundSelection();
      setActiveTab('image');
    };
    reader.readAsDataURL(file);
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    const nextValue = clampPosition(value);
    setDisplayValue(current => ({
      ...current,
      [axis]: String(nextValue),
    }));
    updateBackgroundImagePosition(axis, nextValue);
  };

  const handlePositionCommit = (axis: 'x' | 'y', value: number) => {
    const nextValue = clampPosition(value);
    setDisplayValue(current => ({
      ...current,
      [axis]: String(nextValue),
    }));
    updateBackgroundImagePosition(axis, nextValue, { saveHistory: true });
    void updateImageSrc();
  };

  const handleScaleChange = (value: number) => {
    const nextScale = clampScale(value);
    setDisplayValue(current => ({
      ...current,
      scale: String(scaleToOffset(nextScale)),
    }));
    updateBackgroundImageScale(nextScale);
  };

  const handleScaleCommit = (value: number) => {
    const nextScale = clampScale(value);
    setDisplayValue(current => ({
      ...current,
      scale: String(scaleToOffset(nextScale)),
    }));
    updateBackgroundImageScale(nextScale, { saveHistory: true });
    void updateImageSrc();
  };

  return (
    <LeftEditorWrapper
      ariaLabel="배경 이미지 편집"
      data-crop-controls="true"
      className="overflow-y-scroll gap-2"
    >
      <ImagePreview
        src={imageSrc}
        alt="배경 이미지 미리보기"
        inputRef={inputRef}
        onUploadClick={handleImageUpload}
        onInputChange={handleChangeImage}
      />
      <AspectRatioSelector disabled startCrop={() => {}} />
      <RangeControl
        label="X축"
        min={POSITION_MIN}
        max={POSITION_MAX}
        step={1}
        value={transform.x}
        displayValue={displayValue.x}
        disabled={!hasImage}
        allowNegative
        onDisplayValueChange={value => {
          setDisplayValue(current => ({
            ...current,
            x: value,
          }));
        }}
        onChange={value => {
          handlePositionChange('x', value);
        }}
        onCommit={value => {
          handlePositionCommit('x', value);
        }}
      />
      <RangeControl
        label="Y축"
        min={POSITION_MIN}
        max={POSITION_MAX}
        step={1}
        value={transform.y}
        displayValue={displayValue.y}
        disabled={!hasImage}
        allowNegative
        onDisplayValueChange={value => {
          setDisplayValue(current => ({
            ...current,
            y: value,
          }));
        }}
        onChange={value => {
          handlePositionChange('y', value);
        }}
        onCommit={value => {
          handlePositionCommit('y', value);
        }}
      />
      <RangeControl
        label="배율"
        min={SCALE_OFFSET_MIN}
        max={SCALE_OFFSET_MAX}
        step={5}
        value={scaleToOffset(transform.scale)}
        displayValue={displayValue.scale}
        disabled={!hasImage}
        onDisplayValueChange={value => {
          setDisplayValue(current => ({
            ...current,
            scale: value,
          }));
        }}
        onChange={value => {
          handleScaleChange(offsetToScale(value));
        }}
        onCommit={value => {
          handleScaleCommit(offsetToScale(value));
        }}
      />
      <div className="w-full flex items-center gap-3">
        <Label className="font-semibold">추가기능</Label>
        <Checkbox
          checked={hasImage}
          disabled={!hasImage}
          onChange={async event => {
            if (event.target.checked) return;
            await runHistoryTransaction(
              () => {
                removeBackgroundImage({ saveHistory: false });
              },
              { save: true }
            );
            setActiveTab('background');
          }}
        >
          <span className="text-[13px]">해당 이미지를 배경으로 적용하기</span>
        </Checkbox>
      </div>
      <EditorNoticeList
        className="pl-1"
        notices={[
          {
            id: 'image-crop',
            text: '자르기 실행 후 원하는 형태로 자르기 하신 뒤 아무곳이나 클릭 하시면 적용됩니다.',
            colorClass: 'text-[#1F72EF]',
          },
          {
            id: 'image-position',
            text: 'X축, Y축 조정을 통해 이미지가 보이는 위치를 변경할 수 있습니 다.',
          },
        ]}
      />
    </LeftEditorWrapper>
  );
};
