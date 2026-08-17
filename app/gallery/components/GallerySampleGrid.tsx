'use client';

import { useState } from 'react';

import PhonePreviewFrame from '@/app/dashboard/components/preview/PhonePreviewFrame';

const CARD_WIDTH = 240;
const CARD_HEIGHT = 520;
const MAX_GRID_COLUMNS = 7;
const GRID_COLUMN_GAP = 26;
const GRID_ROW_GAP = 40;
const PLACEHOLDER_CARD_COUNT = 21;
const CARD_PADDING_X = 20;
const CARD_PADDING_Y = 32;
const ACTION_BUTTON_SHADOW =
  '0 8px 24px 0 rgb(0 0 0 / 6%), 0 2px 10px 0 rgb(0 0 0 / 8%)';

const gridWidth =
  CARD_WIDTH * MAX_GRID_COLUMNS + GRID_COLUMN_GAP * (MAX_GRID_COLUMNS - 1);

const placeholderCards = Array.from(
  { length: PLACEHOLDER_CARD_COUNT },
  (_, index) => index + 1
);

function GallerySampleGrid({ pagePaddingX }: { pagePaddingX: number }) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [previewCard, setPreviewCard] = useState<number | null>(null);

  const selectCard = (cardNumber: number, element: HTMLElement) => {
    setSelectedCard(cardNumber);
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  };

  return (
    <>
      <section
        className="mt-10 grid justify-start"
        style={{
          width: `min(${gridWidth}px, calc(100vw - ${pagePaddingX * 2}px))`,
          gridTemplateColumns: `repeat(auto-fit, ${CARD_WIDTH}px)`,
          columnGap: GRID_COLUMN_GAP,
          rowGap: GRID_ROW_GAP,
        }}
      >
        {placeholderCards.map(cardNumber => (
          <article
            key={cardNumber}
            role="button"
            tabIndex={0}
            aria-pressed={selectedCard === cardNumber}
            className="relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/35 bg-white/72 shadow-edit backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-black/50"
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
            }}
            onClick={event => selectCard(cardNumber, event.currentTarget)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectCard(cardNumber, event.currentTarget);
              }
            }}
          >
            <div className="flex flex-1 items-center justify-center bg-[#F5F1EA] text-[15px] font-semibold text-text-secondary">
              Sample {cardNumber}
            </div>
            <div className="border-t border-black/5 bg-white px-4 py-3">
              <p className="text-[15px] font-semibold text-text-plain">
                샘플 초대장
              </p>
              <p className="mt-1 text-[13px] text-text-secondary">
                상세 UI는 다음 단계에서 조정
              </p>
            </div>

            {selectedCard === cardNumber && (
              <div
                className="absolute inset-0 flex flex-col justify-end bg-black/16"
                style={{
                  padding: `${CARD_PADDING_Y}px ${CARD_PADDING_X}px`,
                }}
              >
                <div className="flex flex-col gap-2">
                  <GalleryCardActionButton
                    variant="dark"
                    onClick={() => setPreviewCard(cardNumber)}
                  >
                    디자인 미리보기
                  </GalleryCardActionButton>
                  <GalleryCardActionButton variant="light">
                    이 디자인으로 만들기
                  </GalleryCardActionButton>
                </div>
              </div>
            )}
          </article>
        ))}
      </section>

      {previewCard && (
        <GalleryPreviewModal onClose={() => setPreviewCard(null)} />
      )}
    </>
  );
}

function GalleryCardActionButton({
  children,
  onClick,
  variant,
}: {
  children: string;
  onClick?: () => void;
  variant: 'dark' | 'light';
}) {
  const isDark = variant === 'dark';

  return (
    <button
      type="button"
      className={`grid h-11 cursor-pointer grid-cols-[28px_1fr_28px] items-center rounded-lg px-2 py-2 text-[14px] font-semibold transition-colors ${
        isDark
          ? 'bg-[#121212] text-white hover:bg-[#202020]'
          : 'bg-white text-[#121212] hover:bg-[#FAFAFB]'
      }`}
      style={{ boxShadow: ACTION_BUTTON_SHADOW }}
      onClick={event => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      <span
        aria-hidden="true"
        className="flex size-5 items-center justify-center rounded-full border border-current"
      >
        <span className="size-1.5 rounded-full bg-current" />
      </span>
      <span>{children}</span>
      <span aria-hidden="true" />
    </button>
  );
}

function GalleryPreviewModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/58 px-6 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="디자인 미리보기"
      onClick={onClose}
    >
      <div onClick={event => event.stopPropagation()}>
        <PhonePreviewFrame folderId="">
          <div className="flex min-h-full flex-col items-center justify-center px-8 text-center">
            <p className="font-pretendard text-[15px] font-semibold leading-[22px] text-text-plain">
              미리보기 영역
            </p>
          </div>
        </PhonePreviewFrame>
      </div>
    </div>
  );
}

export default GallerySampleGrid;
