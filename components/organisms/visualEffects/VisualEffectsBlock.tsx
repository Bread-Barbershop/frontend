'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import {
  boundedMotionNumber,
  MOTION_EASING_OPTIONS,
  resolveMotionEasing,
} from '@/shared/utils/motionSettings';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

export function VisualEffectsBlock({
  blockInfo,
  id,
}: {
  blockInfo: EditorBlock<'visualEffects'>;
  id: string;
}) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const settings = useEditorStore(state => state.invitationEffects);
  const { effect, showEnvelopeIntro } = blockInfo.props;
  return (
    <LeftEditorWrapper ariaLabel="배경 및 오프닝 효과" className="gap-3">
      <NavigationBar>배경 · 오프닝 효과</NavigationBar>
      <div className="flex flex-col gap-4 py-2 text-sm">
        <label className="flex flex-col gap-1">
          배경 효과
          <select
            className="h-10 rounded-md border border-border-divider px-3"
            value={effect}
            onChange={e => updateBlock(id, { effect: e.target.value })}
          >
            <option value="none">없음</option>
            <option value="petals">벚꽃 날림</option>
            <option value="snow">눈 내림</option>
            {settings?.confetti === undefined ? (
              <option value="confetti">축하 컨페티</option>
            ) : effect === 'confetti' ? (
              <option value="confetti" disabled>
                축하 컨페티 · 전체 스타일
              </option>
            ) : null}
            <option value="bokeh">빛망울</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className="flex justify-between">
            재생 속도{' '}
            <output>
              {boundedMotionNumber(
                blockInfo.props.effectSpeed,
                0.5,
                2,
                1
              ).toFixed(2)}
              배
            </output>
          </span>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.25}
            aria-label="재생 속도"
            value={boundedMotionNumber(blockInfo.props.effectSpeed, 0.5, 2, 1)}
            onChange={event =>
              updateBlock(id, { effectSpeed: Number(event.target.value) })
            }
          />
          <span className="flex justify-between text-xs text-text-tertiary">
            <span>느리게</span>
            <span>빠르게</span>
          </span>
        </label>
        <label className="flex flex-col gap-1">
          부드러움
          <select
            className="h-10 rounded-md border border-border-divider px-3"
            value={resolveMotionEasing(blockInfo.props.motionEasing)}
            onChange={event =>
              updateBlock(id, { motionEasing: event.target.value })
            }
          >
            {MOTION_EASING_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        {settings?.opening === undefined && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showEnvelopeIntro}
              onChange={e =>
                updateBlock(id, { showEnvelopeIntro: e.target.checked })
              }
            />
            첫 방문 시 편지 봉투 오프닝 표시
          </label>
        )}
        {(settings?.opening !== undefined ||
          settings?.confetti !== undefined) && (
          <p className="text-xs text-text-secondary">
            {settings.opening !== undefined && settings.confetti !== undefined
              ? '오프닝과 축하 효과는 전체 스타일에서 변경할 수 있어요.'
              : settings.opening !== undefined
                ? '오프닝은 전체 스타일에서 변경할 수 있어요.'
                : '축하 효과는 전체 스타일에서 변경할 수 있어요.'}
          </p>
        )}
        <p className="text-xs leading-relaxed text-text-secondary">
          재생 속도와 부드러움은 배경 효과와 봉투 오프닝에 함께 적용돼요. 움직임
          줄이기 설정이 켜져 있으면 애니메이션을 생략해요. 효과 블록은 초대장에
          하나만 사용해 주세요.
        </p>
      </div>
    </LeftEditorWrapper>
  );
}
