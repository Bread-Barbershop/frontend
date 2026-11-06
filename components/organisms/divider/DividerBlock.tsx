'use client';

import { useState } from 'react';

import SmallColorPicker from '@/components/molecules/color-picker/SmallColorPicker';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { normalizeDividerSettings } from './dividerSettings';

import type { EditorBlock } from '@/shared/types/block';

export function DividerBlock({ blockInfo, id }: { blockInfo: EditorBlock<'divider'>; id: string }) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { height, thickness, color, topSpacing, bottomSpacing } =
    normalizeDividerSettings(blockInfo.props);

  const changeRange = (field: 'height' | 'topSpacing' | 'bottomSpacing', value: number) => {
    if (field === 'height') updateBlock(id, { height: Math.max(32, Math.min(96, value)) });
    if (field === 'topSpacing') updateBlock(id, { topSpacing: Math.max(0, Math.min(64, value)) });
    if (field === 'bottomSpacing') updateBlock(id, { bottomSpacing: Math.max(0, Math.min(64, value)) });
  };

  const controls = [
    { field: 'height', label: '선 높이', value: height, min: 32, max: 96 },
    { field: 'topSpacing', label: '위 여백', value: topSpacing, min: 0, max: 64 },
    { field: 'bottomSpacing', label: '아래 여백', value: bottomSpacing, min: 0, max: 64 },
  ] as const;

  return (
    <LeftEditorWrapper ariaLabel="세로 구분선" className="gap-3">
      <NavigationBar>세로 구분선 편집</NavigationBar>
      <div className="w-full flex flex-col gap-4 py-2">
        {controls.map(control => (
          <div key={control.field} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm text-text-primary">
              <label htmlFor={`divider-${control.field}-${id}`}>{control.label}</label>
              <span className="font-semibold">{control.value}px</span>
            </div>
            <input
              id={`divider-${control.field}-${id}`}
              type="range"
              min={control.min}
              max={control.max}
              step={1}
              value={control.value}
              onChange={event => changeRange(control.field, Number(event.currentTarget.value))}
              className="w-full cursor-pointer accent-primary"
            />
          </div>
        ))}
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-primary">선 굵기</span>
          <div className="flex gap-2">
            {[1, 2].map(value => (
              <button
                key={value}
                type="button"
                aria-label={`선 굵기 ${value}px`}
                aria-pressed={thickness === value}
                onClick={() => updateBlock(id, { thickness: value })}
                className={cn(
                  'rounded-md border border-border-divider px-3 py-1.5 text-sm transition-colors hover:bg-[#FAFAFB]',
                  thickness === value && 'border-primary bg-[#F5F8FF] text-primary'
                )}
              >
                {value}px
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-text-primary">
          <span>선 색상</span>
          <button
            type="button"
            aria-label="선 색상 선택"
            aria-expanded={pickerOpen}
            onClick={() => setPickerOpen(open => !open)}
            className="flex items-center gap-2 rounded-md border border-border-divider px-3 py-1.5"
          >
            <span aria-hidden="true" className="size-5 rounded border border-border-neutral" style={{ backgroundColor: color }} />
            <span>{color.toUpperCase()}</span>
          </button>
        </div>
        {pickerOpen && (
          <SmallColorPicker
            title="선 색상"
            value={color}
            onChange={({ hex }) => updateBlock(id, { color: hex })}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>
    </LeftEditorWrapper>
  );
}
