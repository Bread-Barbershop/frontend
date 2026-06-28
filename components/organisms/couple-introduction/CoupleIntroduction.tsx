import { Fragment, type ChangeEvent, useEffect } from 'react';

import { Divider } from '@/components/atoms/divider';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture';
import { TextEditor } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

import type { JSONContent } from '@tiptap/core';

interface Props {
  blockInfo: EditorBlock<'coupleIntroduction'>;
  id: string;
}

const DEFAULT_COUPLE_INTRODUCTION_TITLE = '신랑・신부 소개';
const DEFAULT_COUPLE_INTRODUCTION_SUB_TITLE = 'INTRODUCTION';

function CoupleIntroduction({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const updateImage = useEditorStore(state => state.updateImage);
  const {
    groom = '',
    bride = '',
    groomImage = { id: crypto.randomUUID(), image: [] },
    brideImage = { id: crypto.randomUUID(), image: [] },
    title = DEFAULT_COUPLE_INTRODUCTION_TITLE,
    checkedSubTitle = true,
    subTitle = DEFAULT_COUPLE_INTRODUCTION_SUB_TITLE,
    messageJson = null,
    showContent = false,
    brideFirst = false,
  } = blockInfo.props;

  useEffect(() => {
    if (title === '') {
      updateBlock(id, { title: DEFAULT_COUPLE_INTRODUCTION_TITLE });
    }
  }, [id, title, updateBlock]);

  useEffect(() => {
    if (subTitle === '') {
      updateBlock(id, {
        subTitle: DEFAULT_COUPLE_INTRODUCTION_SUB_TITLE,
      });
    }
  }, [subTitle, id, updateBlock]);

  const syncProfileImages = (
    nextGroomImage: { id: string; image: (File | string)[] },
    nextBrideImage: { id: string; image: (File | string)[] }
  ) => {
    updateBlock(id, {
      groomImage: nextGroomImage,
      brideImage: nextBrideImage,
    });
    if (nextGroomImage.id !== '')
      updateImage(nextGroomImage.id, nextGroomImage.image);
    if (nextBrideImage.id !== '')
      updateImage(nextBrideImage.id, nextBrideImage.image);
  };

  const handleGroomChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { groom: e.target.value });
  };

  const handleBrideChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { bride: e.target.value });
  };

  const handleGroomImageChange = (files: (File | string)[]) => {
    syncProfileImages(
      { id: crypto.randomUUID(), image: files.slice(0, 1) },
      brideImage
    );
  };

  const handleBrideImageChange = (files: (File | string)[]) => {
    syncProfileImages(groomImage, {
      id: crypto.randomUUID(),
      image: files.slice(0, 1),
    });
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextTitle = e.target.value;
    updateBlock(id, {
      title: nextTitle || DEFAULT_COUPLE_INTRODUCTION_TITLE,
    });
  };

  const handleSubTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextSubTitle = sanitizeEnglishTitleInput(e.target);
    updateBlock(id, {
      subTitle:
        nextSubTitle || DEFAULT_COUPLE_INTRODUCTION_SUB_TITLE,
    });
  };

  const handleEditorChange = (json: JSONContent) => {
    updateBlock(id, {
      messageJson: json,
      messageHtml: tiptapJsonToHtmlInBrowser(json),
    });
  };
  const handleGroomDelete = () => {
    syncProfileImages({ id: groomImage.id, image: [] }, brideImage);
  };
  const handleBrideDelete = () => {
    syncProfileImages(groomImage, { id: brideImage.id, image: [] });
  };
  const profileFields = brideFirst
    ? [
        {
          key: 'bride',
          label: '신부',
          value: bride,
          imageValue: brideImage,
          onChange: handleBrideChange,
          onDelete: handleBrideDelete,
          onImageChange: handleBrideImageChange,
        },
        {
          key: 'groom',
          label: '신랑',
          value: groom,
          imageValue: groomImage,
          onChange: handleGroomChange,
          onDelete: handleGroomDelete,
          onImageChange: handleGroomImageChange,
        },
      ]
    : [
        {
          key: 'groom',
          label: '신랑',
          value: groom,
          imageValue: groomImage,
          onChange: handleGroomChange,
          onDelete: handleGroomDelete,
          onImageChange: handleGroomImageChange,
        },
        {
          key: 'bride',
          label: '신부',
          value: bride,
          imageValue: brideImage,
          onChange: handleBrideChange,
          onDelete: handleBrideDelete,
          onImageChange: handleBrideImageChange,
        },
      ];

  return (
    <LeftEditorWrapper className="items-start" ariaLabel="신랑 신부 소개">
      <NavigationBar>신랑・신부 소개 편집 페이지</NavigationBar>

      <TextField
        key={`title-${id}`}
        label="제목"
        inputProps={{
          placeholder: DEFAULT_COUPLE_INTRODUCTION_TITLE,
          defaultValue:
            title === DEFAULT_COUPLE_INTRODUCTION_TITLE ? '' : title,
          onChange: handleTitleChange,
        }}
        className="w-full text-center py-1.5"
      />

      {checkedSubTitle && (
        <TextField
          key={`english-title-${id}`}
          label="영문제목"
          inputProps={{
            placeholder: DEFAULT_COUPLE_INTRODUCTION_SUB_TITLE,
            defaultValue:
              subTitle === DEFAULT_COUPLE_INTRODUCTION_SUB_TITLE
                ? ''
                : subTitle,
            onChange: handleSubTitleChange,
          }}
          className="w-full text-center py-1.5"
        />
      )}

      <Divider className="w-full" />

      {profileFields.map(profile => (
        <Fragment key={profile.key}>
          <div className="flex flex-col gap-1 w-full pb-1">
            <TextField
              label={profile.label}
              inputProps={{
                placeholder: '성함',
                value: profile.value,
                onChange: profile.onChange,
              }}
              className="w-full text-center py-1.5"
            />

            <Picture
              key={`${profile.key}-${brideFirst ? 'first' : 'last'}`}
              label="사진"
              value={profile.imageValue.image}
              onChange={profile.onImageChange}
              onDelete={profile.onDelete}
              className="text-center"
            />
          </div>
        </Fragment>
      ))}

      {/* 내용 추가 체크박스가 true일때. */}
      {showContent && (
        <>
          <NavigationBar>내용</NavigationBar>
          <TextEditor
            key={id}
            value={messageJson}
            defaultText="내용을 입력해 주세요"
            defaultAlign="center"
            onChange={handleEditorChange}
          />
        </>
      )}

      <div className="flex items-center gap-2">
        <Label className="font-semibold">추가기능</Label>

        <div className="flex flex-col gap-0.5">
          <div className="flex gap-2">
            <Checkbox
              className="gap-1 pl-1 text-text-secondary"
              checked={checkedSubTitle}
              onChange={e =>
                updateBlock(id, { checkedSubTitle: e.target.checked })
              }
            >
              <span className="text-[13px]">영문 제목 추가</span>
            </Checkbox>

            <Checkbox
              className="gap-1 pl-1 text-text-secondary"
              checked={showContent}
              onChange={e => updateBlock(id, { showContent: e.target.checked })}
            >
              <span className="text-[13px]">내용 추가</span>
            </Checkbox>
          </div>
          <div className="flex gap-2">
            <Checkbox
              className="gap-1 pl-1 text-text-secondary"
              checked={brideFirst}
              onChange={e => updateBlock(id, { brideFirst: e.target.checked })}
            >
              <span className="text-[13px]">신부측 먼저 표시하기</span>
            </Checkbox>
          </div>
        </div>
      </div>
    </LeftEditorWrapper>
  );
}

export default CoupleIntroduction;
