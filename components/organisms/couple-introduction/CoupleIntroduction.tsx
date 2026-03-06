import { Fragment, type ChangeEvent, useEffect, useMemo } from 'react';

import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture';
import { TextEditor } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { debounce } from '@/shared/utils/debounce';

import type { JSONContent } from '@tiptap/core';

interface Props {
  blockInfo: EditorBlock<'coupleIntroduction'>;
  id: string;
}

function CoupleIntroduction({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const {
    groom = '',
    bride = '',
    groomImage = [],
    brideImage = [],
    title = '',
    messageJson = null,
    showProfileImage = false,
    showTitle = false,
    showContent = false,
    brideFirst = false,
  } = blockInfo.props;

  const debouncedUpdateMessage = useMemo(
    () =>
      debounce((nextMessageJson: JSONContent) => {
        updateBlock(id, {
          messageJson: nextMessageJson,
          messageHtml: tiptapJsonToHtmlInBrowser(nextMessageJson),
        });
      }, 300),
    [id, updateBlock]
  );

  useEffect(() => {
    return () => {
      debouncedUpdateMessage.cancel();
    };
  }, [debouncedUpdateMessage]);

  const handleGroomChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { groom: e.target.value });
  };

  const handleBrideChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { bride: e.target.value });
  };

  const handleGroomImageChange = (files: File[]) => {
    updateBlock(id, { groomImage: files.slice(0, 1) });
  };

  const handleBrideImageChange = (files: File[]) => {
    updateBlock(id, { brideImage: files.slice(0, 1) });
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };

  const handleEditorChange = (json: JSONContent) => {
    debouncedUpdateMessage(json);
  };

  const profileFields = brideFirst
    ? [
        {
          key: 'bride',
          label: '신부',
          value: bride,
          imageValue: brideImage,
          onChange: handleBrideChange,
          onImageChange: handleBrideImageChange,
        },
        {
          key: 'groom',
          label: '신랑',
          value: groom,
          imageValue: groomImage,
          onChange: handleGroomChange,
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
          onImageChange: handleGroomImageChange,
        },
        {
          key: 'bride',
          label: '신부',
          value: bride,
          imageValue: brideImage,
          onChange: handleBrideChange,
          onImageChange: handleBrideImageChange,
        },
      ];

  return (
    <section
      aria-label="신랑 신부 소개"
      className="flex flex-col gap-1 w-93.75 rounded-lg px-5 pb-2.5"
    >
      <NavigationBar>신랑・신부 소개</NavigationBar>

      {profileFields.map(profile => (
        <Fragment key={profile.key}>
          <TextField
            label={profile.label}
            inputProps={{
              placeholder: '성함',
              value: profile.value,
              onChange: profile.onChange,
            }}
            className="text-center py-1.5"
          />

          {showProfileImage && (
            <Picture
              key={`${profile.key}-${brideFirst ? 'first' : 'last'}`}
              label="사진"
              value={profile.imageValue}
              onChange={profile.onImageChange}
              className="text-center"
            />
          )}
        </Fragment>
      ))}

      {/* 제목 추가 체크박스가 true일때. */}
      {showTitle && (
        <TextField
          label="제목"
          inputProps={{
            placeholder: '제목을 입력해 주세요.',
            value: title,
            onChange: handleTitleChange,
          }}
          className="text-center py-1.5"
        />
      )}

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
              className="gap-1 pl-1 font-medium text-text-secondary"
              checked={showProfileImage}
              onChange={e =>
                updateBlock(id, { showProfileImage: e.target.checked })
              }
            >
              프로필 사진 추가
            </Checkbox>

            <Checkbox
              className="gap-1 pl-1 font-medium text-text-secondary"
              checked={showTitle}
              onChange={e => updateBlock(id, { showTitle: e.target.checked })}
            >
              제목 추가
            </Checkbox>
          </div>
          <div className="flex gap-2">
            <Checkbox
              className="gap-1 pl-1 font-medium text-text-secondary"
              checked={showContent}
              onChange={e => updateBlock(id, { showContent: e.target.checked })}
            >
              내용 추가
            </Checkbox>

            <Checkbox
              className="gap-1 pl-1 font-medium text-text-secondary"
              checked={brideFirst}
              onChange={e => updateBlock(id, { brideFirst: e.target.checked })}
            >
              신부측 먼저 표시하기
            </Checkbox>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CoupleIntroduction;
