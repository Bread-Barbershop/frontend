import { JSONContent } from '@tiptap/core';
import { Plus } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field/TextField';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { debounce } from '@/shared/utils/debounce';

import PopupOptions from '../popup/PopupOptions';
import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { Member } from './Member';
import { MYFAMILY_SAMPLE_MESSAGES } from './myFamilySampleMessages';

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

interface Props {
  blockInfo: EditorBlock<'myFamily'>;
  id: string;
}

export const MyFamily = ({ blockInfo, id }: Props) => {
  const {
    family,
    title,
    checkedImage,
    checkedTitle,
    checkedMessage,
    messageJson,
  } = blockInfo.props;
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

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };

  const handleRelationChange = (index: number, value: string) => {
    updateBlock(id, {
      family: family?.map((member, i) =>
        i === index ? { ...member, relation: value } : member
      ),
    });
  };

  const handleNameChange = (
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    updateBlock(id, {
      family: family?.map((member, i) =>
        i === index ? { ...member, name: e.target.value } : member
      ),
    });
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

  const handleAddFamily = () => {
    const newFamily = [...(family || []), { relation: '', name: '' }];
    updateBlock(id, { family: newFamily });
  };

  const handleCheckedChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: 'checkedImage' | 'checkedTitle' | 'checkedMessage'
  ) => {
    updateBlock(id, { [type]: e.target.checked });
  };

  const handleImageChange = (index: number, value: (File | string)[]) => {
    updateBlock(id, {
      family: family?.map((member, i) =>
        i === index ? { ...member, image: value } : member
      ),
    });
  };

  useEffect(() => {
    if (family && family.length > 0) return;
    const newFamily = [
      { relation: '', name: '' },
      { relation: '', name: '' },
    ];
    updateBlock(id, { family: newFamily });
  }, [id, family, updateBlock]);

  return (
    <LeftEditorWrapper ariaLabel="가족 소개" className="gap-3">
      <NavigationBar
        action={
          <UtilityButton size="md" variant="primary" onClick={handleAddFamily}>
            소개추가
          </UtilityButton>
        }
        direction="right"
      >
        가족 소개
      </NavigationBar>
      <section className="flex flex-col gap-3 w-full">
        {(family || []).map((member, index) => (
          <div key={index} className="flex flex-col gap-2 w-full">
            {index !== 0 && (
              <div className="flex flex-col items-center gap-1">
                <div className="w-0.5 h-1 rounded-sm bg-text-secondary" />
                <div className="w-0.5 h-1 rounded-sm bg-text-secondary" />
                <div className="w-0.5 h-1 rounded-sm bg-text-secondary" />
              </div>
            )}
            <Member
              index={index}
              member={member}
              checkedImage={checkedImage}
              onRelationChange={handleRelationChange}
              onNameChange={handleNameChange}
              onImageChange={handleImageChange}
            />
          </div>
        ))}
      </section>
      {checkedTitle && (
        <TextField
          label="제목"
          inputProps={{
            placeholder: '제목을 입력해주세요.',
            value: title,
            onChange: handleTitleChange,
          }}
          className="text-center w-full"
        />
      )}
      {checkedMessage && (
        <>
          <NavigationBar
            action={
              <UtilityButton
                size="md"
                variant="primary"
                onClick={() => setIsSamplePopupOpen(true)}
              >
                샘플문구
                <Plus size={16} />
              </UtilityButton>
            }
            direction="right"
          >
            내용
          </NavigationBar>
          <TextEditor
            key={`${id}-${editorResetKey}`}
            value={messageJson}
            defaultText="내용을 입력해 주세요"
            defaultAlign="center"
            onChange={handleEditorChange}
          />
        </>
      )}
      <section className="flex items-center justify-center -mx-2 gap-1">
        <Label className="font-semibold">추가기능</Label>
        <Checkbox
          className="text-[13px]"
          checked={checkedImage}
          onChange={e => handleCheckedChange(e, 'checkedImage')}
        >
          프로필 사진 추가
        </Checkbox>
        <Checkbox
          className="text-[13px]"
          checked={checkedTitle}
          onChange={e => handleCheckedChange(e, 'checkedTitle')}
        >
          제목 추가
        </Checkbox>
        <Checkbox
          className="text-[13px]"
          checked={checkedMessage}
          onChange={e => handleCheckedChange(e, 'checkedMessage')}
        >
          내용 추가
        </Checkbox>
      </section>
      {isSamplePopupOpen && (
        <PopupOptions
          popupTitle="샘플 문구"
          options={MYFAMILY_SAMPLE_MESSAGES}
          onSelect={handleSampleSelect}
          onClose={() => setIsSamplePopupOpen(false)}
        />
      )}
    </LeftEditorWrapper>
  );
};
