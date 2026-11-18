'use client';

import { useState } from 'react';

import { EditorNoticeList } from '@/components/molecules/editor-notice';
import type { BulkColorPickerId } from '@/components/molecules/preview-text-editor/types';
import { SectionStyleSelect } from '@/components/molecules/section-style-select/SectionStyleSelect';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import BackGroundColorEdit from './BackGroundColorEdit';
import BodyEdit from './BodyEdit';
import TitleEdit from './TitleEdit';

function BulkEdit() {
  const sectionStyle = useEditorStore(state => state.sectionStyle);
  const setSectionStyle = useEditorStore(state => state.setSectionStyle);
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
        <SectionStyleSelect
          label="초대장 기본 카드 스타일"
          value={sectionStyle}
          onChange={setSectionStyle}
        />
        {/* <BackGroundEdit
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={setActiveColorPickerId}
        /> */}
        <EditorNoticeList
          notices={[
            {
              id: 'bulk-edit',
              text: '초대장의 글꼴과 배경, 기본 카드 스타일을 변경할 수 있습니다. 새 블록에도 기본 카드 스타일이 적용됩니다.',
              colorClass: 'text-[#1F72EF]',
            },
          ]}
        />
      </LeftEditorWrapper>
    </div>
  );
}

export default BulkEdit;
