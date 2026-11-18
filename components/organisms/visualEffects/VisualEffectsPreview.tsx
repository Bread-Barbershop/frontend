'use client';

import { MailOpen, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { createPortal } from 'react-dom';

import { usePrefersReducedMotion } from '@/components/organisms/gallery/hooks/usePrefersReducedMotion';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import {
  isDarkInvitationBackground,
  parseInvitationBackgroundColor,
} from '@/shared/utils/invitationBackgroundColor';
import type { ResolvedInvitationEffects } from '@/shared/utils/invitationEffects';
import {
  boundedMotionNumber,
  MOTION_EASINGS,
  resolveMotionEasing,
} from '@/shared/utils/motionSettings';

import './visualEffects.css';

import type {
  AnimationEvent,
  CSSProperties,
  HTMLAttributes,
  RefObject,
} from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'visualEffects'>;
  titleClassName?: string;
}

const PALETTE = ['#cbb584', '#e4cfcb', '#bac8b6', '#f4e8d4'];
const PARTICLES = Array.from({ length: 24 }, (_, i) => i);

type EffectsScope = 'viewport' | 'frame' | 'editor';

function ParticleLayer({
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
  if (finished || !['petals', 'snow', 'confetti', 'bokeh'].includes(effect))
    return null;
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
          '--travel': inline ? '300px' : contained ? '930px' : '115dvh',
          '--burst-duration': `${2.45 / speed}s`,
          '--motion-easing': easing,
        } as CSSProperties
      }
    >
      {PARTICLES.slice(
        0,
        effect === 'bokeh' ? 10 : effect === 'petals' ? 16 : 24
      ).map(i => {
        const seed = (i * 73 + 41) % 101;
        const duration =
          (burst ? 1.65 + seed * 0.005 : 14 + seed * 0.15) / speed;
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
          '--delay': `${burst ? (seed * 0.003) / speed : (-duration * seed) / 100}s`,
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

function EnvelopeIntro({
  speed,
  easing,
  scope,
  contentRef,
  backgroundColor = '#F8F5EE',
  onOpened,
}: {
  speed: number;
  easing: string;
  scope: EffectsScope;
  contentRef?: RefObject<HTMLElement | null>;
  backgroundColor?: string;
  onOpened: () => void;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [opening, setOpening] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const duration = 1200 / speed;
  const contained = scope !== 'viewport';

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    if (contained) {
      const content = contentRef?.current;
      const wasInert = content?.hasAttribute('inert') ?? false;
      content?.setAttribute('inert', '');
      openButtonRef.current?.focus({ preventScroll: true });
      return () => {
        content?.toggleAttribute('inert', wasInert);
        if (previousFocus instanceof HTMLElement) {
          previousFocus.focus({ preventScroll: true });
        }
      };
    }
    if (!dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      dialog.close();
    };
  }, [contained, contentRef]);

  useEffect(() => {
    if (!opening) return;
    const timeout = window.setTimeout(
      onOpened,
      prefersReducedMotion ? 0 : duration + 80
    );
    return () => window.clearTimeout(timeout);
  }, [duration, onOpened, opening, prefersReducedMotion]);

  const openEnvelope = () => {
    if (opening) return;
    if (prefersReducedMotion) {
      onOpened();
      return;
    }
    setOpening(true);
  };

  const backdrop = parseInvitationBackgroundColor(backgroundColor);
  const tint =
    backdrop &&
    `rgba(${backdrop.r}, ${backdrop.g}, ${backdrop.b}, ${backdrop.a})`;
  const coverProps = {
    'aria-label': '초대장 열기',
    'data-invia-intro-dark':
      isDarkInvitationBackground(backgroundColor) || undefined,
    className: [
      'invia-intro',
      contained && 'invia-intro-preview',
      opening && 'invia-intro-opening',
    ]
      .filter(Boolean)
      .join(' '),
    style: {
      '--intro-duration': `${duration / 1000}s`,
      '--motion-easing': easing,
      '--intro-paper': tint,
    } as CSSProperties,
    onAnimationEnd: (event: AnimationEvent<HTMLElement>) => {
      if (opening && event.target === event.currentTarget) onOpened();
    },
  };

  const envelope = (
    <>
      <p className="invia-intro-greeting" lang="en">
        You’re invited
      </p>
      <div className="invia-intro-card" aria-hidden="true">
        <span className="invia-intro-flap" />
        <span className="invia-intro-seal">✦</span>
      </div>
      <button
        type="button"
        ref={openButtonRef}
        className="invia-intro-button"
        aria-disabled={opening}
        onClick={openEnvelope}
      >
        <MailOpen aria-hidden="true" size={16} />
        초대장 열기
      </button>
    </>
  );

  if (contained) {
    return (
      <div
        {...coverProps}
        role="dialog"
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            onOpened();
          }
        }}
      >
        {scope === 'editor' && (
          <button
            type="button"
            className="absolute right-3 top-3 rounded-full p-2 hover:bg-black/5"
            onClick={onOpened}
            aria-label="봉투 미리보기 닫기"
          >
            <X aria-hidden="true" size={18} />
          </button>
        )}
        {envelope}
      </div>
    );
  }

  return (
    <dialog
      {...coverProps}
      ref={dialogRef}
      aria-modal="true"
      onCancel={event => {
        event.preventDefault();
        onOpened();
      }}
    >
      {envelope}
    </dialog>
  );
}

