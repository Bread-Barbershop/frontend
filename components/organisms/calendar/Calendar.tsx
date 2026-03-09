import React from 'react';
import { useShallow } from 'zustand/shallow';

import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

interface Props {
  blockInfo: EditorBlock<'calendar'>;
  id: string;
}

export function Calendar({ blockInfo, id }: Props) {
  const { updateBlock } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
    }))
  );

  const handleShowCalendarChange = ({
    target: { checked },
  }: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { showCalendar: checked });
  };

  const handleDateChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { date: value });
  };

  // const formattedDate = useMemo(() => {
  //   if (!blockInfo.props.date) return '';
  //   const date = new Date(blockInfo.props.date);
  //   if (!isNaN(date.getTime())) {
  //     return date.toISOString().split('T')[0];
  //   }
  //   return '';
  // }, [blockInfo.props.date]);

  return (
    <div className="flex flex-col justify-center items-center gap-1">
      <NavigationBar>행사 일시</NavigationBar>
      <div className="px-5 w-full flex flex-col gap-3">
        <TextField
          label="예식일"
          inputProps={{
            placeholder: '2026-03-09',
            onChange: handleDateChange,
          }}
        />
        <TextField
          label="예식시간"
          inputProps={{ placeholder: '오후 12:00' }}
        />
        <div className="flex gap-2 mb-4">
          <Label>추가기능</Label>
          <Checkbox
            checked={blockInfo.props.showCalendar}
            onChange={handleShowCalendarChange}
          >
            캘린더
          </Checkbox>
          <Checkbox>디데이&카운트다운</Checkbox>
        </div>
      </div>
    </div>
  );
}
