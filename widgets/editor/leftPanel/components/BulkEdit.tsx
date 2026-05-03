'use client';

import { useState } from 'react';

import type { BulkColorPickerId } from '@/components/molecules/preview-text-editor/types';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';

import BackGroundEdit from './BackGroundEdit';
import BodyEdit from './BodyEdit';
import TitleEdit from './TitleEdit';
import ZoomEdit from './ZoomEdit';

function BulkEdit() {
  const [activeColorPickerId, setActiveColorPickerId] =
    useState<BulkColorPickerId | null>(null);

  return (
    <div className="w-full bg-white rounded-b-lg shadow-edit border border-t-0 border-black/5 transition-all duration-300 ease-in-out">
      <LeftEditorWrapper className="overflow-x-hidden">
        <TitleEdit
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={setActiveColorPickerId}
        />
        <BodyEdit
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={setActiveColorPickerId}
        />
        <BackGroundEdit
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={setActiveColorPickerId}
        />
        <ZoomEdit />
      </LeftEditorWrapper>
    </div>
  );
}

export default BulkEdit;
