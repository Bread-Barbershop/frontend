'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

import SmallColorPicker from '@/components/molecules/color-picker/SmallColorPicker';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { normalizeDressCodeColors, normalizeDressCodeGuidelines } from './dressCodeUtils';

const GUIDELINE_PRESETS = [
  '화환은 정중히 사양합니다.',
  '키즈존 및 수유실 이용 안내',
  '촬영 시 다른 참석자분들을 배려해 주세요.',
];

export function DressCodeBlock({
  blockInfo,
  id,
}: {
  blockInfo: EditorBlock<'dressCode'>;
  id: string;
}) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const [editingColor, setEditingColor] = useState<number | null>(null);
  const { title } = blockInfo.props;
  const colors = normalizeDressCodeColors(blockInfo.props.colors);
  const guidelines = normalizeDressCodeGuidelines(blockInfo.props.guidelines);

  const changeColor = (index: number, color: string) => {
    const next = [...colors];
    next[index] = color;
    updateBlock(id, { colors: next });
  };
  const changeGuideline = (index: number, value: string) => {
    const next = [...guidelines];
    next[index] = value.slice(0, 140);
    updateBlock(id, { guidelines: next });
  };

  return (
    <LeftEditorWrapper ariaLabel="드레스코드 및 매너" className="gap-3">
      <NavigationBar>드레스코드 & 매너 편집</NavigationBar>
      <div className="flex w-full flex-col gap-4 py-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`dress-title-${id}`} className="text-sm text-text-primary">제목</label>
          <input
            id={`dress-title-${id}`}
            value={title ?? ''}
            maxLength={40}
            onChange={event => updateBlock(id, { title: event.target.value })}
            className="h-9 rounded-md border border-border-divider px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-text-primary">추천 컬러</p>
          <div className="flex flex-wrap items-center gap-2">
            {colors.map((color, index) => (
              <div key={index} className="relative">
                <button
                  type="button"
                  aria-label={`컬러 ${index + 1} 수정`}
                  aria-pressed={editingColor === index}
                  onClick={() => setEditingColor(editingColor === index ? null : index)}
                  className="size-9 rounded-full border border-border-divider"
                  style={{ backgroundColor: color }}
                />
                <button
                  type="button"
                  aria-label={`컬러 ${index + 1} 삭제`}
                  onClick={() => {
                    updateBlock(id, { colors: colors.filter((_, i) => i !== index) });
                    setEditingColor(null);
                  }}
                  className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-neutral-600 text-white"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            {colors.length < 8 && (
              <button
                type="button"
                onClick={() => updateBlock(id, { colors: [...colors, '#E2E8F0'] })}
                className="h-9 rounded-md border border-border-divider px-3 text-xs text-text-primary hover:bg-[#FAFAFB]"
              >
                + 색상
              </button>
            )}
          </div>
          {editingColor !== null && colors[editingColor] && (
            <SmallColorPicker
              title="추천 컬러 수정"
              value={colors[editingColor]}
              onChange={({ hex }) => changeColor(editingColor, hex)}
              onClose={() => setEditingColor(null)}
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-text-primary">매너 및 안내</p>
          {guidelines.map((guideline, index) => (
            <div key={index} className="flex items-start gap-2">
              <textarea
                aria-label={`안내 ${index + 1}`}
                value={guideline}
                maxLength={140}
                rows={2}
                onChange={event => changeGuideline(index, event.target.value)}
                className="min-w-0 flex-1 resize-y rounded-md border border-border-divider p-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                aria-label={`안내 ${index + 1} 삭제`}
                onClick={() => updateBlock(id, { guidelines: guidelines.filter((_, i) => i !== index) })}
                className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border-divider text-text-secondary"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {guidelines.length < 8 && (
            <>
              <button
                type="button"
                onClick={() => updateBlock(id, { guidelines: [...guidelines, ''] })}
                className="h-9 rounded-md border border-border-divider text-sm text-text-primary hover:bg-[#FAFAFB]"
              >
                + 안내 문구 추가
              </button>
              <div className="flex flex-wrap gap-1.5">
                {GUIDELINE_PRESETS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => updateBlock(id, { guidelines: [...guidelines, preset] })}
                    className="rounded-md bg-[#F5F8FF] px-2 py-1.5 text-xs text-text-secondary hover:text-primary"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </LeftEditorWrapper>
  );
}
