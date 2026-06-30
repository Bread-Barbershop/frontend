import { FabricImage } from 'fabric';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { RangeControl } from '@/components/molecules/range-control/RangeControl';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { getImagePanelMode } from '../../utils/imageSlot';
import { getPreviewExportMultiplier } from '../../utils/previewExport';
import { BackgroundImagePanel } from '../background/BackgroundImagePanel';

import { AspectRatioSelector } from './AspectRatioSelector';
import { ImagePreview } from './ImagePreview';
import { TemplateImagePanel } from './TemplateImagePanel';

const DISABLED_POSITION_VALUE = 0;
const DISABLED_SCALE_VALUE = 0;

export const ImagePanel = () => {
  const { canvas } = useFabricContext();
  const panelMode = getImagePanelMode(canvas?.getActiveObject());
  if (panelMode === 'background-image') {
    return <BackgroundImagePanel />;
  }
  if (panelMode === 'frame-image') {
    return <TemplateImagePanel />;
  }
  return <DefaultImagePanel />;
};

const DefaultImagePanel = () => {
  const {
    canvas,
    addImage,
    startCrop,
    activeInfo,
    compressImage,
    setBackgroundImage,
    runHistoryTransaction,
  } = useFabricContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState('');
  const activeObject = canvas?.getActiveObject();
  const activeUserImage =
    activeObject instanceof FabricImage &&
    getImagePanelMode(activeObject) === 'user-image'
      ? activeObject
      : null;

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

  const handleSetAsBackground = async (checked: boolean) => {
    if (!checked || !canvas || !activeUserImage) return;

    const imageDataUrl = activeUserImage.toDataURL({
      format: 'png',
      quality: 1,
    });

    await runHistoryTransaction(
      async () => {
        await setBackgroundImage(imageDataUrl, { saveHistory: false });
        canvas.remove(activeUserImage);
      },
      { save: true }
    );
    syncBackgroundSelection();
  };

  const getPreviewTargetImage = () => {
    if (!canvas) return null;

    const selectedObject = canvas.getActiveObject();
    if (selectedObject instanceof FabricImage) {
      if (selectedObject.get('id') === 'background-layer') {
        return null;
      }
      return selectedObject;
    }

    const cropGhostImage = canvas
      .getObjects()
      .find(
        obj =>
          obj instanceof FabricImage &&
          (obj as unknown as { name?: string }).name === 'ghost-image'
      );
    return cropGhostImage instanceof FabricImage ? cropGhostImage : null;
  };

  const updateImageSrc = () => {
    if (!canvas) return;

    const previewTarget = getPreviewTargetImage();
    if (!previewTarget) {
      setImageSrc('');
      return;
    }

    const multiplier = getPreviewExportMultiplier(
      previewTarget.getScaledWidth(),
      previewTarget.getScaledHeight()
    );
    const newDataUrl = previewTarget.toDataURL({
      format: 'webp',
      quality: 0.8,
      multiplier,
    });

    setImageSrc(newDataUrl);
  };

  const handleImageUpload = () => {
    inputRef.current?.click();
  };

  const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async loadEvent => {
      const base64 = loadEvent.target?.result as string;
      const compressed = await compressImage(base64);
      if (canvas) {
        addImage(compressed, canvas);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartCrop = (ratio: number | 'free') => {
    if (canvas) startCrop(canvas, ratio);
  };

  useEffect(() => {
    void updateImageSrc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, activeInfo]);

  return (
    <LeftEditorWrapper
      ariaLabel="이미지 편집"
      className="overflow-y-scroll gap-2"
      data-crop-controls="true"
    >
      <ImagePreview
        src={imageSrc}
        alt="이미지 미리보기"
        inputRef={inputRef}
        onUploadClick={handleImageUpload}
        onInputChange={handleChangeImage}
      />
      <AspectRatioSelector startCrop={handleStartCrop} />
      <RangeControl
        label="X축"
        min={-50}
        max={50}
        step={1}
        value={DISABLED_POSITION_VALUE}
        displayValue={String(DISABLED_POSITION_VALUE)}
        disabled
        allowNegative
        onDisplayValueChange={() => {}}
        onChange={() => {}}
        onCommit={() => {}}
      />
      <RangeControl
        label="Y축"
        min={-50}
        max={50}
        step={1}
        value={DISABLED_POSITION_VALUE}
        displayValue={String(DISABLED_POSITION_VALUE)}
        disabled
        allowNegative
        onDisplayValueChange={() => {}}
        onChange={() => {}}
        onCommit={() => {}}
      />
      <RangeControl
        label="배율"
        min={0}
        max={200}
        step={5}
        value={DISABLED_SCALE_VALUE}
        displayValue={String(DISABLED_SCALE_VALUE)}
        disabled
        onDisplayValueChange={() => {}}
        onChange={() => {}}
        onCommit={() => {}}
      />
      {activeUserImage ? (
        <div className="w-full flex items-center gap-3">
          <Label className="font-semibold">추가기능</Label>
          <Checkbox
            checked={false}
            onChange={async event => {
              await handleSetAsBackground(event.target.checked);
            }}
          >
            <span className="text-[13px]">해당 이미지를 배경으로 적용하기</span>
          </Checkbox>
        </div>
      ) : null}
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
