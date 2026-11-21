'use client';

import { useState } from 'react';
import { useShallow } from 'zustand/shallow';

import {
  getBlockEntrance,
  resolveScrollAnimation,
  SCROLL_ANIMATION_OPTIONS,
} from '@/components/molecules/scroll-fade-in/animationConfig';
import { FormSelector } from '@/components/molecules/selector/FormSelector';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { MOTION_EASING_OPTIONS } from '@/shared/utils/motionSettings';

const TRIGGER_OPTIONS = [
  { value: 'down-only', label: '처음 내릴 때만' },
  { value: 'down-repeat', label: '내릴 때마다' },
  { value: 'both', label: '올리거나 내릴 때마다' },
] as const;

export function ScrollAnimationControls({ embedded = false } = {}) {
  const [expanded, setExpanded] = useState(false);
  const { scrollAnimation, updateScrollAnimation } = useEditorStore(
    useShallow(state => ({
      scrollAnimation: state.scrollAnimation,
      updateScrollAnimation: state.updateScrollAnimation,
    }))
  );
  const animation = resolveScrollAnimation(scrollAnimation);
  const hasBlockEffect = useEditorStore(state =>
    state.block.some(block => {
      const effect = getBlockEntrance(block.component, block.props);
      return effect !== undefined && effect !== 'none';
    })
  );
  const hasEffect = animation.animationType !== 'none' || hasBlockEffect;
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
          <FormSelector
            label={embedded ? '스크롤 애니메이션' : '효과'}
            className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary"
            options={SCROLL_ANIMATION_OPTIONS}
            value={animation.animationType}
            onChange={animationType => updateScrollAnimation({ animationType })}
          />
          {embedded && hasEffect && toggle}
          {expanded && hasEffect && (
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
              <FormSelector
                label="부드러움"
                className="flex flex-col gap-1 text-xs"
                options={MOTION_EASING_OPTIONS}
                value={animation.animationEasing}
                onChange={animationEasing =>
                  updateScrollAnimation({ animationEasing })
                }
              />
              <p className="text-xs leading-relaxed text-text-tertiary">
                설정을 바꾸면 미리보기에서 다시 재생돼요.
              </p>
            </>
          )}
          {expanded && hasEffect && (
            <FormSelector
              label="스크롤 재생 조건"
              className="flex flex-col gap-1 text-xs"
              options={TRIGGER_OPTIONS}
              value={animation.triggerMode}
              onChange={triggerMode => updateScrollAnimation({ triggerMode })}
            />
          )}
        </div>
      )}
    </div>
  );
}
