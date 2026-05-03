import { JSONContent } from '@tiptap/core';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { Divider } from '@/components/atoms/divider/Divider';
import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { TextEditor } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field/TextField';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { debounce } from '@/shared/utils/debounce';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { Member } from './Member';

interface Props {
  blockInfo: EditorBlock<'myFamily'>;
  id: string;
}

export const MyFamily = ({ blockInfo, id }: Props) => {
  const {
    family,
    title,
    englishTitle,
    checkedEnglishTitle,
    checkedMessage,
    messageJson,
  } = blockInfo.props;
  const updateBlock = useEditorStore(state => state.updateBlock);
  const updateImage = useEditorStore(state => state.updateImage);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const handleMenuToggle = (index: number) => {
    setOpenMenuIndex(prev => (prev === index ? null : index));
  };

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

  const handleEnglishTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { englishTitle: e.target.value });
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

  const handleFlowerChange = (index: number, value: boolean) => {
    updateBlock(id, {
      family: family?.map((member, i) =>
        i === index ? { ...member, flower: value } : member
      ),
    });
  };

  const handleEditorChange = (json: JSONContent) => {
    debouncedUpdateMessage(json);
  };

  const handleAddFamily = () => {
    const newFamily = [
      ...(family || []),
      {
        id: crypto.randomUUID(),
        relation: '',
        name: '',
        image: [],
        flower: false,
      },
    ];
    updateBlock(id, { family: newFamily });
  };

  const handleDeleteFamily = (index: number) => {
    updateBlock(id, {
      family: family?.filter((_, i) => i !== index),
    });
  };

  const handleCheckedChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: 'checkedEnglishTitle' | 'checkedMessage'
  ) => {
    const isChecked = e.target.checked;
    const updateData: Record<string, unknown> = { [type]: isChecked };

    if (!isChecked) {
      if (type === 'checkedEnglishTitle') {
        updateData.englishTitle = '';
      } else if (type === 'checkedMessage') {
        debouncedUpdateMessage.cancel();
        updateData.messageJson = null;
        updateData.messageHtml = null;
      }
    }

    updateBlock(id, updateData);
  };

  const handleImageChange = (index: number, value: (File | string)[]) => {
    const newFamily = (family || []).map((member, i) =>
      i === index ? { ...member, image: value } : member
    );
    const allImages = newFamily.flatMap(member => member.image || []);

    updateBlock(id, {
      family: newFamily,
      image: allImages,
    });
    updateImage(id, allImages);
  };

  const handleImageDelete = (index: number) => {
    const newFamily = (family || []).map((member, i) =>
      i === index ? { ...member, image: [] } : member
    );
    const allImages = newFamily.flatMap(member => member.image || []);

    updateBlock(id, {
      family: newFamily,
      image: allImages,
    });
    updateImage(id, allImages);
  };

  useEffect(() => {
    if (family && family.length > 0) return;
    const newFamily = [
      { id: crypto.randomUUID(), relation: '', name: '', image: [] },
      { id: crypto.randomUUID(), relation: '', name: '', image: [] },
    ];
    updateBlock(id, { family: newFamily });
  }, [id, family, updateBlock]);

  return (
    <LeftEditorWrapper ariaLabel="가족 소개" className="gap-3 min-h-60">
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
      <TextField
        label="제목"
        inputProps={{
          placeholder: '입력하지 않을 시 기본 문구로 작성됩니다.',
          value: title,
          onChange: handleTitleChange,
        }}
        className="text-center w-full"
      />
      {checkedEnglishTitle && (
        <TextField
          label="영문제목"
          inputProps={{
            placeholder: '입력하지 않을 시 기본 문구로 작성됩니다.',
            value: englishTitle,
            onChange: handleEnglishTitleChange,
          }}
          className="text-center w-full"
        />
      )}
      <Divider className="w-full" />
      <section className="flex flex-col gap-3 w-full">
        {(family || []).map((member, index) => (
          <div key={index} className="flex flex-col gap-2 w-full">
            {index !== 0 && <Divider />}
            <Member
              index={index}
              member={member}
              onRelationChange={handleRelationChange}
              onNameChange={handleNameChange}
              onImageChange={handleImageChange}
              onImageDelete={handleImageDelete}
              onDelete={handleDeleteFamily}
              onFlowerChange={handleFlowerChange}
              isOpen={openMenuIndex === index}
              onToggle={handleMenuToggle}
            />
          </div>
        ))}
      </section>
      {checkedMessage && (
        <>
          <NavigationBar className="h-8">내용</NavigationBar>
          <TextEditor
            value={messageJson}
            defaultText="내용을 입력해 주세요"
            defaultAlign="center"
            onChange={handleEditorChange}
          />
        </>
      )}
      <section className="flex w-full -mx-2 gap-1 py-1.5">
        <Label className="font-semibold">추가기능</Label>
        <Checkbox
          className="text-[13px]"
          checked={checkedEnglishTitle}
          onChange={e => handleCheckedChange(e, 'checkedEnglishTitle')}
        >
          영문 제목 추가
        </Checkbox>
        <Checkbox
          className="text-[13px]"
          checked={checkedMessage}
          onChange={e => handleCheckedChange(e, 'checkedMessage')}
        >
          내용 추가
        </Checkbox>
      </section>
    </LeftEditorWrapper>
  );
};
