import { ChangeEvent, PointerEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import { Label } from '@/components/atoms/label';
import { ButtonSelector } from '@/components/molecules/button-selector/ButtonSelector';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextField } from '@/components/molecules/text-field';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

import { ASPECT_RATIO_OPTIONS } from './constants/AspectRatio';

interface Props {
  blockInfo: EditorBlock<'gallery'>;
  id: string;
}

function Gallery({ blockInfo, id }: Props) {
  const { updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );

  const handleOnChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };

  const handlePictureChange = (file: (File | string)[]) => {
    updateBlock(id, { images: file });
    updateImage(id, file);
  };

  const handlePopViewChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { isPopupViewer: e.target.checked });
  };

  const handleAspectRatioChange = (e: PointerEvent<HTMLButtonElement>) => {
    updateBlock(id, { ratio: e.currentTarget.value });
  };

  return (
    <LeftEditorWrapper ariaLabel="갤러리">
      <NavigationBar>갤러리</NavigationBar>
      <div className="w-full flex flex-col gap-1">
        <TextField
          label="제목"
          className="py-1.5"
          inputProps={{
            placeholder: '제목을 입력해주세요.',
            onChange: e => handleOnChangeTitle(e),
            value: blockInfo.props.title,
          }}
        />
        <div className="flex gap-2 py-2">
          <Label className="font-semibold shrink-0">추가기능</Label>
          <Checkbox onChange={handlePopViewChange}>
            <p className="font-normal text-text-secondary text-[13px]">
              팝업뷰어(사진을 터치하여 크게 볼 수 있어요.)
            </p>
          </Checkbox>
        </div>
        <Picture
          label="사진"
          className="py-1"
          multiple={true}
          value={blockInfo.props.images}
          onChange={file => handlePictureChange(file)}
        />
        {blockInfo.props.images && blockInfo.props.images?.length > 0 && (
          <ButtonSelector
            className="gap-2"
            label="비율"
            selectorOption={ASPECT_RATIO_OPTIONS}
            onPointerDown={handleAspectRatioChange}
            selectedValue={blockInfo.props.ratio}
          />
        )}
        <ul className="list-disc pl-5 marker:text-text-secondary py-3.5">
          <li className="text-text-secondary font-semibold text-[13px]">
            사진을 드래그하여 순서 변경 가능
          </li>
        </ul>
      </div>
    </LeftEditorWrapper>
  );
}
export default Gallery;
