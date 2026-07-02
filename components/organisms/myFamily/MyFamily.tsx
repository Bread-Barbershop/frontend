import { JSONContent } from '@tiptap/core';
import { ChangeEvent, useEffect, useState } from 'react';

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
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

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
    subTitle,
    checkedSubTitle,
    checkedMessage,
    messageJson,
  } = blockInfo.props;
  const updateBlock = useEditorStore(state => state.updateBlock);
  const updateImage = useEditorStore(state => state.updateImage);

  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const handleMenuToggle = (index: number) => {
    setOpenMenuIndex(prev => (prev === index ? null : index));
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, {
      title: e.target.value || '저희 가족을 소개합니다.',
    });
  };

  const handleEnglishTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, {
      subTitle: sanitizeEnglishTitleInput(e.target) || 'MY FAMILY',
    });
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
    updateBlock(id, {
      messageJson: json,
      messageHtml: tiptapJsonToHtmlInBrowser(json),
    });
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
    const deleteId = family?.[index].id ?? '';
    updateBlock(id, {
      family: family?.filter((_, i) => i !== index),
    });
    updateImage(deleteId, []);
  };

  const handleCheckedChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: 'checkedSubTitle' | 'checkedMessage'
  ) => {
    const isChecked = e.target.checked;
    const updateData: Record<string, unknown> = { [type]: isChecked };

    if (!isChecked) {
      if (type === 'checkedSubTitle') {
        updateData.subTitle = '';
      } else if (type === 'checkedMessage') {
        updateData.messageJson = null;
        updateData.messageHtml = null;
      }
    }

    updateBlock(id, updateData);
  };

  const handleImageChange = (index: number, value: (File | string)[]) => {
    const selectId = family?.[index].id ?? '';
    const newFamily = (family || []).map((member, i) =>
      i === index ? { ...member, image: value } : member
    );

    updateBlock(id, {
      family: newFamily,
    });
    updateImage(selectId, value);
  };

  const handleImageDelete = (index: number) => {
    const newFamily = (family || []).map((member, i) =>
      i === index ? { ...member, image: [] } : member
    );
    const deleteId = family?.[index].id ?? '';

    updateBlock(id, {
      family: newFamily,
    });
    updateImage(deleteId, []);
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
    <LeftEditorWrapper ariaLabel="가족 소개" className="min-h-60">
      <NavigationBar
        action={
          <UtilityButton size="md" variant="primary" onClick={handleAddFamily}>
            소개추가
          </UtilityButton>
        }
        direction="right"
      >
        가족 소개 편집 페이지
      </NavigationBar>
      <TextField
        label="제목"
        inputProps={{
          placeholder: '저희 가족을 소개합니다.',
          value: title === '저희 가족을 소개합니다.' ? '' : title,
          onChange: handleTitleChange,
        }}
        className="w-full py-1.5 text-center"
      />
      {checkedSubTitle && (
        <TextField
          label="영문제목"
          inputProps={{
            placeholder: 'MY FAMILY',
            value: subTitle === 'MY FAMILY' ? '' : subTitle,
            onChange: handleEnglishTitleChange,
          }}
          className="w-full py-1.5 text-center"
        />
      )}
      <Divider className="w-full" />
      <section className="flex flex-col gap-1 w-full">
        {(family || []).map((member, index) => (
          <div key={member.id} className="flex flex-col gap-1 w-full">
            {index !== 0 && <Divider className="w-full" />}
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
          checked={checkedSubTitle}
          onChange={e => handleCheckedChange(e, 'checkedSubTitle')}
        >
          <span className="text-[13px]">영문 제목 추가</span>
        </Checkbox>
        <Checkbox
          checked={checkedMessage}
          onChange={e => handleCheckedChange(e, 'checkedMessage')}
        >
          <span className="text-[13px]">내용 추가</span>
        </Checkbox>
      </section>
    </LeftEditorWrapper>
  );
};
