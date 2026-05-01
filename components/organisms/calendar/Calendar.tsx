'use client';

import React, { useCallback } from 'react';

import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextField } from '@/components/molecules/text-field';
import { TimeSelector } from '@/components/molecules/time-selector';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { addHyphenToDate } from './utils/utils';

interface Props {
  blockInfo: EditorBlock<'calendar'>;
  id: string;
}

export function Calendar({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);

  const handleShowCalendarChange = useCallback(
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      updateBlock(id, { showCalendar: checked });
    },
    [id, updateBlock]
  );

  const handleShowDdayChange = useCallback(
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      updateBlock(id, { showDday: checked });
    },
    [id, updateBlock]
  );

  const handleDateChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      if (/[^\d-]/.test(value)) return;

      const formattedDate = addHyphenToDate(value.replace(/\D/g, ''));

      // 10자리가 완성되었을 때 과거 날짜인지 체크
      if (formattedDate.length === 10) {
        const inputDate = new Date(formattedDate);
        const today = new Date();
        // 시간 부분을 0으로 초기화하여 날짜만 비교
        today.setHours(0, 0, 0, 0);

        if (inputDate < today) {
          // 과거 날짜를 입력한 경우 얼럿을 띄우고 상태 업데이트를 막음
          if (typeof window !== 'undefined') {
            alert('이전 날짜는 입력할 수 없습니다.');
          }
          return;
        }
      }

      updateBlock(id, { date: formattedDate });
    },
    [id, updateBlock]
  );

  const handleTimeChange = useCallback(
    (value: string) => {
      updateBlock(id, { time: value });
    },
    [id, updateBlock]
  );

  return (
    <LeftEditorWrapper ariaLabel="행사 일시">
      <NavigationBar>행사 일시</NavigationBar>
      <div className="w-full flex flex-col gap-3">
        <TextField
          label="예식일"
          className="w-full"
          labelClassName="w-14 text-center"
          inputProps={{
            placeholder: '2026-03-09',
            value: blockInfo.props.date ? String(blockInfo.props.date) : '',
            onChange: handleDateChange,
            maxLength: 10,
          }}
        />
        <div className="flex items-center gap-2 w-full">
          <Label className="w-14 text-center font-semibold shrink-0">
            예식시간
          </Label>
          <div className="min-w-0 flex-1">
            <TimeSelector
              value={blockInfo.props.time}
              onChange={handleTimeChange}
            />
          </div>
        </div>
        <NavigationBar>디데이&카운트다운</NavigationBar>
        <div className="flex items-center gap-2 w-full mb-4">
          <Label className="w-14 text-center font-semibold shrink-0">
            추가기능
          </Label>
          <Checkbox
            checked={blockInfo.props.showCalendar}
            onChange={handleShowCalendarChange}
          >
            캘린더
          </Checkbox>
          <Checkbox
            checked={blockInfo.props.showDday}
            onChange={handleShowDdayChange}
          >
            디데이&카운트다운
          </Checkbox>
        </div>
      </div>
    </LeftEditorWrapper>
  );
}
