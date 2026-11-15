'use client';

import { ArrowDown, ArrowUpRight, Heart, Mail, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';
import { usePrefersReducedMotion } from '@/components/organisms/gallery/hooks/usePrefersReducedMotion';
import type { buildShowcaseInvitation } from '@/shared/data/buildShowcaseInvitation';
import type { ShowcaseInvitation } from '@/shared/data/showcaseInvitations';
import {
  getShowcasePresentation,
  SHOWCASE_CHAPTER_LABELS,
} from '@/shared/data/showcasePresentation';

import styles from './showcase.module.css';

import type { StaticImageData } from 'next/image';
import type { CSSProperties, RefObject } from 'react';

type Props = ReturnType<typeof buildShowcaseInvitation> & {
  design: ShowcaseInvitation;
  cover: StaticImageData;
  coverAlt: string;
};
type Presentation = ReturnType<typeof getShowcasePresentation>;

export default function ShowcaseDocument({
  design,
  cover,
  coverAlt,
  blocks,
  bulkData,
}: Props) {
  const [phase, setPhase] = useState<'sealed' | 'unsealing' | 'reading'>(
    'sealed'
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coverRef = useRef<HTMLHeadingElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const presentation = getShowcasePresentation(design);
  const chapters = blocks.filter(
    block => !['spacer', 'divider'].includes(block.component)
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (document.querySelector('[role="dialog"][aria-modal="true"]')) {
        // 사진 팝업이 열린 동안에는 바깥의 native dialog까지 함께 닫히지 않게 한다.
        event.preventDefault();
        return;
      }
      if (window.parent !== window) {
        event.preventDefault();
        window.parent.postMessage(
          { type: 'invia:close-showcase' },
          window.location.origin
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  function openInvitation() {
    if (phase !== 'sealed') return;
    const revealInvitation = () => {
      setPhase('reading');
      window.scrollTo({ top: 0 });
      requestAnimationFrame(() =>
        coverRef.current?.focus({ preventScroll: true })
      );
    };
    if (prefersReducedMotion) {
      revealInvitation();
      return;
    }
    setPhase('unsealing');
    timeoutRef.current = setTimeout(revealInvitation, 720);
  }

  function foldInvitation() {
    setPhase('sealed');
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0 });
      openButtonRef.current?.focus({ preventScroll: true });
    });
  }

  return (
    <article
      className={styles.experience}
      data-family={presentation.family}
      data-monochrome={presentation.monochrome || undefined}
      aria-label={`${design.name} 초대장`}
      style={
        {
          '--paper': design.palette[0],
          '--accent': design.palette[1],
          '--ink': design.palette[2],
        } as CSSProperties
      }
    >
      {phase !== 'reading' && (
        <EnvelopeOpening
          design={design}
          presentation={presentation}
          opening={phase === 'unsealing'}
          onOpen={openInvitation}
          buttonRef={openButtonRef}
        />
      )}

      <noscript>
        <style>{`.${styles.opening}{display:none}.${styles.reading}[hidden]{display:block}`}</style>
      </noscript>
      <div hidden={phase !== 'reading'} className={styles.reading}>
        <div className={styles.readerBar}>
          <span>{presentation.seal}</span>
          <span>
            {presentation.date.year} · {presentation.date.month} ·{' '}
            {presentation.date.day}
          </span>
          <Heart size={10} strokeWidth={1.3} aria-hidden="true" />
        </div>
        <header className={styles.cover}>
          <div className={styles.runningTitle}>
            <span>{presentation.edition}</span>
            <span>No. {String(presentation.index + 1).padStart(2, '0')}</span>
          </div>
          <div className={styles.coverFrame}>
            <Image
              src={cover}
              alt={coverAlt}
              priority
              sizes="(max-width: 430px) 100vw, 430px"
              className={styles.poster}
            />
          </div>
          <div className={styles.coverSignature}>
            <StationeryOrnament />
            <p>{presentation.englishSender}</p>
            <h1 ref={coverRef} tabIndex={-1}>
              {presentation.sender}
            </h1>
            <span>기쁜 마음으로 당신을 초대합니다</span>
          </div>
          <div
            className={styles.dateRibbon}
            aria-label={`${design.date} ${design.time}`}
          >
            <span>{presentation.date.weekday}</span>
            <strong>
              {presentation.date.month}
              <i>·</i>
              {presentation.date.day}
            </strong>
            <span>
              {presentation.date.year} / {design.time}
            </span>
          </div>
          <p className={styles.scrollNote}>
            <ArrowDown size={12} aria-hidden="true" />
            천천히, 우리의 이야기를 따라와 주세요
          </p>
        </header>

        <div className={styles.chapters}>
          <GuestRenderer
            blocks={blocks}
            bulkData={bulkData}
            isGuestPage
            renderBlock={(block, view) => {
              if (block.component === 'spacer') return null;
              if (block.component === 'divider')
                return (
                  <div className={styles.interlude} aria-hidden="true">
                    <StationeryOrnament />
                  </div>
                );
              const number =
                chapters.findIndex(chapter => chapter.id === block.id) + 1;
              const chapterLabel =
                block.component === 'picture' && design.type === 'seminar'
                  ? 'THE CONFERENCE SPACE'
                  : SHOWCASE_CHAPTER_LABELS[block.component];
              return (
                <section
                  className={styles.chapter}
                  data-component={block.component}
                  aria-label={chapterLabel}
                >
                  <div className={styles.chapterTab} aria-hidden="true">
                    <span>{String(number).padStart(2, '0')}</span>
                    <i />
                    <span>{chapterLabel}</span>
                  </div>
                  <div className={styles.blockContent}>{view}</div>
                  {block.component === 'greeting' && (
                    <div className={styles.letterSignoff}>
                      <span>
                        {design.type === 'seminar'
                          ? 'See you there,'
                          : 'With love,'}
                      </span>
                      <strong>{presentation.sender}</strong>
                      <StationeryOrnament />
                    </div>
                  )}
                  {block.component === 'coupleIntroduction' && (
                    <span className={styles.coupleAmpersand} aria-hidden="true">
                      &
                    </span>
                  )}
                  {block.component === 'myChild' && (
                    <div className={styles.firstYearBadge}>
                      <Sparkles size={16} aria-hidden="true" />
                      <span>365일만큼 자란 사랑</span>
                    </div>
                  )}
                </section>
              );
            }}
          />
        </div>

        <div className={styles.waitingCard}>
          <span className={styles.smallSeal} aria-hidden="true">
            {presentation.seal}
          </span>
          <p>이날의 가장 반가운 얼굴이 되어 주세요.</p>
          <strong>
            {presentation.date.monthName} {presentation.date.day},{' '}
            {presentation.date.year}
          </strong>
          <span>{design.venue}</span>
        </div>
        <footer className={styles.footer}>
          <StationeryOrnament />
          <p>SENT WITH LOVE, SEALED WITH INVIA</p>
          <button type="button" onClick={foldInvitation}>
            <Mail size={13} />
            초대장 다시 접어 두기
          </button>
          <small>디자인 샘플 · 인물, 장소와 일정은 예시입니다.</small>
        </footer>
      </div>
    </article>
  );
}

function EnvelopeOpening({
  design,
  presentation,
  opening,
  onOpen,
  buttonRef,
}: {
  design: ShowcaseInvitation;
  presentation: Presentation;
  opening: boolean;
  onOpen: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className={styles.opening} data-opening={opening || undefined}>
      <div className={styles.openingTop}>
        <span>A NOTE, JUST FOR YOU</span>
        <span>INVIA POST</span>
      </div>
      <div className={styles.recipient}>
        <StationeryOrnament />
        <p>{presentation.edition}</p>
        <h1>{presentation.recipient},</h1>
        <span>{presentation.opening}</span>
      </div>
      <button
        ref={buttonRef}
        type="button"
        className={styles.openButton}
        aria-label={`${design.name} 초대장 열기`}
        onClick={onOpen}
        disabled={opening}
      >
        <span className={styles.envelope} aria-hidden="true">
          <span className={styles.insert}>
            <small>YOU ARE CORDIALLY INVITED</small>
            <strong>{presentation.englishSender}</strong>
            <i>
              {presentation.date.monthName} {presentation.date.day}
            </i>
          </span>
          <span className={styles.envelopeBack} />
          <span className={styles.foldLeft} />
          <span className={styles.foldRight} />
          <span className={styles.foldBottom} />
          <span className={styles.flap} />
          <span className={styles.waxSeal}>
            <span>{presentation.seal}</span>
          </span>
          <span className={styles.envelopeAddress}>
            <small>TO. OUR DEAREST GUEST</small>
            <strong>{presentation.sender}의 초대</strong>
          </span>
          <span className={styles.postage}>
            {presentation.date.month}
            <i>—</i>
            {presentation.date.day}
          </span>
        </span>
        <span className={styles.openCta}>
          {design.type === 'seminar'
            ? '당신의 초대장을 확인해 보세요'
            : '봉투를 열어 마음을 만나보세요'}
          <ArrowUpRight size={14} />
        </span>
      </button>
      <div className={styles.openingBottom}>
        <span>
          {presentation.date.year} · {presentation.date.month} ·{' '}
          {presentation.date.day}
        </span>
        <i />
        <span>정성껏 담아, 당신에게.</span>
      </div>
    </div>
  );
}

function StationeryOrnament() {
  return (
    <svg
      className={styles.ornament}
      viewBox="0 0 100 36"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 29C27 26 40 18 51 7M49 27C62 25 76 24 93 29"
        stroke="currentColor"
        strokeWidth=".8"
      />
      <path
        d="M22 26C13 23 14 16 14 16C23 17 25 22 22 26ZM31 22C24 16 28 9 28 9C35 13 35 19 31 22ZM41 15C36 9 41 3 41 3C47 8 46 12 41 15ZM28 24C31 31 40 29 40 29C38 23 33 21 28 24ZM53 26C55 20 62 18 62 18C63 25 59 28 53 26ZM69 26C72 30 80 32 83 31C79 26 74 24 69 26Z"
        fill="currentColor"
        opacity=".65"
      />
      <circle cx="52" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
}
