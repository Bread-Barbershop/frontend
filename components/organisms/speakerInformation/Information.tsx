import { ChangeEvent } from 'react';

import { ActionField } from '@/components/molecules/action-field/ActionField';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextEditor } from '@/components/molecules/text-editor/TextEditor';
import { cn } from '@/shared/utils/cn';

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
      <ActionField
        label="이름"
        inputProps={{
          placeholder: '성함을 입력해 주세요.',
          value: speaker.name,
          onChange: e => onStringChange('name', e),
        }}
        className="w-full text-center"
        buttonProps={{
          onClick: onDelete,
          children: <p className="text-red-500">삭제</p>,
          className: cn(
            speakerLength > 1 ? 'block border-none w-[32px]' : 'hidden'
          ),
        }}
      />
      <NavigationBar>내용</NavigationBar>

      <TextEditor
        value={speaker.messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={onEditorChange}
      />

      <div className="mt-1 w-full">
        <Picture
          label="사진"
          className="w-full text-center"
          multiple={false}
          value={speaker.image}
          onChange={onPictureChange}
          onDelete={onPictureDelete}
        />
      </div>
    </section>
  );
};
