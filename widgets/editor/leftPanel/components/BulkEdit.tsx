'use client';

import { useState } from 'react';

import { EditorNoticeList } from '@/components/molecules/editor-notice';
import type { BulkColorPickerId } from '@/components/molecules/preview-text-editor/types';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';

import BackGroundColorEdit from './BackGroundColorEdit';
import BodyEdit from './BodyEdit';
import TitleEdit from './TitleEdit';
import ZoomEdit from './ZoomEdit';

function BulkEdit() {
  const [activeColorPickerId, setActiveColorPickerId] =
    useState<BulkColorPickerId | null>(null);

  return (
    <div className="w-full bg-white rounded-b-lg shadow-edit border border-t-0 border-black/5 transition-default">
      <LeftEditorWrapper className="overflow-x-hidden">
        <TitleEdit
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={setActiveColorPickerId}
        />
        <BodyEdit
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={setActiveColorPickerId}
        />
        <BackGroundColorEdit />
        {/* <BackGroundEdit
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={setActiveColorPickerId}
        /> */}
        <ZoomEdit />
        <EditorNoticeList
          notices={[
            {
              id: 'bulk-edit',
              text: '초대장의 모든 폰트를 일괄 변경하거나 배경 색상을 변경하실 수 있습니다.',
              colorClass: 'text-[#1F72EF]',
            },
          ]}
        />
      </LeftEditorWrapper>
    </div>
  );
}

export default BulkEdit;
