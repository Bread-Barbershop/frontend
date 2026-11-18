'use client';

import { SectionStyleSelect } from '@/components/molecules/section-style-select/SectionStyleSelect';
import { isBlockEnabled } from '@/shared/data/registry/blockAvailability';
import {
  resolveSectionStyle,
  supportsSectionStyle,
} from '@/shared/data/sectionStyles';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

export function SectionStyleControls({ selectedId }: { selectedId: string }) {
  const block = useEditorStore(state =>
    state.block.find(item => item.id === selectedId)
  );
  const updateStyle = useEditorStore(state => state.updateBlockSectionStyle);
  if (
    !block ||
    !isBlockEnabled(block.component) ||
    !supportsSectionStyle(block.component)
  )
    return null;

  return (
    <details className="rounded-lg border border-black/5 bg-white p-3 shadow-edit">
      <summary className="cursor-pointer text-sm font-semibold">
        카드 디자인
      </summary>
      <div className="mt-3">
        <SectionStyleSelect
          label="이 블록의 카드 스타일"
          value={resolveSectionStyle(block.props.sectionStyle)}
          inheritLabel="초대장 스타일 따르기"
          onChange={style => updateStyle(selectedId, style)}
        />
      </div>
    </details>
  );
}
