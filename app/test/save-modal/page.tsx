'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, LoaderCircle, RotateCcw, X, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { SaveLottie } from '@/widgets/editor/preview/components/SaveLottie';

const SaveModal = dynamic(
  () =>
    import('@/widgets/editor/preview/components/SaveModal').then(
      module => module.SaveModal
    ),
  { ssr: false }
);

type SaveModalMode = 'loading' | 'success' | 'fail';

const SAVE_PROGRESS_MESSAGES = [
  '소중한 내용을 확인하고 있어요',
  '초대장에 담을 내용을 정리하고 있어요',
  '작성한 문구를 차근차근 담고 있어요',
  '소중한 사진을 불러오고 있어요',
  '사진과 문구를 보기 좋게 배치하고 있어요',
  '초대장의 전체 모습을 다듬고 있어요',
  '작은 부분까지 꼼꼼하게 살펴보고 있어요',
  '더 예쁘게 보이도록 확인하고 있어요',
  '이제 거의 다 완성됐어요',
];

const PREVIEW_INTERVAL_OPTIONS = [2000, 3000, 4000, 5000] as const;
const DEFAULT_PREVIEW_INTERVAL_MS: (typeof PREVIEW_INTERVAL_OPTIONS)[number] = 5000;

const MODE_LABEL: Record<SaveModalMode, string> = {
  loading: '로딩',
  success: '성공',
  fail: '실패',
};

const MODE_BUTTON_CLASS =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-semibold transition-colors';

const INTERVAL_BUTTON_CLASS =
  'inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-semibold transition-colors';

type SaveLoadingMessageAnimation = 'slide' | 'blur' | 'scale' | 'stagger';

const MESSAGE_EASE = [0.4, 0, 0.2, 1] as const;

const MESSAGE_ANIMATION = {
  slide: {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.32, ease: MESSAGE_EASE },
    },
    exit: {
      opacity: 0,
      y: -8,
      transition: { duration: 0.22, ease: MESSAGE_EASE },
    },
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(6px)' },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.38, ease: MESSAGE_EASE },
    },
    exit: {
      opacity: 0,
      filter: 'blur(6px)',
      transition: { duration: 0.22, ease: MESSAGE_EASE },
    },
  },
  scale: {
    initial: { opacity: 0, scale: 1.06 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: MESSAGE_EASE },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2, ease: MESSAGE_EASE },
    },
  },
} as const;

