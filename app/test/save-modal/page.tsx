'use client';

import { Check, LoaderCircle, RotateCcw, X, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const SaveModal = dynamic(
  () =>
    import('@/widgets/editor/preview/components/SaveModal').then(
      module => module.SaveModal
    ),
  { ssr: false }
);

type SaveModalMode = 'loading' | 'success' | 'fail';

const MODE_LABEL: Record<SaveModalMode, string> = {
  loading: '로딩',
  success: '성공',
  fail: '실패',
};

const MODE_BUTTON_CLASS =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-semibold transition-colors';

export default function SaveModalTestPage() {
  const [mode, setMode] = useState<SaveModalMode>('loading');
  const [isOpen, setIsOpen] = useState(true);

  const openMode = (nextMode: SaveModalMode) => {
    setMode(nextMode);
    setIsOpen(true);
  };

  const retry = () => {
    setMode('loading');
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

      <section className="mx-auto flex min-h-screen w-full max-w-[980px] flex-col items-center justify-center px-6 pt-24">
        <div className="w-full border-y border-black/10 py-12">
          <div className="mx-auto flex max-w-[560px] flex-col items-center gap-6 text-center">
            <div className="flex h-[249px] w-[335px] items-center justify-center rounded-xl border border-dashed border-black/20 bg-white/60 text-sm font-semibold text-[#6B7280]">
              세이브 모달 미리보기
            </div>
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
          </div>
        </div>
      </section>

      {isOpen && (
        <SaveModal
          isLoading={mode === 'loading'}
          isFail={mode === 'fail'}
          retry={retry}
          onClose={() => setIsOpen(false)}
        />
      )}
    </main>
  );
}
