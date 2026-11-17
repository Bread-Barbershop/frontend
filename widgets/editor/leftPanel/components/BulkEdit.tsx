'use client';

import { useState } from 'react';

import { EditorNoticeList } from '@/components/molecules/editor-notice';
import type { BulkColorPickerId } from '@/components/molecules/preview-text-editor/types';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';

import BackGroundColorEdit from './BackGroundColorEdit';
import BodyEdit from './BodyEdit';
import { ScrollAnimationControls } from './ScrollAnimationControls';
import TitleEdit from './TitleEdit';

function BulkEdit() {
  const [activeColorPickerId, setActiveColorPickerId] =
    useState<BulkColorPickerId | null>(null);

  return (
    <div className="w-full bg-white rounded-b-lg shadow-edit border border-t-0 border-black/5 transition-default">
      <LeftEditorWrapper className="overflow-x-hidden max-h-158">
        <TitleEdit
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={setActiveColorPickerId}
        />
        <BodyEdit
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={setActiveColorPickerId}
        />
        <BackGroundColorEdit />
        <ScrollAnimationControls />
        {/* <BackGroundEdit
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={setActiveColorPickerId}
        /> */}
        <EditorNoticeList
          notices={[
            {
              id: 'bulk-edit',
              text: '초대장의 폰트와 배경, 스크롤 애니메이션을 함께 설정할 수 있습니다.',
              colorClass: 'text-[#1F72EF]',
            },
          ]}
        />
      </LeftEditorWrapper>
    </div>
  );
}

export default BulkEdit;
