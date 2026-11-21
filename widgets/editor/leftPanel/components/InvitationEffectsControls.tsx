'use client';

import { ChevronDown, RotateCcw, Sparkles } from 'lucide-react';
import { useShallow } from 'zustand/shallow';

import {
  navigationBarClassName,
  navigationBarHeadingClassName,
} from '@/components/molecules/navigation-bar/NavigationBar.style';
import { FormSelector } from '@/components/molecules/selector/FormSelector';
import { EditorSwitch } from '@/components/molecules/switch/EditorSwitch';
import { AmbientScopeSelect } from '@/components/organisms/visualEffects/AmbientScopeSelect';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';
import {
  AMBIENT_EFFECT_OPTIONS,
  resolveInvitationEffects,
} from '@/shared/utils/invitationEffects';

import { ScrollAnimationControls } from './ScrollAnimationControls';

const OPENING_OPTIONS = [
  { value: 'direct', label: '바로 시작' },
  { value: 'envelope', label: '편지봉투 열기' },
] as const;
const LEGACY_AMBIENT_OPTIONS = [
  { value: 'blocks', label: '기존 효과 조합', disabled: true },
  ...AMBIENT_EFFECT_OPTIONS,
] as const;

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
  const { opening, confetti, ambient, ambientScope } = resolveInvitationEffects(
    settings,
    blocks
  );
  const ambientValue =
    ambient.length > 1 ? 'blocks' : (ambient[0]?.effect ?? 'none');

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
        <FormSelector
          label="오프닝"
          className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary"
          options={OPENING_OPTIONS}
          value={opening}
          onChange={opening => updateInvitationEffects({ opening })}
        />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-secondary">축하 효과</span>
          <EditorSwitch
            label="컨페티"
            ariaLabel="축하 효과 컨페티"
            checked={confetti}
            onChange={checked =>
              updateInvitationEffects({
                confetti: checked,
                ...(settings?.ambientEffect === undefined &&
                  ambient.some(({ effect }) => effect === 'confetti') && {
                    ambientEffect: 'blocks',
                  }),
              })
            }
          />
        </div>
        <FormSelector
          label="배경 효과"
          className="flex flex-col gap-1.5 text-xs font-medium text-text-secondary"
          options={
            ambientValue === 'blocks'
              ? LEGACY_AMBIENT_OPTIONS
              : AMBIENT_EFFECT_OPTIONS
          }
          value={ambientValue}
          onChange={ambientEffect =>
            updateInvitationEffects({ ambientEffect, ambientScope })
          }
        />
        {ambient.length > 0 && (
          <AmbientScopeSelect
            value={ambientScope}
            onChange={ambientScope => updateInvitationEffects({ ambientScope })}
          />
        )}
        <ScrollAnimationControls embedded />
        <button
          type="button"
          className="inline-flex min-h-8 w-fit items-center gap-1.5 self-end rounded-md px-1 text-xs text-text-secondary enabled:hover:text-text-primary disabled:opacity-40"
          onClick={replayInvitationEffects}
          disabled={opening === 'direct' && !confetti && !ambient.length}
        >
          <RotateCcw size={14} aria-hidden="true" />
          처음부터 보기
        </button>
      </div>
    </details>
  );
}
