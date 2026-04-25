'use client';

import React, { useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { Radio } from '@/components/atoms/radio';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import SimpleWheelColorPicker from '@/components/molecules/preview-text-editor/components/ColorPicker';
import SectionArrow from '@/shared/assets/icons/sectionArrow.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

function BackGroundEdit() {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorPickerContainerRef = useRef<HTMLDivElement>(null);

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
          setColorPickerOpen(!colorPickerOpen);
        }}
      >
        <div className="flex items-center gap-2">
          <Radio
            checked={colorPickerOpen}
            onChange={e => {
              e.stopPropagation();
              setColorPickerOpen(!colorPickerOpen);
            }}
          />
          <p className="font-semibold text-sm">색상</p>
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
          <div className="absolute z-50 -top-35 -translate-y-1/2 -left-2">
            <SimpleWheelColorPicker
              initialHex={backgroundColor}
              onClose={() => setColorPickerOpen(false)}
              containerRef={colorPickerContainerRef}
              onChange={setBackgroundColor}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default BackGroundEdit;
