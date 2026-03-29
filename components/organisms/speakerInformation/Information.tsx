import { ChangeEvent } from 'react';

import { UtilityButton } from '@/components/atoms/button/UtilityButton';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextEditor } from '@/components/molecules/text-editor/TextEditor';
import { TextField } from '@/components/molecules/text-field';

import type { JSONContent } from '@tiptap/react';

interface Props {
  id: string;
  speaker: {
    id: string;
    name: string;
    messageJson: JSONContent | null;
    messageHtml: string | null;
    image: (File | string)[];
  };
  onStringChange: (type: 'name', e: ChangeEvent<HTMLInputElement>) => void;
  onEditorChange: (json: JSONContent) => void;
  onPictureChange: (file: (File | string)[]) => void;
  onPictureDelete: () => void;
  onDelete: () => void;
  speakerLength: number;
}
export const Information = ({
  speaker,
  speakerLength,
  onStringChange,
  onEditorChange,
  onPictureChange,
  onPictureDelete,
  onDelete,
}: Props) => {
  return (
    <section className="flex flex-col gap-1">
      <NavigationBar
        action={
          speakerLength > 1 && (
            <UtilityButton
              size="sm"
              variant="danger"
              onClick={onDelete}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              삭제
            </UtilityButton>
          )
        }
      >
        내용
      </NavigationBar>
      <TextField
        label="이름"
        inputProps={{
          placeholder: '연사자 성함',
          value: speaker.name,
          onChange: e => onStringChange('name', e),
        }}
        className="text-center w-full"
      />

      <TextEditor
        value={speaker.messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={onEditorChange}
      />

      <Picture
        label="연사자 사진"
        className="w-full"
        multiple={false}
        value={speaker.image}
        onChange={onPictureChange}
        onDelete={onPictureDelete}
      />
    </section>
  );
};
