import { ChangeEvent } from 'react';

import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { TextField } from '@/components/molecules/text-field';
import {
  EditorBlock,
  useEditorStore,
} from '@/widgets/editor/store/useEditorStore';

interface Props {
  blockInfo: EditorBlock<'weddingDay'>;
  id: string;
}

function WeddingDay({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);

  const handleInputOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, {
      weddingDay: e.target.value,
    });
  };
  const handleInputOnChange2 = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, {
      weddingTime: e.target.value,
    });
  };

  return (
    <div className="w-[375px]">
      <div className="py-[13.5px] px-5 flex flex-col gap-1 items-center">
        <h2>행사 일시</h2>
        <div className="py-1.5 mb-1 w-full">
          <TextField
            label="예식일"
            inputProps={{
              onChange: e => handleInputOnChange(e),
              defaultValue: blockInfo?.props.weddingDay,
            }}
            className="w-full "
          />
        </div>
        <div className="py-1.5 mb-1 w-full">
          <TextField
            label="예식시간"
            inputProps={{
              onChange: e => handleInputOnChange2(e),
              defaultValue: blockInfo?.props.weddingTime,
            }}
            className="w-full"
          />
        </div>

        <div className="flex w-full items-center gap-3">
          <p className="px-1 py-0.5 mr-2 text-sm">추가기능</p>
          <div className="flex gap-2 flex-1 flex-wrap">
            <Checkbox className="text-text-secondary">
              <p className="font-normal text-size text-text-secondary">
                캘린더
              </p>
            </Checkbox>
            <Checkbox>
              <p className="font-normal text-[13px] text-text-secondary">
                내용 추가
              </p>
            </Checkbox>
            <Checkbox>
              <p className="font-normal text-[13px] text-text-secondary">
                디데이&카운트다운
              </p>
            </Checkbox>
          </div>
        </div>
      </div>
    </div>
  );
}
export default WeddingDay;
