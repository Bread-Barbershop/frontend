'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

export function VisualEffectsBlock({ blockInfo, id }: { blockInfo: EditorBlock<'visualEffects'>; id: string }) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const { effect, showEnvelopeIntro } = blockInfo.props;
  return (
    <LeftEditorWrapper ariaLabel="배경 및 오프닝 효과" className="gap-3">
      <NavigationBar>배경 · 오프닝 효과</NavigationBar>
      <div className="flex flex-col gap-4 py-2 text-sm">
        <label className="flex flex-col gap-1">배경 효과
          <select className="h-10 rounded-md border border-border-divider px-3"
            value={effect} onChange={e => updateBlock(id, { effect: e.target.value })}>
            <option value="none">없음</option>
            <option value="petals">벚꽃 날림</option>
            <option value="snow">눈 내림</option>
            <option value="confetti">축하 컨페티</option>
            <option value="bokeh">빛망울</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showEnvelopeIntro}
            onChange={e => updateBlock(id, { showEnvelopeIntro: e.target.checked })} />
          첫 방문 시 편지 봉투 오프닝 표시
        </label>
        <p className="text-xs leading-relaxed text-text-secondary">
          화면 효과는 별도 이미지 파일 없이 CSS로 구현됩니다.
          실제 초대장에서는 전체 화면에 적용되며, 움직임 줄이기 설정을 존중합니다.
          효과 블록은 초대장에 하나만 사용하는 것을 권장합니다.
        </p>
      </div>
    </LeftEditorWrapper>
  );
}
