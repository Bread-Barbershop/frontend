'use client';

import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import type { EditorBlock } from '@/shared/types/block';
import {
  boundedMotionNumber,
  MOTION_EASINGS,
  resolveMotionEasing,
} from '@/shared/utils/motionSettings';

import './visualEffects.css';

import type { CSSProperties, HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'visualEffects'>;
  titleClassName?: string;
  isGuestPage?: boolean;
}

const PALETTE = ['#cbb584', '#e4cfcb', '#bac8b6', '#f4e8d4'];
const PARTICLES = Array.from({ length: 24 }, (_, i) => i);

function ParticleLayer({
  effect,
  speed,
  easing,
  preview = false,
}: {
  effect: string;
  speed: number;
  easing: string;
  preview?: boolean;
}) {
  if (!['petals', 'snow', 'confetti', 'bokeh'].includes(effect)) return null;
  return (
    <div
      className={
        preview
          ? 'invia-effect-layer invia-effect-preview'
          : 'invia-effect-layer'
      }
      aria-hidden="true"
      style={
        {
          '--travel': preview ? '300px' : '115vh',
          '--motion-easing': easing,
        } as CSSProperties
      }
    >
      {PARTICLES.slice(
        0,
        effect === 'bokeh' ? 10 : effect === 'petals' ? 16 : 24
      ).map(i => {
        const seed = (i * 73 + 41) % 101;
        const duration = (14 + seed * 0.15) / speed;
        const size =
          effect === 'snow'
            ? 2 + (seed % 4)
            : effect === 'bokeh'
              ? 24 + (seed % 32)
              : effect === 'petals'
                ? 7 + (seed % 6)
                : 3 + (seed % 4);
        const style = {
          '--x': String((i * 37 + 13) % 100) + '%',
          '--y': String((i * 29 + 8) % 100) + '%',
          '--duration': `${duration}s`,
          '--delay': `${(-duration * seed) / 100}s`,
          '--sway-duration': `${(3 + (seed % 4)) / speed}s`,
          '--sway': `${10 + (seed % 24)}px`,
          '--size': `${size}px`,
          '--alpha': String(0.25 + seed / 250),
          '--blur': `${i % 3 === 0 ? 0.8 : 0}px`,
          '--particle-color': PALETTE[i % PALETTE.length],
        } as CSSProperties;
        return (
          <span
            key={i}
            className={'invia-effect-particle invia-effect-' + effect}
            style={style}
          >
            <i />
          </span>
        );
      })}
    </div>
  );
}

function EnvelopeIntro({ speed, easing }: { speed: number; easing: string }) {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'done'>('closed');
  if (phase === 'done') return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="초대장 열기"
      className={
        'invia-intro' + (phase === 'opening' ? ' invia-intro-opening' : '')
      }
      style={
        {
          '--intro-duration': `${1.2 / speed}s`,
          '--motion-easing': easing,
        } as CSSProperties
      }
      onAnimationEnd={e => {
        if (e.currentTarget === e.target && phase === 'opening')
          setPhase('done');
      }}
    >
      <div className="invia-intro-card" aria-hidden="true" />
      {phase === 'closed' && (
        <button
          type="button"
          className="z-10 mt-10 rounded-full bg-[#6e5149] px-8 py-3 text-sm font-semibold text-white"
          onClick={() => setPhase('opening')}
        >
          초대장 열기
        </button>
      )}
    </div>
  );
}

const subscribeToHydration = () => () => {};

export function VisualEffectsPreview({
  blockInfo,
  isGuestPage = false,
  className = '',
  titleClassName,
  ...rest
}: Props) {
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );
  const { effect, showEnvelopeIntro } = blockInfo.props;
  const speed = boundedMotionNumber(blockInfo.props.effectSpeed, 0.5, 2, 1);
  const easing =
    MOTION_EASINGS[resolveMotionEasing(blockInfo.props.motionEasing)];
  void titleClassName;
  return (
    <div className={className} {...rest}>
      {isGuestPage ? (
        mounted &&
        createPortal(
          <>
            <ParticleLayer effect={effect} speed={speed} easing={easing} />
            {showEnvelopeIntro && (
              <EnvelopeIntro speed={speed} easing={easing} />
            )}
          </>,
          document.body
        )
      ) : (
        <div className="relative flex h-60 w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-100 bg-gradient-to-b from-[#fbfaf8] to-white">
          <ParticleLayer
            effect={effect}
            speed={speed}
            easing={easing}
            preview
          />
          <p className="relative z-10 rounded-lg bg-white/80 px-4 py-2 text-xs text-text-secondary">
            {effect === 'none' ? '배경 효과 없음' : '배경 효과 미리보기'}
            {showEnvelopeIntro && ' · 봉투 오프닝 사용'}
          </p>
        </div>
      )}
    </div>
  );
}
