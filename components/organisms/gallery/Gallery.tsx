import { ChangeEvent, PointerEvent, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { Label } from '@/components/atoms/label';
import { ButtonSelector } from '@/components/molecules/button-selector/ButtonSelector';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextField } from '@/components/molecules/text-field';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useToast } from '@/shared/hooks/useToast';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { compressImages } from '@/shared/utils/imageCompression';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

import { ASPECT_RATIO_OPTIONS } from './constants/AspectRatio';

interface Props {
  blockInfo: EditorBlock<'gallery'>;
  id: string;
}

function Gallery({ blockInfo, id }: Props) {
  const {
    isSubTitle = true,
    isPopupViewer = false,
    ratio,
  } = blockInfo.props;
  const { block, images, updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      block: state.block,
      images: state.images,
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
  const { warning } = useToast();
  const [loadingCount, setLoadingCount] = useState(0);
  const handleOnChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value || '갤러리' });
  };
  const handleOnChangeSubTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, {
      subTitle: sanitizeEnglishTitleInput(e.target) || 'GALLERY',
    });
  };

  const handlePictureChange = async (file: (File | string)[]) => {
    const currentEntry = images.find(img => img.id === id);
    const currentCount = currentEntry?.file.length ?? 0;
    if (currentCount + file.length > 30) {
      warning('갤러리 이미지는 최대 30개까지 추가할 수 있습니다.');
      return;
    }

    const files = file.filter((f): f is File => f instanceof File);
    setLoadingCount(files.length);
    try {
      const compressedFiles = await compressImages(files);
      const compressed = file.map(
        f => compressedFiles[files.indexOf(f as File)] ?? f
      );

      const currentBlock = block as EditorBlock<'gallery'>[];
      const image = currentBlock.find(b => b.id === id)?.props.images;
      updateBlock(id, { images: [...(image ?? []), ...compressed] });
      updateImage(id, [...(image ?? []), ...compressed]);
    } catch (error) {
      console.error('[Gallery] 이미지 압축 실패:', error);
      warning('이미지 처리 중 문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoadingCount(0);
    }
  };

  const handlePictureDelete = (files?: (File | string)[]) => {
    if (!files) {
      updateBlock(id, { images: [] });
      updateImage(id, []);
      return;
    }
    updateBlock(id, { images: files });
    updateImage(id, files);
  };

  const handlePopViewChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { isPopupViewer: e.target.checked });
  };
  const handleSubTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { isSubTitle: e.target.checked });
  };

  const handleAspectRatioChange = (e: PointerEvent<HTMLButtonElement>) => {
    updateBlock(id, { ratio: e.currentTarget.value });
  };

  return (
    <LeftEditorWrapper ariaLabel="갤러리">
      <NavigationBar>갤러리 편집 페이지</NavigationBar>
      <div className="w-full flex flex-col gap-1">
        <TextField
          label="제목"
          className="py-1.5 text-center"
          inputProps={{
            placeholder: '갤러리',
            onChange: e => handleOnChangeTitle(e),
            value:
              blockInfo.props.title === '갤러리' ? '' : blockInfo.props.title,
          }}
        />
        {blockInfo.props.isSubTitle && (
          <TextField
            label="영문 제목"
            className="py-1.5 text-center"
            inputProps={{
              placeholder: 'GALLERY',
              onChange: e => handleOnChangeSubTitle(e),
              value:
                blockInfo.props.subTitle === 'GALLERY'
                  ? ''
                  : blockInfo.props.subTitle,
            }}
          />
        )}

        <Picture
          label="사진"
          className="py-1 text-center"
          multiple={true}
          value={blockInfo.props.images}
          onChange={file => handlePictureChange(file)}
          onReorder={file => {
            updateBlock(id, { images: file });
            updateImage(id, file);
          }}
          onDelete={file => handlePictureDelete(file)}
          loadingCount={loadingCount}
        />
        {blockInfo.props.images && blockInfo.props.images?.length > 0 && (
          <ButtonSelector
            className="gap-2 text-center"
            label="비율"
            selectorOption={ASPECT_RATIO_OPTIONS}
            onPointerDown={handleAspectRatioChange}
            selectedValue={ratio}
          />
        )}
        <ul className="list-disc pl-5 marker:text-text-secondary py-3.5">
          <li className="text-text-secondary font-semibold text-[13px]">
            사진을 드래그하여 순서 변경 가능
          </li>
        </ul>
        <div className="flex items-center gap-2 pb-2">
          <Label className="font-semibold shrink-0 text-center">추가기능</Label>
          <div>
            <Checkbox
              onChange={handleSubTitleChange}
              checked={isSubTitle}
            >
              <span className="text-[13px]">영문 제목 추가</span>
            </Checkbox>
            <Checkbox onChange={handlePopViewChange} checked={isPopupViewer}>
              <span className="text-[13px]">
                팝업뷰어(사진을 터치하여 크게 볼 수 있어요.)
              </span>
            </Checkbox>
          </div>
        </div>
      </div>
    </LeftEditorWrapper>
  );
}
export default Gallery;
