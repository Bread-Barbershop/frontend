'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { clampSpacerHeight } from './spacerHeight';

const PRESETS = [
  { label: 'S', height: 24 },
  { label: 'M', height: 48 },
  { label: 'L', height: 96 },
] as const;

export function Spacer({ blockInfo, id }: { blockInfo: EditorBlock<'spacer'>; id: string }) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const height = clampSpacerHeight(blockInfo.props.height);
  const changeHeight = (value: number) => updateBlock(id, { height: clampSpacerHeight(value) });

  return (
    <LeftEditorWrapper ariaLabel="여백" className="gap-3">
      <NavigationBar>여백 편집</NavigationBar>
      <div className="w-full flex flex-col gap-3 py-2">
        <div className="flex items-center justify-between text-sm text-text-primary">
          <label htmlFor={`spacer-height-${id}`}>여백 높이</label>
          <span className="font-semibold">{height}px</span>
        </div>
        <input
          id={`spacer-height-${id}`}
          type="range"
          min={16}
          max={120}
          step={1}
          value={height}
          onChange={event => changeHeight(Number(event.currentTarget.value))}
          className="w-full cursor-pointer accent-primary"
        />
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map(preset => (
            <button
              key={preset.label}
              type="button"
              aria-label={`여백 ${preset.label} (${preset.height}px)`}
              aria-pressed={height === preset.height}
              onClick={() => changeHeight(preset.height)}
              className={cn(
                'rounded-md border border-border-divider py-2 text-sm text-text-primary transition-colors hover:bg-[#FAFAFB]',
                height === preset.height && 'border-primary text-primary bg-[#F5F8FF]'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-text-secondary">
          여백은 16~120px로 조절할 수 있으며, 초대장에서는 투명하게 표시됩니다.
        </p>
      </div>
    </LeftEditorWrapper>
  );
}
