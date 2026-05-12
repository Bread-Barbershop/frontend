'use client';
import { JSONContent } from '@tiptap/core';
import React, { ChangeEvent, useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

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

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

interface Props {
  blockInfo: EditorBlock<'picture'>;
  id: string;
}

function PictureBlock({ blockInfo, id }: Props) {
  const { updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
  const debouncedUpdateMessage = useMemo(
    () =>
      debounce((contentsJson: JSONContent) => {
        updateBlock(id, {
          contentsJson,
          contentsHtml: tiptapJsonToHtmlInBrowser(contentsJson),
        });
      }, 300),
    [id, updateBlock]
  );
  useEffect(() => {
    return () => {
      debouncedUpdateMessage.cancel();
    };
  }, [debouncedUpdateMessage]);
  const handlePictureChange = (file: (File | string)[]) => {
    updateBlock(id, { image: file });
    updateImage(id, file);
  };
  const handlePictureDelete = () => {
    updateBlock(id, { image: [] });
    updateImage(id, []);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { isTitle: e.target.checked });
  };
  const handleEngTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { isEnglishTitle: e.target.checked });
  };
  const handleContentsChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { isContents: e.target.checked });
  };

  const handleOnChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value || '사진' });
  };
  const handleOnChangeEngTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { enTitle: e.target.value || 'PICTURE' });
  };
  const handleEditorChange = (json: JSONContent) => {
    debouncedUpdateMessage(json);
  };

  return (
    <LeftEditorWrapper ariaLabel="사진">
      <NavigationBar>사진 편집 페이지</NavigationBar>
      <div className="w-full flex flex-col gap-1">
        <Picture
          label="사진"
          value={blockInfo.props.image}
          onChange={handlePictureChange}
          onDelete={handlePictureDelete}
          className="text-center py-1"
        />
        {blockInfo.props.isTitle && (
          <TextField
            label="제목"
            className="py-1.5 text-center"
            inputProps={{
              placeholder: '사진',
              onChange: e => handleOnChangeTitle(e),
              value:
                blockInfo.props.title === '사진' ? '' : blockInfo.props.title,
              maxLength: 20,
            }}
          />
        )}
        {blockInfo.props.isEnglishTitle && (
          <TextField
            label="영문 제목"
            className="py-1.5 text-center"
            inputProps={{
              placeholder: 'PICTURE',
              onChange: e => handleOnChangeEngTitle(e),
              value:
                blockInfo.props.enTitle === 'PICTURE'
                  ? ''
                  : blockInfo.props.enTitle,
            }}
          />
        )}
        {blockInfo.props.isContents && (
          <div className="flex flex-col">
            <NavigationBar>내용</NavigationBar>
            <TextEditor
              value={blockInfo.props.contentsJson}
              defaultText="내용을 입력해 주세요"
              defaultAlign="center"
              onChange={handleEditorChange}
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Label className="font-semibold shrink-0 text-center">추가기능</Label>
          <div className="flex flex-wrap gap-2">
            <Checkbox
              checked={blockInfo.props.isTitle}
              onChange={handleTitleChange}
            >
              제목 추가
            </Checkbox>
            <Checkbox
              checked={blockInfo.props.isEnglishTitle}
              onChange={handleEngTitleChange}
            >
              영문 제목 추가
            </Checkbox>
            <Checkbox
              checked={blockInfo.props.isContents}
              onChange={handleContentsChange}
            >
              내용 추가
            </Checkbox>
          </div>
        </div>
      </div>
    </LeftEditorWrapper>
  );
}

export default PictureBlock;
