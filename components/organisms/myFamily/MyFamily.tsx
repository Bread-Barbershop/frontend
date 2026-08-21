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
import { useToast } from '@/shared/hooks/useToast';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { compressImages } from '@/shared/utils/imageCompression';
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
  const { warning } = useToast();

  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  // 가족 구성원 index별로 독립적으로 로딩 상태를 추적한다.
  // 단일 loadingIndex 값으로 관리하면 여러 구성원의 이미지를 연달아
  // 업로드할 때 나중 업로드가 이전 업로드의 로딩 상태를 덮어써서
  // 이미지가 실제로 들어오기 전에 스피너가 먼저 사라지는 문제가 생긴다.
  const [loadingIndices, setLoadingIndices] = useState<Set<number>>(
    new Set()
  );
  const setIndexLoading = (index: number, loading: boolean) => {
    setLoadingIndices(prev => {
      const next = new Set(prev);
      if (loading) {
        next.add(index);
      } else {
        next.delete(index);
      }
      return next;
    });
  };

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

  const handleImageChange = async (
    index: number,
    value: (File | string)[]
  ) => {
    setIndexLoading(index, true);
    try {
      const files = value.filter((f): f is File => f instanceof File);
      const compressedFiles = await compressImages(files);
      const compressed = value.map(
        f => compressedFiles[files.indexOf(f as File)] ?? f
      );

      // await 이후에는 렌더 시점 클로저(family)가 stale할 수 있으므로
      // 최신 store 상태를 다시 읽어서 병합한다. 그렇지 않으면 두 구성원의
      // 이미지가 동시에 처리될 때 나중에 끝난 쪽이 먼저 끝난 쪽의 결과를
      // 낡은 배열로 덮어써 이미지가 사라진다.
      const latestBlock = useEditorStore.getState()
        .block as EditorBlock<'myFamily'>[];
      const latestFamily =
        latestBlock.find(b => b.id === id)?.props.family ?? [];
      const selectId = latestFamily[index]?.id ?? '';
      const newFamily = latestFamily.map((member, i) =>
        i === index ? { ...member, image: compressed } : member
      );

      updateBlock(id, {
        family: newFamily,
      });
      updateImage(selectId, compressed);
    } catch (error) {
      console.error('[MyFamily] 이미지 압축 실패:', error);
      warning('이미지 처리 중 문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setIndexLoading(index, false);
    }
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
              loadingCount={loadingIndices.has(index) ? 1 : 0}
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
