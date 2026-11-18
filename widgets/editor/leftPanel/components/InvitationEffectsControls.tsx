'use client';

import { ChevronDown, RotateCcw, Sparkles } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import {
  navigationBarClassName,
  navigationBarHeadingClassName,
} from '@/components/molecules/navigation-bar/NavigationBar.style';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';
import { resolveInvitationEffects } from '@/shared/utils/invitationEffects';

import { ScrollAnimationControls } from './ScrollAnimationControls';

export function InvitationEffectsControls() {
  const { blocks, settings, updateInvitationEffects, replayInvitationEffects } =
    useEditorStore(
      useShallow(state => ({
        blocks: state.block,
        settings: state.invitationEffects,
        updateInvitationEffects: state.updateInvitationEffects,
        replayInvitationEffects: state.replayInvitationEffects,
      }))
    );
  const { opening, confetti } = resolveInvitationEffects(settings, blocks);

  return (
    <details open className="group w-full border-b border-border-divider">
      <summary
        className={cn(
          navigationBarClassName,
          'cursor-pointer list-none [&::-webkit-details-marker]:hidden'
        )}
      >
        <Sparkles size={16} aria-hidden="true" className="absolute left-0" />
        <span className={navigationBarHeadingClassName}>초대장 연출</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="absolute right-0 group-open:rotate-180"
        />
      </summary>
      <div className="flex flex-col gap-4 pb-4">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary">
          오프닝
          <select
            className="h-9 rounded-md border border-border-divider bg-white px-2 text-sm text-text-primary"
            value={opening}
            onChange={event =>
              updateInvitationEffects({
                opening:
                  event.target.value === 'envelope' ? 'envelope' : 'direct',
              })
            }
          >
            <option value="direct">바로 시작</option>
            <option value="envelope">편지봉투 열기</option>
          </select>
        </label>
        <div className="flex flex-col gap-1 text-xs font-medium text-text-secondary">
          <span>축하 효과</span>
          <label className="flex min-h-8 cursor-pointer items-center justify-between text-sm text-text-primary">
            컨페티
            <input
              type="checkbox"
              role="switch"
              aria-label="축하 효과 컨페티"
              className="relative h-[22px] w-9 cursor-pointer appearance-none rounded-full bg-neutral-400 after:absolute after:top-[3px] after:left-[3px] after:size-4 after:rounded-full after:bg-white after:transition-transform checked:bg-primary checked:after:translate-x-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:after:transition-none"
              checked={confetti}
              onChange={event =>
                updateInvitationEffects({ confetti: event.target.checked })
              }
            />
          </label>
        </div>
        <ScrollAnimationControls embedded />
        <button
          type="button"
          className="inline-flex min-h-8 w-fit items-center gap-1.5 self-end rounded-md px-1 text-xs text-text-secondary enabled:hover:text-text-primary disabled:opacity-40"
          onClick={replayInvitationEffects}
          disabled={opening === 'direct' && !confetti}
        >
          <RotateCcw size={14} aria-hidden="true" />
          처음부터 보기
        </button>
      </div>
    </details>
  );
}
