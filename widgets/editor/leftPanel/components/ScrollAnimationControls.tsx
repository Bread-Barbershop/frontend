'use client';

import { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { resolveScrollAnimation } from '@/components/molecules/scroll-fade-in/animationConfig';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import {
  MOTION_EASING_OPTIONS,
  resolveMotionEasing,
} from '@/shared/utils/motionSettings';

export function ScrollAnimationControls({ embedded = false } = {}) {
  const [expanded, setExpanded] = useState(false);
  const { scrollAnimation, updateScrollAnimation } = useEditorStore(
    useShallow(state => ({
      scrollAnimation: state.scrollAnimation,
      updateScrollAnimation: state.updateScrollAnimation,
    }))
  );
  const animation = resolveScrollAnimation(scrollAnimation);
  const toggle = (
    <button
      type="button"
      className="flex w-full items-center justify-between text-sm font-semibold"
      aria-expanded={expanded}
      onClick={() => setExpanded(previous => !previous)}
    >
      {embedded ? '스크롤 세부 설정' : '스크롤 애니메이션'}
      <span aria-hidden="true">{expanded ? '−' : '+'}</span>
    </button>
  );
  return (
    <div
      className={
        embedded
          ? 'w-full'
          : 'w-full rounded-lg border border-black/5 bg-white p-3 shadow-edit'
      }
    >
      {!embedded && toggle}
      {(expanded || embedded) && (
        <div
          className={
            embedded ? 'flex flex-col gap-2' : 'mt-3 flex flex-col gap-3'
          }
        >
          <label className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary">
            {embedded ? '스크롤 애니메이션' : '효과'}
            <select
              className="h-9 rounded-md border border-border-divider px-2 text-sm"
              value={animation.animationType}
              onChange={e =>
                updateScrollAnimation({
                  animationType: e.target
                    .value as typeof animation.animationType,
                })
              }
            >
              <option value="none">효과 없음</option>
              <option value="fade-up">아래에서 위로</option>
              <option value="fade-down">위에서 아래로</option>
              <option value="fade">페이드</option>
              <option value="zoom-in">확대</option>
            </select>
          </label>
          {embedded && toggle}
          {expanded && animation.animationType !== 'none' && (
            <>
              <label className="flex flex-col gap-2 text-xs">
                <span className="flex justify-between">
                  등장 시간{' '}
                  <output>
                    {(animation.animationDurationMs / 1000).toFixed(1)}초
                  </output>
                </span>
                <input
                  type="range"
                  min={200}
                  max={2000}
                  step={100}
                  value={animation.animationDurationMs}
                  aria-label="등장 시간"
                  onChange={event =>
                    updateScrollAnimation({
                      animationDurationMs: Number(event.target.value),
                    })
                  }
                />
                <span className="flex justify-between text-text-tertiary">
                  <span>빠르게</span>
                  <span>느리게</span>
                </span>
              </label>
              <label className="flex flex-col gap-1 text-xs">
                부드러움
                <select
                  className="h-9 rounded-md border border-border-divider px-2 text-sm"
                  value={animation.animationEasing}
                  onChange={event =>
                    updateScrollAnimation({
                      animationEasing: resolveMotionEasing(event.target.value),
                    })
                  }
                >
                  {MOTION_EASING_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs leading-relaxed text-text-tertiary">
                설정을 바꾸면 미리보기에서 다시 재생돼요.
              </p>
            </>
          )}
          {expanded && (
            <label className="flex flex-col gap-1 text-xs">
              스크롤 재생 조건
              <select
                className="h-9 rounded-md border border-border-divider px-2 text-sm"
                value={animation.triggerMode}
                onChange={e =>
                  updateScrollAnimation({
                    triggerMode: e.target.value as typeof animation.triggerMode,
                  })
                }
              >
                <option value="down-only">처음 내릴 때만</option>
                <option value="down-repeat">내릴 때마다</option>
                <option value="both">올리거나 내릴 때마다</option>
              </select>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
