import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextEditor } from '@/components/molecules/text-editor';

import type { JSONContent } from '@tiptap/react';

interface Props {
  id: string;
  item: {
    id: string;
    messageJson: JSONContent | null;
    messageHtml: string | null;
    image: (File | string)[];
  };
  editorResetKey: number;
  onEditorChange: (json: JSONContent) => void;
  onPictureChange: (file: (File | string)[]) => void;
  onDelete: () => void;
}

export const NoticeItem = ({
  id,
  item,
  editorResetKey,
  onEditorChange,
  onPictureChange,
  onDelete,
}: Props) => {
  return (
    <div className="flex flex-col gap-4 relative group">
      <NavigationBar
        action={
          <UtilityButton
            size="sm"
            variant="danger"
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            삭제
          </UtilityButton>
        }
      >
        내용
      </NavigationBar>
      <TextEditor
        key={`${id}-${item.id}-${editorResetKey}`}
        value={item.messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={onEditorChange}
      />
      <Picture
        label="썸네일"
        className="w-full"
        multiple={false}
        value={item.image}
        onChange={onPictureChange}
      />
    </div>
  );
};
