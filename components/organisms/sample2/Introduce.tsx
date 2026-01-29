import { ChangeEvent } from 'react';

import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { TextField } from '@/components/molecules/text-field';
import {
  EditorBlock,
  useEditorStore,
} from '@/widgets/editor/store/useEditorStore';

interface Props {
  blockInfo: EditorBlock<'introduce'>;
  id: string;
}

function Introduce({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);

  const handleChangeGroom = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { groom: e.target.value });
  };
  const handleChangebride = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { bride: e.target.value });
  };
  return (
    <div className="flex-center flex-col w-[375px] px-5">
      <h2 className="py-[13.5px]">신랑신부소개</h2>
      <div className="w-full">
        <TextField
          label="신랑"
          className="h-11 gap-6"
          inputProps={{
            onChange: handleChangeGroom,
            placeholder: blockInfo.props.groom,
          }}
        />
        <TextField
          label="신부"
          className="h-11 gap-6"
          inputProps={{
            onChange: handleChangebride,
            placeholder: blockInfo.props.bride,
          }}
        />
      </div>
      <div className="flex gap-2 items-center">
        <p className="px-1 py-0.5 mr-2 text-sm">추가기능</p>
        <div className="flex gap-2 flex-1 flex-wrap">
          <Checkbox>
            <p className="font-normal text-[13px] text-text-secondary">
              프로필 사진 추가
            </p>
          </Checkbox>
          <Checkbox>
            <p className="font-normal text-[13px] text-text-secondary">
              제목 추가
            </p>
          </Checkbox>
          <Checkbox>
            <p className="font-normal text-[13px] text-text-secondary">
              내용추가
            </p>
          </Checkbox>
          <Checkbox>
            <p className="font-normal text-[13px] text-text-secondary">
              신부 측 먼저 표시하기
            </p>
          </Checkbox>
        </div>
      </div>
    </div>
  );
}
export default Introduce;
