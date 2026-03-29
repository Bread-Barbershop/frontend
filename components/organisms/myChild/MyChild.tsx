import { Plus } from 'lucide-react';
import { useState, useMemo, useEffect, ChangeEvent } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { Input } from '@/components/atoms/input/Input';
import { Label } from '@/components/atoms/label/Label';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextEditor } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { debounce } from '@/shared/utils/debounce';

import PopupOptions from '../popup/PopupOptions';
import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { MYCHILD_SAMPLE_MESSAGES } from './myChildSampleMessages';

import type { JSONContent } from '@tiptap/react';

interface Props {
  blockInfo: EditorBlock<'myChild'>;
  id: string;
}

function createParagraphJson(text: string): JSONContent {
  const lines = text.replace(/\r\n/g, '\n').split('\n');

  return {
    type: 'doc',
    content: lines.map(line =>
      line.length === 0
        ? {
            type: 'paragraph',
            attrs: { textAlign: 'center' },
          }
        : {
            type: 'paragraph',
            attrs: { textAlign: 'center' },
            content: [{ type: 'text', text: line }],
          }
    ),
  };
}

export const MyChild = ({ blockInfo, id }: Props) => {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const [isSamplePopupOpen, setIsSamplePopupOpen] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);
  const debouncedUpdateMessage = useMemo(
    () =>
      debounce((messageJson: JSONContent) => {
        updateBlock(id, {
          messageJson,
          messageHtml: tiptapJsonToHtmlInBrowser(messageJson),
        });
      }, 300),
    [id, updateBlock]
  );

  useEffect(() => {
    return () => {
      debouncedUpdateMessage.cancel();
    };
  }, [debouncedUpdateMessage]);

  const handleStringChange = (
    type: 'title' | 'name' | 'nickname' | 'birthday',
    e: ChangeEvent<HTMLInputElement>
  ) => {
    updateBlock(id, { [type]: e.target.value });
  };

  const handleEditorChange = (json: JSONContent) => {
    debouncedUpdateMessage(json);
  };

  const handleSampleSelect = (text: string) => {
    debouncedUpdateMessage.cancel();
    const messageJson = createParagraphJson(text);
    updateBlock(id, {
      messageJson,
      messageHtml: tiptapJsonToHtmlInBrowser(messageJson),
    });
    setEditorResetKey(prev => prev + 1);
    setIsSamplePopupOpen(false);
  };

  const handlePictureChange = (file: (File | string)[]) => {
    updateBlock(id, { image: file });
  };
  const handlePictureDelete = () => {
    updateBlock(id, { image: [] });
  };

  return (
    <LeftEditorWrapper ariaLabel="아기 소개">
      <NavigationBar>아기 소개</NavigationBar>
      <section className="w-full flex flex-col gap-3 items-start">
        <TextField
          label="제목"
          inputProps={{
            placeholder: '제목을 입력해주세요.',
            value: blockInfo.props.title,
            onChange: e => handleStringChange('title', e),
          }}
          className="text-center w-full"
        />
        <TextField
          label="이름"
          inputProps={{
            placeholder: '아기 이름',
            value: blockInfo.props.name,
            onChange: e => handleStringChange('name', e),
          }}
          className="text-center w-full"
        />
        <TextField
          label="애칭"
          inputProps={{
            placeholder: '콩이',
            value: blockInfo.props.nickname,
            onChange: e => handleStringChange('nickname', e),
          }}
          className="text-center w-full"
        />
        <div className="w-full flex items-center gap-1">
          <Label
            htmlFor="birthday"
            className="font-semibold shrink-0 text-center"
          >
            태어난 날
          </Label>
          <Input
            id="birthday"
            placeholder="2024.12.12"
            value={blockInfo.props.birthday}
            onChange={e => handleStringChange('birthday', e)}
          />
        </div>
      </section>

      <NavigationBar
        action={
          <UtilityButton
            size="md"
            variant="primary"
            onClick={() => setIsSamplePopupOpen(true)}
          >
            <Plus size={16} />
            샘플문구
          </UtilityButton>
        }
        direction="right"
      >
        내용
      </NavigationBar>

      <TextEditor
        key={`${id}-${editorResetKey}`}
        value={blockInfo.props.messageJson}
        defaultText="내용을 입력해 주세요"
        defaultAlign="center"
        onChange={handleEditorChange}
      />

      <Picture
        label="아기 사진"
        className="w-full"
        multiple={false}
        value={blockInfo.props.image}
        onChange={handlePictureChange}
        onDelete={handlePictureDelete}
      />

      {isSamplePopupOpen && (
        <PopupOptions
          popupTitle="샘플 문구"
          options={MYCHILD_SAMPLE_MESSAGES}
          onSelect={handleSampleSelect}
          onClose={() => setIsSamplePopupOpen(false)}
        />
      )}
    </LeftEditorWrapper>
  );
};
