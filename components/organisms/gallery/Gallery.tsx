import { ChangeEvent } from 'react';

import { Label } from '@/components/atoms/label';
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

function Gallery({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);

  const handleOnChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };

  const handlePictureChange = (file: File[]) => {
    console.log(file);
    updateBlock(id, { pictureList: file });
  };

  return (
    <div className="flex flex-col justify-center items-center gap-1 w-93.75 h-65">
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
          <Checkbox>
            <p className="font-normal text-text-secondary text-[13px]">
              팝업뷰어(사진을 터치하여 크게 볼 수 있어요.)
            </p>
          </Checkbox>
        </div>
        <Picture
          label="사진"
          className="py-1"
          multiple={true}
          value={blockInfo.props.pictureList}
          onChange={file => handlePictureChange(file)}
        />
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
