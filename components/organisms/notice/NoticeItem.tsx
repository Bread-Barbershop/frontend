import { ChangeEvent } from 'react';

import { ActionField } from '@/components/molecules/action-field/ActionField';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextEditor } from '@/components/molecules/text-editor';
import { cn } from '@/shared/utils/cn';

import type { JSONContent } from '@tiptap/react';

interface Props {
  id: string;
  notice: {
    id: string;
    notice: string;
    messageJson: JSONContent | null;
    messageHtml: string | null;
    image: (File | string)[];
  };
  noticeLength: number;
  editorResetKey: number;
  onNoticeChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEditorChange: (json: JSONContent) => void;
  onPictureChange: (file: (File | string)[]) => void;
  onPictureDelete: () => void;
  onDelete: () => void;
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
}: Props) => {
  return (
    <div className="flex flex-col gap-2 relative group">
      <ActionField
        label="공지사항"
        inputProps={{
          placeholder: '공지사항을 입력해 주세요',
          value: notice.notice,
          onChange: onNoticeChange,
        }}
        className="w-full text-center"
        buttonProps={{
          onClick: onDelete,
          children: <p className="text-red-500 ">삭제</p>,
          className: cn(
            noticeLength > 1
              ? 'block flex items-center justify-center'
              : 'hidden'
          ),
        }}
      />
      <NavigationBar>내용</NavigationBar>
      <TextEditor
        key={`${id}-${notice.id}-${editorResetKey}`}
        value={notice.messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={onEditorChange}
      />
      <Picture
        label="사진"
        className="w-full text-center"
        multiple={false}
        value={notice.image}
        onChange={onPictureChange}
        onDelete={onPictureDelete}
      />
    </div>
  );
};
