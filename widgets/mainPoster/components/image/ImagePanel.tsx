import { FabricImage } from 'fabric';
import { ChangeEvent, useMemo, useRef } from 'react';

import { Button } from '@/components/atoms/button';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

import { getImagePanelMode } from '../../utils/imageSlot';
import { getPreviewExportMultiplier } from '../../utils/previewExport';
import { BackgroundImagePanel } from '../background/BackgroundImagePanel';

import { ImagePreview } from './ImagePreview';
import { TemplateImagePanel } from './TemplateImagePanel';

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
  const { canvas, addImage, startCrop, activeInfo, compressImage } =
    useFabricContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const activeObject = canvas?.getActiveObject();
  const activeUserImage =
    activeObject instanceof FabricImage &&
    getImagePanelMode(activeObject) === 'user-image'
      ? activeObject
      : null;

  const imageSrc = useMemo(() => {
    if (!activeUserImage) return '';
    const multiplier = getPreviewExportMultiplier(
      activeUserImage.getScaledWidth(),
      activeUserImage.getScaledHeight()
    );
    return activeUserImage.toDataURL({
      format: 'webp',
      quality: 0.8,
      multiplier,
    });

    // Fabric mutates the selected image in place; activeInfo signals an edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserImage, activeInfo]);

  const handleImageUpload = () => {
    inputRef.current?.click();
  };

  const handleChangeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
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
      <Button
        disabled={!activeUserImage || Boolean(activeUserImage.get('isLocked'))}
        onClick={() => {
          if (activeUserImage) startCrop(activeUserImage);
        }}
      >
        사진 자르기 · 배경으로 적용
      </Button>
    </LeftEditorWrapper>
  );
};
