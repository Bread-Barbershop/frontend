'use client';
import { JSONContent } from '@tiptap/core';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture';
import { TextEditor } from '@/components/molecules/text-editor';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useToast } from '@/shared/hooks/useToast';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { compressImages } from '@/shared/utils/imageCompression';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

const DEFAULT_SUB_TITLE = 'PICTURE';
const RATIO_OPTIONS = [
  ['1/1', '1:1'],
  ['4/3', '4:3'],
  ['16/9', '16:9'],
] as const;
const FILTER_OPTIONS = [
  ['none', '원본'],
  ['grayscale', '흑백'],
  ['sepia', '빈티지'],
  ['contrast', '선명하게'],
  ['vignette', '비네팅'],
] as const;

interface Props {
  blockInfo: EditorBlock<'picture'>;
  id: string;
}

function PictureBlock({ blockInfo, id }: Props) {
  const subTitle = blockInfo.props.subTitle || DEFAULT_SUB_TITLE;
  const { updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
  const { warning } = useToast();
  const [loadingCount, setLoadingCount] = useState(0);

  useEffect(() => {
    if (!blockInfo.props.subTitle) {
      updateBlock(id, { subTitle: DEFAULT_SUB_TITLE });
    }
  }, [blockInfo.props.subTitle, id, updateBlock]);

  const handlePictureChange = async (file: (File | string)[]) => {
    const files = file.filter((f): f is File => f instanceof File);
    setLoadingCount(files.length);
    try {
      const compressedFiles = await compressImages(files);
      const compressed = file.map(
        f => compressedFiles[files.indexOf(f as File)] ?? f
      );
      updateBlock(id, { image: compressed });
      updateImage(id, compressed);
    } catch (error) {
      console.error('[PictureBlock] 이미지 압축 실패:', error);
      warning('이미지 처리 중 문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoadingCount(0);
    }
  };
  const handlePictureDelete = () => {
    updateBlock(id, { image: [] });
    updateImage(id, []);
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    updateBlock(
      id,
      checked ? { isTitle: true } : { isTitle: false, isSubTitle: false }
    );
  };
  const handleSubTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { isSubTitle: e.target.checked });
  };
  const handleContentsChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { isContents: e.target.checked });
  };

  const handleOnChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };
  const handleOnChangeSubTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, {
      subTitle: sanitizeEnglishTitleInput(e.target),
    });
  };
  const handleEditorChange = (json: JSONContent) => {
    updateBlock(id, {
      contentsJson: json,
      contentsHtml: tiptapJsonToHtmlInBrowser(json),
    });
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
          loadingCount={loadingCount}
        />
        {(blockInfo.props.image?.length ?? 0) > 0 && (
          <section className="mt-2 flex w-full flex-col gap-3 rounded-lg border border-border-divider p-3 text-sm">
            <h3 className="font-semibold">사진 보정 · 자르기</h3>
            <div className="flex flex-wrap gap-2">
              {RATIO_OPTIONS.map(([ratio, label]) => (
                <button type="button" key={ratio}
                  aria-pressed={(blockInfo.props.imageRatio ?? '1/1') === ratio}
                  className="rounded-md border border-border-divider px-3 py-2 aria-pressed:bg-[#EDF4FF]"
                  onClick={() => updateBlock(id, { imageRatio: ratio })}>{label}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-md border border-border-divider px-3 py-2"
                onClick={() => updateBlock(id, { imageRotation: ((blockInfo.props.imageRotation ?? 0) - 90) % 360 })}>
                왼쪽 90°
              </button>
              <button type="button" className="rounded-md border border-border-divider px-3 py-2"
                onClick={() => updateBlock(id, { imageRotation: ((blockInfo.props.imageRotation ?? 0) + 90) % 360 })}>
                오른쪽 90°
              </button>
            </div>
            {([
              ['imageRotation', '회전', -180, 180, 1],
              ['imageScale', '확대 / 축소', 1, 3, 0.05],
              ['imageOffsetX', '가로 위치', 0, 100, 1],
              ['imageOffsetY', '세로 위치', 0, 100, 1],
              ['imageBrightness', '밝기', 50, 150, 1],
            ] as const).map(([key, label, min, max, step]) => (
              <label key={key} className="flex flex-col gap-1">
                {label} ({blockInfo.props[key] ?? (key === 'imageScale' ? 1 : key === 'imageBrightness' ? 100 : key.startsWith('imageOffset') ? 50 : 0)})
                <input type="range" min={min} max={max} step={step}
                  value={blockInfo.props[key] ?? (key === 'imageScale' ? 1 : key === 'imageBrightness' ? 100 : key.startsWith('imageOffset') ? 50 : 0)}
                  onChange={e => updateBlock(id, { [key]: Number(e.target.value) })} />
              </label>
            ))}
            <label className="flex flex-col gap-1">필터
              <select className="h-10 rounded-md border border-border-divider px-3"
                value={blockInfo.props.imageFilter ?? 'none'}
                onChange={e => updateBlock(id, { imageFilter: e.target.value })}>
                {FILTER_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <button type="button" className="self-end text-xs text-primary"
              onClick={() => updateBlock(id, {
                imageRotation: 0, imageScale: 1, imageRatio: '1/1',
                imageOffsetX: 50, imageOffsetY: 50,
                imageFilter: 'none', imageBrightness: 100,
              })}>보정 초기화</button>
          </section>
        )}
        {blockInfo.props.isTitle && (
          <TextField
            label="제목"
            className="py-1.5 text-center"
            inputProps={{
              placeholder: '사진',
              onChange: e => handleOnChangeTitle(e),
              value:
                blockInfo.props.title ?? '',
              maxLength: 20,
            }}
          />
        )}
        {blockInfo.props.isTitle && blockInfo.props.isSubTitle && (
          <TextField
            label="영문 제목"
            className="py-1.5 text-center"
            inputProps={{
              placeholder: 'PICTURE',
              onChange: e => handleOnChangeSubTitle(e),
              value: subTitle ?? '',
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
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap gap-3">
              <Checkbox
                checked={blockInfo.props.isTitle}
                onChange={handleTitleChange}
              >
                <span className="text-[13px]">제목 추가</span>
              </Checkbox>
              <Checkbox
                checked={blockInfo.props.isTitle && blockInfo.props.isSubTitle}
                onChange={handleSubTitleChange}
                disabled={!blockInfo.props.isTitle}
                dimDisabled={false}
              >
                <span className="text-[13px]">영문 제목 추가</span>
              </Checkbox>
            </div>
            <Checkbox
              checked={blockInfo.props.isContents}
              onChange={handleContentsChange}
            >
              <span className="text-[13px]">내용 추가</span>
            </Checkbox>
          </div>
        </div>
      </div>
    </LeftEditorWrapper>
  );
}

export default PictureBlock;
