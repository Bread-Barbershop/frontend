'use client';

import { JSONContent } from '@tiptap/core';
import React, { useCallback, useRef } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { Divider } from '@/components/atoms/divider';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor, type TextEditorRef } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { TimeSelector } from '@/components/molecules/time-selector';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { addHyphenToDate } from './utils/utils';

interface Props {
  blockInfo: EditorBlock<'calendar'>;
  id: string;
}

export function Calendar({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const textEditorRef = useRef<TextEditorRef>(null);

  const handleInsertDday = useCallback(() => {
    textEditorRef.current?.insertText('(D-Day)');
  }, []);

  const defaultTitle =
    blockInfo.type === 'wedding'
      ? '예식 일시 편집 페이지'
      : '행사 일시 편집 페이지';
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

  const handleEditorChange = (json: JSONContent) => {
    updateBlock(id, {
      messageJson: json,
      messageHtml: tiptapJsonToHtmlInBrowser(json),
    });
  };
  const handleEnglishTitleCheck = useCallback(
    ({ target: { checked } }: React.ChangeEvent<HTMLInputElement>) => {
      updateBlock(id, { isEnglishTitle: checked });
    },
    [id, updateBlock]
  );
  const handleEnglishTitleChange = useCallback(
    ({ target }: React.ChangeEvent<HTMLInputElement>) => {
      updateBlock(id, { englishTitle: sanitizeEnglishTitleInput(target) });
    },
    [id, updateBlock]
  );

  const handleTitleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
      updateBlock(id, { title: value });
    },
    [id, updateBlock]
  );

  return (
    <LeftEditorWrapper ariaLabel="행사 일시">
      <NavigationBar>{defaultTitle}</NavigationBar>

      <div className="w-full flex flex-col gap-3">
        <TextField
          key={`title-${id}`}
          label="제목"
          inputProps={{
            placeholder:
              blockInfo.type === 'wedding' ? '예식 일시' : '행사 일시',
            defaultValue: blockInfo.props.title,
            onChange: handleTitleChange,
          }}
          className="w-full text-center py-1.5"
        />

        {blockInfo.props.isEnglishTitle && (
          <TextField
            key={`english-title-${id}`}
            label="영문제목"
            inputProps={{
              placeholder:
                blockInfo.type === 'wedding'
                  ? 'THE WEDDING DATE'
                  : 'THE EVENT DATE',
              defaultValue: blockInfo.props.englishTitle,
              onChange: handleEnglishTitleChange,
            }}
            className="w-full text-center py-1.5"
          />
        )}

        <Divider className="w-full" />
        <TextField
          label={blockInfo.type === 'wedding' ? '예식일' : '행사일'}
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
            {blockInfo.type === 'wedding' ? '예식시간' : '행사시간'}
          </Label>
          <div className="min-w-0 flex-1">
            <TimeSelector
              value={blockInfo.props.time}
              onChange={handleTimeChange}
            />
          </div>
        </div>
        <NavigationBar
          action={<UtilityButton size="sm" onClick={handleInsertDday}>디데이</UtilityButton>}
          direction="right"
        >
          디데이&카운트다운
        </NavigationBar>
        <div className="flex flex-col items-center gap-2 w-full ">
          <div>
            <TextEditor
              key={id}
              ref={textEditorRef}
              value={blockInfo.props.messageJson}
              defaultText={
                blockInfo.type === 'wedding'
                  ? '신랑과 신부의 특별한 약속이 이루어지기까지 (D-Day)일이 남았습니다.'
                  : '내용을 입력해주세요.'
              }
              defaultAlign="center"
              onChange={handleEditorChange}
            />
          </div>
          <div className="flex items-center gap-2 w-full mb-4">
            <Label className="w-14 text-center font-semibold shrink-0">
              추가기능
            </Label>
            <div className="flex flex-col">
              <div className="flex gap-3">
                <Checkbox
                  checked={blockInfo.props.isEnglishTitle}
                  onChange={handleEnglishTitleCheck}
                >
                  영문 제목 추가
                </Checkbox>
                <Checkbox
                  checked={blockInfo.props.showDday}
                  onChange={handleShowDdayChange}
                >
                  디데이&카운트다운
                </Checkbox>
              </div>
              <Checkbox
                checked={blockInfo.props.showCalendar}
                onChange={handleShowCalendarChange}
              >
                캘린더
              </Checkbox>
            </div>
          </div>
        </div>
        <EditorNoticeList
          notices={[
            {
              id: 'calendar-dday',
              text: '디데이 버튼 클릭 시 (D-Day)가 추가되며, (D-Day)에 남은 일수가 표시됩니다.',
              colorClass: 'text-[#1F72EF]',
            },
          ]}
        />
      </div>
    </LeftEditorWrapper>
  );
}
