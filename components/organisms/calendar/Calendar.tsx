'use client';

import React, { useCallback } from 'react';

import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextField } from '@/components/molecules/text-field';
import { TimeSelector } from '@/components/molecules/time-selector';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

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
      // 숫자만 추출
      const numbersOnly = value.replace(/\D/g, '');
      let formattedDate = '';

      // 숫자 개수에 따라 하이픈 자동 삽입 (지울 때 자연스럽게 삭제되도록 길이 기준 적용)
      if (numbersOnly.length < 5) {
        formattedDate = numbersOnly;
      } else if (numbersOnly.length < 7) {
        formattedDate = `${numbersOnly.slice(0, 4)}-${numbersOnly.slice(4)}`;
      } else {
        formattedDate = `${numbersOnly.slice(0, 4)}-${numbersOnly.slice(4, 6)}-${numbersOnly.slice(6, 8)}`;
      }

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
    <div className="flex flex-col justify-center items-center gap-1">
      <NavigationBar>행사 일시</NavigationBar>
      <div className="px-5 w-full flex flex-col gap-3">
        <TextField
          label="예식일"
          inputProps={{
            placeholder: '2026-03-09',
            value: blockInfo.props.date ? String(blockInfo.props.date) : '',
            onChange: handleDateChange,
            maxLength: 10,
          }}
        />
        <div className="flex items-center">
          <Label>예식시간</Label>
          <div className="flex-1">
            <TimeSelector
              value={blockInfo.props.time || '오후 12:00'}
              onChange={handleTimeChange}
            />
          </div>
        </div>
        <NavigationBar>디데이&카운트다운</NavigationBar>
        <div className="flex gap-2 mb-4">
          <Label>추가기능</Label>
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
    </div>
  );
}
