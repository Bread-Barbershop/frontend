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

import { ImageEffect } from './components/ImageEffect';

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
  const handleContentsChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { isContents: e.target.checked });
  };
  const handleEffectChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { isEffect: e.target.checked });
  };
  const handleOnChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };
  const handleEditorChange = (json: JSONContent) => {
    debouncedUpdateMessage(json);
  };
  const handleEffectClick = (value: string) => {
    updateBlock(id, { selectedEffect: value });
  };
  return (
    <LeftEditorWrapper ariaLabel="사진">
      <NavigationBar>사진</NavigationBar>
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
              placeholder: '제목을 입력해주세요.',
              onChange: e => handleOnChangeTitle(e),
              value: blockInfo.props.title,
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
        {blockInfo.props.isEffect && (
          <ImageEffect onClick={handleEffectClick} />
        )}
        <div className="flex gap-2 py-[14px]">
          <Label className="font-semibold shrink-0">추가기능</Label>
          <Checkbox
            checked={blockInfo.props.isTitle}
            onChange={handleTitleChange}
          >
            제목 추가
          </Checkbox>
          <Checkbox
            checked={blockInfo.props.isContents}
            onChange={handleContentsChange}
          >
            내용 추가
          </Checkbox>
          <Checkbox
            checked={blockInfo.props.isEffect}
            onChange={handleEffectChange}
          >
            효과 추가
          </Checkbox>
        </div>
      </div>
    </LeftEditorWrapper>
  );
}

export default PictureBlock;
