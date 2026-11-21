'use client';

import { useState } from 'react';

import {
  getBlockEntrance,
  PAIRED_ENTRANCE,
  SCROLL_ANIMATION_OPTIONS,
  supportsPairedEntrance,
} from '@/components/molecules/scroll-fade-in/animationConfig';
import { SectionStyleSelect } from '@/components/molecules/section-style-select/SectionStyleSelect';
import { FormSelector } from '@/components/molecules/selector/FormSelector';
import { isBlockEnabled } from '@/shared/data/registry/blockAvailability';
import {
  resolveSectionStyle,
  supportsSectionStyle,
} from '@/shared/data/sectionStyles';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { StylePanelSection } from './StylePanelSection';

export function SectionStyleControls({ selectedId }: { selectedId: string }) {
  const [expanded, setExpanded] = useState(false);
  const block = useEditorStore(state =>
    state.block.find(item => item.id === selectedId)
  );
  const updateAppearance = useEditorStore(state => state.updateBlockAppearance);
  const commonEffect = useEditorStore(
    state => state.scrollAnimation.animationType
  );
  if (
    !block ||
    !isBlockEnabled(block.component) ||
    !supportsSectionStyle(block.component)
  )
    return null;

  return (
    <StylePanelSection
      title="카드 디자인 · 등장 효과"
      expanded={expanded}
      onToggle={() => setExpanded(open => !open)}
    >
      <div className="grid gap-3 rounded-b-lg border border-t-0 border-black/5 bg-white p-3 shadow-edit">
        <SectionStyleSelect
          label="이 블록의 카드 스타일"
          value={resolveSectionStyle(block.props.sectionStyle)}
          inheritLabel="초대장 스타일 따르기"
          onChange={sectionStyle => updateAppearance(selectedId, { sectionStyle })}
        />
        <FormSelector
          label="이 블록의 등장 효과"
          className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary"
          options={[
            {
              value: 'inherit' as const,
              label: `전체 설정 따르기 (${SCROLL_ANIMATION_OPTIONS.find(option => option.value === commonEffect)?.label})`,
            },
            ...SCROLL_ANIMATION_OPTIONS,
            ...(supportsPairedEntrance(block.component)
              ? [PAIRED_ENTRANCE]
              : []),
          ]}
          value={getBlockEntrance(block.component, block.props) ?? 'inherit'}
          onChange={value =>
            updateAppearance(selectedId, {
              entranceEffect: value === 'inherit' ? undefined : value,
            })
          }
        />
      </div>
    </StylePanelSection>
  );
}
