import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextEditor } from '@/components/molecules/text-editor';
import { EditorBlock } from '@/shared/types/block';

import type { JSONContent } from '@tiptap/react';

interface Props {
  id: string;
  editorResetKey: number;
  blockInfo: EditorBlock<'notice'>;
  handleEditorChange: (json: JSONContent) => void;
  handlePictureChange: (file: (File | string)[]) => void;
}

export const NoticeItem = ({
  id,
  editorResetKey,
  blockInfo,
  handleEditorChange,
  handlePictureChange,
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
      <Picture
        label="썸네일"
        className="w-full"
        multiple={false}
        value={blockInfo.props.image}
        onChange={file => handlePictureChange(file)}
      />
    </>
  );
};
