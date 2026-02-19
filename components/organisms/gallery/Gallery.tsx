import { ChangeEvent, PointerEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import { Label } from '@/components/atoms/label';
import { ButtonSelector } from '@/components/molecules/button-selector/ButtonSelector';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextField } from '@/components/molecules/text-field';
import {
  EditorBlock,
  useEditorStore,
} from '@/widgets/editor/store/useEditorStore';

interface Props {
  blockInfo: EditorBlock<'gallery'>;
  id: string;
}

const ASPECT_RATIO_OPTIONS = [
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
];

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

  const handlePictureChange = (file: File[]) => {
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
    <div className="flex flex-col justify-center items-center gap-1 w-93.75 min-h-65">
      <div className="px-5 py-[13.5px] w-full flex justify-center">
        <h2 className="text-text-primary font-semibold text-sm">갤러리</h2>
      </div>
      <div className="px-5 w-full flex flex-col gap-1">
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
            label="비율"
            selectorOption={ASPECT_RATIO_OPTIONS}
            onPointerDown={handleAspectRatioChange}
          />
        )}
        <ul className="list-disc pl-5 marker:text-text-secondary py-3.5">
          <li className="text-text-secondary font-semibold text-[13px]">
            사진을 드래그하여 순서 변경 가능
          </li>
        </ul>
      </div>
    </div>
  );
}
export default Gallery;
