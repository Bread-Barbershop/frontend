import { rgbaToHex, rgbaToHsva } from '@uiw/color-convert';
import { useId, useRef } from 'react';
import { useShallow } from 'zustand/shallow';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import BulkColorPicker from '@/components/molecules/preview-text-editor/components/ColorPicker';
import type { BulkColorPickerId } from '@/components/molecules/preview-text-editor/types';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';
import { parseInvitationBackgroundColor } from '@/shared/utils/invitationBackgroundColor';

const BACKGROUND_COLORS = [
  { label: '화이트', value: '#FFFFFF' },
  { label: '아이보리', value: '#F8F3EA' },
  { label: '로즈', value: '#F8DDE3' },
  { label: '세이지', value: '#DDE8D5' },
  { label: '라일락', value: '#E6DDF4' },
  { label: '베이지', value: '#EFE4D6' },
  { label: '피치', value: '#F9E1D2' },
  { label: '버터', value: '#FFF1B8' },
  { label: '블루', value: '#D7E3F4' },
  { label: '네이비', value: '#536780' },
  { label: '블랙', value: '#54565C' },
];

const swatchButtonClass =
  'flex min-h-12 min-w-0 cursor-pointer flex-col items-center justify-start gap-1.5 rounded-md text-center text-xs leading-tight text-text-primary focus-visible:outline-2 focus-visible:outline-primary';
const swatchClass = 'size-8 shrink-0 rounded-full border border-black/10';
const selectedSwatchClass = 'ring-2 ring-primary ring-offset-2';

interface BackGroundColorEditProps {
  activeColorPickerId: BulkColorPickerId | null;
  onActiveColorPickerChange: (id: BulkColorPickerId | null) => void;
}

function BackGroundColorEdit({
  activeColorPickerId,
  onActiveColorPickerChange,
}: BackGroundColorEditProps) {
  const { backgroundColor, selectBackgroundColor } = useEditorStore(
    useShallow(state => ({
      backgroundColor: state.backgroundColor,
      selectBackgroundColor: state.selectBackgroundColor,
    }))
  );
  const pickerId = useId();
  const customColorButton = useRef<HTMLButtonElement>(null);
  const colorPickerOpen = activeColorPickerId === 'background';
  const currentColor = parseInvitationBackgroundColor(backgroundColor);
  const currentHex =
    currentColor?.a === 1 ? rgbaToHex(currentColor).toUpperCase() : undefined;
  const isPreset = BACKGROUND_COLORS.some(({ value }) => value === currentHex);

  return (
    <div className="w-full">
      <NavigationBar>배경 편집</NavigationBar>
      <div className="grid w-full grid-cols-6 gap-x-1 gap-y-3">
        {BACKGROUND_COLORS.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            aria-pressed={value === currentHex}
            className={swatchButtonClass}
            onClick={() => {
              selectBackgroundColor(value);
              onActiveColorPickerChange(null);
            }}
          >
            <span
              aria-hidden="true"
              className={cn(
                swatchClass,
                value === currentHex && selectedSwatchClass
              )}
              style={{ backgroundColor: value }}
            />
            {label}
          </button>
        ))}
        <button
          ref={customColorButton}
          type="button"
          aria-haspopup="dialog"
          aria-current={isPreset ? undefined : 'true'}
          aria-expanded={colorPickerOpen}
          aria-controls={colorPickerOpen ? pickerId : undefined}
          className={swatchButtonClass}
          onClick={() =>
            onActiveColorPickerChange(colorPickerOpen ? null : 'background')
          }
        >
          <span
            aria-hidden="true"
            className={cn(
              swatchClass,
              (!isPreset || colorPickerOpen) && selectedSwatchClass
            )}
            style={{
              backgroundImage:
                'conic-gradient(#F77989, #F4B16E, #F8DB76, #98CE9A, #70BAE8, #A798E6, #F77989)',
            }}
          />
          직접 선택
        </button>
      </div>
      {colorPickerOpen && (
        <BulkColorPicker
          initialValue={rgbaToHsva(
            currentColor ?? { r: 255, g: 255, b: 255, a: 1 }
          )}
          containerRef={customColorButton}
          dialog={{ id: pickerId, label: '배경색 직접 선택' }}
          preserveAlpha
          onChange={selectBackgroundColor}
          onClose={() => {
            onActiveColorPickerChange(null);
            customColorButton.current?.focus();
          }}
        />
      )}
    </div>
  );
}
export default BackGroundColorEdit;
