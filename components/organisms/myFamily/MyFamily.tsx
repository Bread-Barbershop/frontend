import { JSONContent } from '@tiptap/core';
import { ChangeEvent, useEffect, useMemo } from 'react';

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
    checkedImage,
    checkedTitle,
    checkedMessage,
    messageJson,
  } = blockInfo.props;
  const updateBlock = useEditorStore(state => state.updateBlock);
  const updateImage = useEditorStore(state => state.updateImage);

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
      { relation: '', name: '', image: [], flower: false },
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
    type: 'checkedImage' | 'checkedTitle' | 'checkedMessage'
  ) => {
    const isChecked = e.target.checked;
    const updateData: Record<string, unknown> = { [type]: isChecked };

    if (!isChecked) {
      if (type === 'checkedTitle') {
        updateData.title = '';
      } else if (type === 'checkedMessage') {
        debouncedUpdateMessage.cancel();
        updateData.messageJson = null;
        updateData.messageHtml = null;
      } else if (type === 'checkedImage') {
        const newFamily = (family || []).map(member => ({
          ...member,
          image: [],
        }));
        updateData.family = newFamily;
        updateData.image = [];
        updateImage(id, []);
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
      { relation: '', name: '', image: [] },
      { relation: '', name: '', image: [] },
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
              onImageDelete={handleImageDelete}
              onDelete={handleDeleteFamily}
              onFlowerChange={handleFlowerChange}
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
          <NavigationBar className="h-8">내용</NavigationBar>
          <TextEditor
            value={messageJson}
            defaultText="내용을 입력해 주세요"
            defaultAlign="center"
            onChange={handleEditorChange}
          />
        </>
      )}
      <section className="flex items-center justify-center -mx-2 gap-1 pt-1.5">
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
    </LeftEditorWrapper>
  );
};
