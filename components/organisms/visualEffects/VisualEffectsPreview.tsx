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
import {
  resolveBlockAmbientEffect,
  type ResolvedInvitationEffects,
} from '@/shared/utils/invitationEffects';
import {
  boundedMotionNumber,
  MOTION_EASINGS,
  resolveMotionEasing,
} from '@/shared/utils/motionSettings';

import { AmbientParticles, ParticleLayer } from './ParticleLayer';

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

type EffectsScope = 'viewport' | 'frame' | 'editor';

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
      {scope !== 'editor' && (
        <AmbientParticles
          effects={effects}
          placement="screen"
          contained={contained}
        />
      )}
      {opened && effects.confetti && !prefersReducedMotion && (
        <ParticleLayer
          effect="confetti"
          {...effects.confettiMotion}
          contained={contained}
          burst
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
      (effects.ambientScope !== 'screen' || !effects.ambient.length))
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
  const previewEffect = resolveBlockAmbientEffect(settings, effect);
  const speed = boundedMotionNumber(blockInfo.props.effectSpeed, 0.5, 2, 1);
  const easing =
    MOTION_EASINGS[resolveMotionEasing(blockInfo.props.motionEasing)];
  void titleClassName;
  return (
    <div className={className} {...rest}>
      <div className="relative flex h-60 w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-100 bg-gradient-to-b from-[#fbfaf8] to-white">
        <ParticleLayer
          effect={previewEffect}
          speed={speed}
          easing={easing}
          inline
        />
        <p className="relative z-10 rounded-lg bg-white/80 px-4 py-2 text-xs text-text-secondary">
          {previewEffect === 'none' ? '배경 효과 없음' : '배경 효과 미리보기'}
          {settings?.opening === undefined &&
            showEnvelopeIntro &&
            ' · 봉투 오프닝 사용'}
        </p>
      </div>
    </div>
  );
}