const SaveLoadingMessagePreview = ({
  message,
  animation,
}: {
  message: string;
  animation: SaveLoadingMessageAnimation;
}) => {
  const className = '-mt-6 min-h-6 text-base font-semibold text-[#202020]';

  if (animation === 'stagger') {
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={message}
          className={className}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={{
            animate: {
              transition: { staggerChildren: 0.016 },
            },
            exit: {
              transition: { staggerChildren: 0.012 },
            },
          }}
        >
          {Array.from(message).map((char, index) => (
            <motion.span
              key={`${message}-${index}`}
              className="inline-block"
              variants={{
                initial: { opacity: 0, y: 6 },
                animate: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.28, ease: MESSAGE_EASE },
                },
                exit: {
                  opacity: 0,
                  y: 6,
                  transition: { duration: 0.28, ease: MESSAGE_EASE },
                },
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.p>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.p
        key={message}
        {...MESSAGE_ANIMATION[animation]}
        className={className}
        style={animation === 'blur' ? { willChange: 'filter' } : undefined}
      >
        {message}
      </motion.p>
    </AnimatePresence>
  );
};

const ANIMATION_PREVIEWS: {
  label: string;
  animation: SaveLoadingMessageAnimation;
}[] = [
  { label: '1. 페이드 + 슬라이드업', animation: 'slide' },
];

const SaveModalAnimationPreview = ({
  label,
  message,
  animation,
}: {
  label: string;
  message: string;
  animation: SaveLoadingMessageAnimation;
}) => (
  <div className="flex flex-col items-center gap-3">
    <span className="text-xs font-semibold text-[#64748B]">{label}</span>
    <div className="flex h-[249px] w-[335px] flex-col items-center justify-center rounded-xl bg-white p-5 text-center shadow-[0_24px_60px_-20px_rgb(0_0_0_/_12%),0_8px_24px_-8px_rgb(0_0_0_/_18%)]">
      <div className="-mt-2 flex flex-col items-center gap-3">
        <SaveLottie variant="loading" loop />
        <SaveLoadingMessagePreview message={message} animation={animation} />
      </div>
    </div>
  </div>
);

export default function SaveModalTestPage() {
  const [mode, setMode] = useState<SaveModalMode>('loading');
  const [messageIndex, setMessageIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [previewIntervalMs, setPreviewIntervalMs] = useState<number>(
    DEFAULT_PREVIEW_INTERVAL_MS
  );

  useEffect(() => {
    if (mode !== 'loading') return;

    const intervalId = window.setInterval(() => {
      setMessageIndex(
        currentIndex => (currentIndex + 1) % SAVE_PROGRESS_MESSAGES.length
      );
    }, previewIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [isOpen, mode, previewIntervalMs]);

  const openMode = (nextMode: SaveModalMode) => {
    setMode(nextMode);
    if (nextMode === 'loading') {
      setMessageIndex(0);
    }
    setIsOpen(true);
  };

  const retry = () => {
    setMode('loading');
    setMessageIndex(0);
    setIsOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#F4F6F8] text-[#111827]">
      <div className="fixed top-4 left-1/2 z-[110] flex w-[calc(100%-32px)] max-w-[720px] -translate-x-1/2 items-center justify-between rounded-lg border border-black/10 bg-white/92 px-3 py-2 shadow-[0_12px_36px_-20px_rgb(0_0_0_/_40%)] backdrop-blur">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`${MODE_BUTTON_CLASS} ${
              mode === 'loading'
                ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                : 'border-black/10 bg-white text-[#374151] hover:bg-black/5'
            }`}
            onClick={() => openMode('loading')}
          >
            <LoaderCircle size={16} />
            로딩
          </button>
          <button
            type="button"
            className={`${MODE_BUTTON_CLASS} ${
              mode === 'success'
                ? 'border-[#16A34A] bg-[#ECFDF3] text-[#15803D]'
                : 'border-black/10 bg-white text-[#374151] hover:bg-black/5'
            }`}
            onClick={() => openMode('success')}
          >
            <Check size={16} />
            성공
          </button>
          <button
            type="button"
            className={`${MODE_BUTTON_CLASS} ${
              mode === 'fail'
                ? 'border-[#DC2626] bg-[#FEF2F2] text-[#B91C1C]'
                : 'border-black/10 bg-white text-[#374151] hover:bg-black/5'
            }`}
            onClick={() => openMode('fail')}
          >
            <XCircle size={16} />
            실패
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-medium text-[#6B7280] sm:inline">
            {MODE_LABEL[mode]}
          </span>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 bg-white text-[#374151] hover:bg-black/5"
            aria-label="모달 다시 열기"
            onClick={() => setIsOpen(true)}
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 bg-white text-[#374151] hover:bg-black/5"
            aria-label="모달 닫기"
            onClick={() => setIsOpen(false)}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <section className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col items-center justify-center px-6 pt-24">
        <div className="w-full border-y border-black/10 py-12">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-6 text-center">
            <div className="flex gap-2">
              <button
                type="button"
                className="h-10 rounded-md bg-black px-4 text-sm font-semibold text-white hover:bg-black/80"
                onClick={() => setIsOpen(true)}
              >
                모달 열기
              </button>
              <button
                type="button"
                className="h-10 rounded-md border border-black/10 bg-white px-4 text-sm font-semibold text-[#374151] hover:bg-black/5"
                onClick={retry}
              >
                재시도 상태
              </button>
            </div>

            <div className="flex items-center gap-2">
              {SAVE_PROGRESS_MESSAGES.map((message, index) => (
                <span
                  key={message}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    messageIndex === index
                      ? 'w-7 bg-[#2563EB]'
                      : 'w-2.5 bg-[#CBD5E1]'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#64748B]">
                전환 속도
              </span>
              {PREVIEW_INTERVAL_OPTIONS.map(ms => (
                <button
                  key={ms}
                  type="button"
                  className={`${INTERVAL_BUTTON_CLASS} ${
                    previewIntervalMs === ms
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                      : 'border-black/10 bg-white text-[#374151] hover:bg-black/5'
                  }`}
                  onClick={() => setPreviewIntervalMs(ms)}
                >
                  {ms / 1000}초
                </button>
              ))}
            </div>

            <div className="grid w-full grid-cols-1 justify-items-center gap-5 md:grid-cols-2 xl:grid-cols-4">
              {ANIMATION_PREVIEWS.map(({ label, animation }, index) => (
                <SaveModalAnimationPreview
                  key={animation}
                  label={label}
                  animation={animation}
                  message={
                    SAVE_PROGRESS_MESSAGES[
                      (messageIndex + index) % SAVE_PROGRESS_MESSAGES.length
                    ]
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {isOpen && (
        <SaveModal
          isLoading={mode === 'loading'}
          isFail={mode === 'fail'}
          pendingInvitation={null}
          loadingMessage={SAVE_PROGRESS_MESSAGES[messageIndex]}
          loadingAnimation="slide"
          retry={retry}
          onClose={() => setIsOpen(false)}
        />
      )}
    </main>
  );
}
