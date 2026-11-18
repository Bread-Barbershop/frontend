'use client';

import { useState, type CSSProperties } from 'react';

import { usePrefersReducedMotion } from '@/components/organisms/gallery/hooks/usePrefersReducedMotion';
import type {
  AmbientScope,
  ResolvedInvitationEffects,
} from '@/shared/utils/invitationEffects';

import './visualEffects.css';

const PALETTE = ['#cbb584', '#e4cfcb', '#bac8b6', '#f4e8d4'];
const PARTICLES = Array.from({ length: 24 }, (_, i) => i);

const PRESETS = {
  petals: { count: 18, size: 8, spread: 6, duration: 14 },
  snow: { count: 24, size: 2, spread: 4, duration: 18 },
  confetti: { count: 24, size: 4, spread: 4, duration: 11 },
  bokeh: { count: 10, size: 24, spread: 32, duration: 7 },
} as const;

function isParticleEffect(value: string): value is keyof typeof PRESETS {
  return Object.hasOwn(PRESETS, value);
}

export function ParticleLayer({
  effect,
  speed,
  easing,
  contained = false,
  inline = false,
  burst = false,
}: {
  effect: string;
  speed: number;
  easing: string;
  contained?: boolean;
  inline?: boolean;
  burst?: boolean;
}) {
  const [finished, setFinished] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  if (finished || reducedMotion || !isParticleEffect(effect)) return null;
  const preset = PRESETS[effect];
  return (
    <div
      className={[
        'invia-effect-layer',
        contained && 'invia-effect-preview',
        inline && 'invia-effect-inline',
        burst && 'invia-effect-burst',
      ]
        .filter(Boolean)
        .join(' ')}
      onAnimationEnd={event => {
        if (burst && event.target === event.currentTarget) setFinished(true);
      }}
      aria-hidden="true"
      style={
        {
          '--burst-duration': `${2.45 / speed}s`,
          '--motion-easing': easing,
        } as CSSProperties
      }
    >
      {PARTICLES.slice(0, preset.count).map(i => {
        const seed = (i * 73 + 41) % 101;
        const depth = ((i * 47 + 19) % 97) / 96;
        const duration =
          (burst
            ? 1.65 + seed * 0.005
            : preset.duration * (1.4 - depth * 0.55)) / speed;
        const size = preset.size + depth * preset.spread;
        const style = {
          '--x': String((i * 37 + 13) % 100) + '%',
          '--y': String((i * 29 + 8) % 100) + '%',
          '--duration': `${duration}s`,
          '--delay': `${burst ? (seed * 0.003) / speed : (-duration * seed) / 100}s`,
          '--sway-duration': `${(3 + (seed % 4)) / speed}s`,
          '--tilt': `${((i * 53) % 140) - 70}deg`,
          '--tumble-duration': `${(4.3 + seed * 0.035) / speed}s`,
          '--sway': `${10 + (seed % 24)}px`,
          '--size': `${size}px`,
          '--alpha': String(0.38 + depth * 0.45),
          '--blur': `${depth < 0.25 ? 0.75 : 0}px`,
          '--particle-color': PALETTE[i % PALETTE.length],
        } as CSSProperties;
        return (
          <span
            key={i}
            className={'invia-effect-particle invia-effect-' + effect}
            style={style}
          >
            <i>
              <b />
            </i>
          </span>
        );
      })}
    </div>
  );
}

export function AmbientParticles({
  effects,
  placement,
  contained = false,
}: {
  effects: ResolvedInvitationEffects;
  placement: AmbientScope;
  contained?: boolean;
}) {
  if (effects.ambientScope !== placement) return null;
  return effects.ambient.map(({ effect, ...motion }) => (
    <ParticleLayer
      key={effect}
      effect={effect}
      {...motion}
      contained={contained || placement === 'poster'}
    />
  ));
}
