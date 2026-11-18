'use client';

import { useState } from 'react';

import type { BulkColorPickerId } from '@/components/molecules/preview-text-editor/types';
import { SectionStyleSelect } from '@/components/molecules/section-style-select/SectionStyleSelect';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import BackGroundColorEdit from './BackGroundColorEdit';
import BackgroundTextureEdit from './BackgroundTextureEdit';
import BodyEdit from './BodyEdit';
import { InvitationEffectsControls } from './InvitationEffectsControls';
import TitleEdit from './TitleEdit';

function BulkEdit() {
  const sectionStyle = useEditorStore(state => state.sectionStyle);
  const setSectionStyle = useEditorStore(state => state.setSectionStyle);
  const [activeColorPickerId, setActiveColorPickerId] =
    useState<BulkColorPickerId | null>(null);

  return (
    <div className="w-full bg-white rounded-b-lg shadow-edit border border-t-0 border-black/5 transition-default">
      <LeftEditorWrapper
        ariaLabel="전체 스타일 편집"
        className="overflow-x-hidden max-h-158"
      >
        <TitleEdit
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={setActiveColorPickerId}
        />
        <BodyEdit
          activeColorPickerId={activeColorPickerId}
          onActiveColorPickerChange={setActiveColorPickerId}
        />
        <section
          className="w-full border-b border-border-divider pb-1"
          aria-label="배경 편집"
        >
          <BackGroundColorEdit
            activeColorPickerId={activeColorPickerId}
            onActiveColorPickerChange={setActiveColorPickerId}
          />
          <BackgroundTextureEdit />
        </section>
        <InvitationEffectsControls />
        <SectionStyleSelect
          label="기본 카드 스타일"
          sectionHeading
          value={sectionStyle}
          onChange={setSectionStyle}
        />
      </LeftEditorWrapper>
    </div>
  );
}

export default BulkEdit;
