'use client';

import { useState } from 'react';

import { resolveScrollAnimation } from '@/components/molecules/scroll-fade-in/animationConfig';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

export function ScrollAnimationControls({ selectedId }: { selectedId: string }) {
  const [expanded, setExpanded] = useState(false);
  const selected = useEditorStore(state => state.block.find(block => block.id === selectedId));
  const updateBlock = useEditorStore(state => state.updateBlock);
  if (!selected) return null;
  const animation = resolveScrollAnimation(selected.props);
  return (
    <div className="rounded-lg border border-black/5 bg-white p-3 shadow-edit">
      <button type="button" className="flex w-full items-center justify-between text-sm font-semibold"
        aria-expanded={expanded} onClick={() => setExpanded(previous => !previous)}>
        스크롤 애니메이션
        <span aria-hidden="true">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs">효과
            <select className="h-9 rounded-md border border-border-divider px-2 text-sm"
              value={animation.animationType}
              onChange={e => updateBlock(selectedId, {
                animationType: e.target.value as typeof animation.animationType,
              })}>
              <option value="none">효과 없음</option>
              <option value="fade-up">아래에서 위로</option>
              <option value="fade-down">위에서 아래로</option>
              <option value="fade">페이드</option>
              <option value="zoom-in">확대</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">동작 방향
            <select className="h-9 rounded-md border border-border-divider px-2 text-sm"
              value={animation.triggerMode}
              onChange={e => updateBlock(selectedId, {
                triggerMode: e.target.value as typeof animation.triggerMode,
              })}>
              <option value="down-only">아래로 내릴 때 (1회)</option>
              <option value="both">상하 반복</option>
              <option value="up-only">위로 올릴 때</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
