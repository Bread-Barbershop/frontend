'use client';

import { useShallow } from 'zustand/shallow';

import { Radio } from '@/components/atoms/radio';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import BulkColorPicker from '@/components/molecules/preview-text-editor/components/ColorPicker';
import type { BulkColorPickerId } from '@/components/molecules/preview-text-editor/types';
import SectionArrow from '@/shared/assets/icons/sectionArrow.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

type BackGroundEditProps = {
  activeColorPickerId: BulkColorPickerId | null;
  onActiveColorPickerChange: (id: BulkColorPickerId | null) => void;
};

function BackGroundEdit({
  activeColorPickerId,
  onActiveColorPickerChange,
}: BackGroundEditProps) {
  const colorPickerOpen = activeColorPickerId === 'background';

  const { backgroundColor, setBackgroundColor } = useEditorStore(
    useShallow(state => ({
      backgroundColor: state.backgroundColor,
      setBackgroundColor: state.setBackgroundColor,
    }))
  );
  return (
    <div className="w-full">
      <NavigationBar>배경 편집</NavigationBar>
      <div
        className={`w-fit px-[14px] py-1 flex gap-2 relative ${colorPickerOpen ? 'border border-primary rounded-sm' : ''}`}
        onClick={() => {
          onActiveColorPickerChange(colorPickerOpen ? null : 'background');
        }}
      >
        <div className="flex items-center gap-2">
          <div onClick={e => e.stopPropagation()}>
            <Radio
              type="checkbox"
              name="backgroundColor"
              checked={colorPickerOpen}
              onChange={() =>
                onActiveColorPickerChange(colorPickerOpen ? null : 'background')
              }
            />
          </div>
          <p className="font-semibold text-sm select-none">색상</p>
          <div className="flex items-center gap-2">
            <div
              className="w-11 h-11 border border-[#E5E5E8]"
              style={{ backgroundColor: backgroundColor }}
            />
            <div
              className={`${colorPickerOpen ? 'rotate-180' : ''} transition-all duration-300 ease-in-out`}
            >
              <SectionArrow className="w-[6px] h-[3px]" />
            </div>
          </div>
        </div>
        {colorPickerOpen && (
          <BulkColorPicker
            initialHex={backgroundColor}
            onClose={() => onActiveColorPickerChange(null)}
            onChange={setBackgroundColor}
          />
        )}
      </div>
    </div>
  );
}

export default BackGroundEdit;