type InvitationVisualEffectsProps = {
  effects: ResolvedInvitationEffects;
  scope?: EffectsScope;
  contentRef?: RefObject<HTMLElement | null>;
  backgroundColor?: string;
};

function InvitationEffectsLayers({
  effects,
  scope = 'viewport',
  contentRef,
  backgroundColor,
}: InvitationVisualEffectsProps) {
  const [opened, setOpened] = useState(effects.opening === 'direct');
  const reveal = useCallback(() => setOpened(true), []);
  const contained = scope !== 'viewport';
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <>
      {scope !== 'editor' &&
        effects.ambient.map(({ effect, ...motion }) => (
          <ParticleLayer
            key={effect}
            effect={effect}
            {...motion}
            contained={contained}
          />
        ))}
      {opened && effects.confetti && !prefersReducedMotion && (
        <ParticleLayer
          effect="confetti"
          {...effects.confettiMotion}
          contained={contained}
          burst={scope === 'editor' || !effects.repeatConfetti}
        />
      )}
      {!opened && (
        <EnvelopeIntro
          {...effects.openingMotion}
          scope={scope}
          contentRef={contentRef}
          backgroundColor={backgroundColor}
          onOpened={reveal}
        />
      )}
    </>
  );
}

const subscribeToHydration = () => () => {};

export function InvitationVisualEffects({
  effects,
  scope = 'viewport',
  contentRef,
  backgroundColor,
}: InvitationVisualEffectsProps) {
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false
  );
  if (
    !mounted ||
    (effects.opening === 'direct' &&
      !effects.confetti &&
      !effects.ambient.length)
  )
    return null;
  const layers = (
    <InvitationEffectsLayers
      key={effects.opening}
      effects={effects}
      scope={scope}
      contentRef={contentRef}
      backgroundColor={backgroundColor}
    />
  );
  return scope === 'viewport' ? createPortal(layers, document.body) : layers;
}

export function VisualEffectsPreview({
  blockInfo,
  className = '',
  titleClassName,
  ...rest
}: Props) {
  const settings = useEditorStore(state => state.invitationEffects);
  const { effect, showEnvelopeIntro } = blockInfo.props;
  const showInlineEffect =
    effect !== 'confetti' || settings?.confetti === undefined;
  const speed = boundedMotionNumber(blockInfo.props.effectSpeed, 0.5, 2, 1);
  const easing =
    MOTION_EASINGS[resolveMotionEasing(blockInfo.props.motionEasing)];
  void titleClassName;
  return (
    <div className={className} {...rest}>
      <div className="relative flex h-60 w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-100 bg-gradient-to-b from-[#fbfaf8] to-white">
        {showInlineEffect && (
          <ParticleLayer effect={effect} speed={speed} easing={easing} inline />
        )}
        <p className="relative z-10 rounded-lg bg-white/80 px-4 py-2 text-xs text-text-secondary">
          {showInlineEffect
            ? effect === 'none'
              ? '배경 효과 없음'
              : '배경 효과 미리보기'
            : '축하 효과는 전체 스타일에서 설정'}
          {settings?.opening === undefined &&
            showEnvelopeIntro &&
            ' · 봉투 오프닝 사용'}
        </p>
      </div>
    </div>
  );
}
