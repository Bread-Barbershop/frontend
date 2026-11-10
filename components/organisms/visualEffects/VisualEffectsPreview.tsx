'use client';

import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import type { EditorBlock } from '@/shared/types/block';

import './visualEffects.css';

import type { CSSProperties, HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'visualEffects'>;
  titleClassName?: string;
  isGuestPage?: boolean;
}

const PALETTE = ['#e4b871', '#e59eaa', '#91bac4', '#bba5d5'];
const PARTICLES = Array.from({ length: 24 }, (_, i) => i);

function ParticleLayer({ effect, preview = false }: { effect: string; preview?: boolean }) {
  if (!['petals', 'snow', 'confetti', 'bokeh'].includes(effect)) return null;
  return (
    <div className={preview ? 'pointer-events-none absolute inset-0 overflow-hidden' : 'invia-effect-layer'} aria-hidden="true">
      {PARTICLES.map(i => {
        const style = {
          '--x': String((i * 37 + 13) % 100) + '%',
          '--y': String((i * 29 + 8) % 100) + '%',
          '--duration': String(7 + (i % 8)) + 's',
          '--delay': String(-(i % 12)) + 's',
          '--size': String(9 + (i % 5) * 4) + 'px',
          '--particle-color': PALETTE[i % PALETTE.length],
        } as CSSProperties;
        return (
          <span key={i}
            className={'invia-effect-particle invia-effect-' + effect}
            style={style}>{effect === 'snow' ? '❄' : effect === 'petals' ? '✿' : effect === 'confetti' ? '◆' : ''}</span>
        );
      })}
    </div>
  );
}

function EnvelopeIntro() {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'done'>('closed');
  if (phase === 'done') return null;
  return (
    <div role="dialog" aria-modal="true" aria-label="초대장 열기"
      className={'invia-intro' + (phase === 'opening' ? ' invia-intro-opening' : '')}
      onAnimationEnd={e => {
        if (e.currentTarget === e.target && phase === 'opening') setPhase('done');
      }}>
      <div className="invia-intro-card" aria-hidden="true" />
      {phase === 'closed' && (
        <button type="button" className="z-10 mt-10 rounded-full bg-[#6e5149] px-8 py-3 text-sm font-semibold text-white"
          onClick={() => setPhase('opening')}>초대장 열기</button>
      )}
    </div>
  );
}

const subscribeToHydration = () => () => {};

export function VisualEffectsPreview({ blockInfo, isGuestPage = false, className = '', titleClassName, ...rest }: Props) {
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const { effect, showEnvelopeIntro } = blockInfo.props;
  void titleClassName;
  return (
    <div className={className} {...rest}>
      {isGuestPage ? (
        mounted && createPortal(
          <>
            <ParticleLayer effect={effect} />
            {showEnvelopeIntro && <EnvelopeIntro />}
          </>,
          document.body
        )
      ) : (
        <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-lg bg-[#FAFAFB]">
          <ParticleLayer effect={effect} preview />
          <p className="relative z-10 rounded-lg bg-white/80 px-4 py-2 text-xs text-text-secondary">
            {effect === 'none' ? '배경 효과 없음' : '배경 효과 미리보기'}
            {showEnvelopeIntro && ' · 봉투 오프닝 사용'}
          </p>
        </div>
      )}
    </div>
  );
}
