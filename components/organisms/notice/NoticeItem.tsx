import { ChangeEvent } from 'react';

import { ActionField } from '@/components/molecules/action-field/ActionField';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextEditor } from '@/components/molecules/text-editor';
import { cn } from '@/shared/utils/cn';

import { DEFAULT_NOTICE_TITLE, type NoticeListItem } from './noticeList';

import type { JSONContent } from '@tiptap/react';

interface Props {
  id: string;
  notice: NoticeListItem;
  noticeLength: number;
  editorResetKey: number;
  onNoticeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEditorChange: (json: JSONContent) => void;
  onPictureChange: (file: (File | string)[]) => void;
  onPictureDelete: () => void;
  onDelete: () => void;
  loadingCount?: number;
}

export const NoticeItem = ({
  id,
  notice,
  noticeLength,
  editorResetKey,
  onNoticeChange,
  onEditorChange,
  onPictureChange,
  onPictureDelete,
  onDelete,
  loadingCount = 0,
}: Props) => {
  return (
    <div className="flex flex-col gap-1 relative group">
      <ActionField
        label="공지제목"
        inputProps={{
          placeholder: '제목을 입력해 주세요',
          value: notice.notice === DEFAULT_NOTICE_TITLE ? '' : notice.notice,
          onChange: onNoticeChange,
        }}
        className="w-full py-1.5 text-center"
        buttonProps={{
          onClick: onDelete,
          children: <p className="text-red-500">삭제</p>,
          className: cn(
            noticeLength > 1 ? 'block border-none w-[32px]' : 'hidden'
          ),
        }}
      />
      <div className="flex flex-col gap-1">
        <NavigationBar className="min-h-auto h-8">내용</NavigationBar>
        <TextEditor
          key={`${id}-${notice.id}-${editorResetKey}`}
          value={notice.content.messageJson}
          defaultText="내용을 입력해 주세요"
          defaultAlign="center"
          onChange={onEditorChange}
        />
        <Picture
          label="배너사진"
          className="w-full py-1.5 text-center"
          multiple={false}
          value={notice.image}
          onChange={onPictureChange}
          onDelete={onPictureDelete}
          loadingCount={loadingCount}
        />
      </div>
    </div>
  );
};
