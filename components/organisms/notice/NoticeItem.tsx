import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor } from '@/components/molecules/text-editor';
import { EditorBlock } from '@/shared/types/block';

import type { JSONContent } from '@tiptap/react';

interface Props {
  id: string;
  editorResetKey: number;
  blockInfo: EditorBlock<'notice'>;
  handleEditorChange: (json: JSONContent) => void;
}

export const NoticeItem = ({
  id,
  editorResetKey,
  blockInfo,
  handleEditorChange,
}: Props) => {
  return (
    <>
      <NavigationBar>내용</NavigationBar>
      <TextEditor
        key={`${id}-${editorResetKey}`}
        value={blockInfo.props.messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={handleEditorChange}
      />
    </>
  );
};
