import DashboardShell from '@/features/session/components/DashboardShell';
import homeBackgroundImage from '@/shared/assets/images/home/home-background.png';

import GalleryCategoryTabs from './components/GalleryCategoryTabs';
import GalleryTitleBox from './components/GalleryTitleBox';

import type { Metadata } from 'next';
import type { CSSProperties } from 'react';

export const metadata: Metadata = {
  title: '초대장 갤러리',
  description: '완성된 초대장 샘플을 둘러보고 에디터에서 바로 수정하세요.',
  alternates: {
    canonical: '/gallery',
  },
};

const CARD_WIDTH = 240;
const CARD_HEIGHT = 520;
const MAX_GRID_COLUMNS = 7;
const GRID_COLUMN_GAP = 26;
const GRID_ROW_GAP = 40;
const PAGE_PADDING_X = 40;
const STICKY_CATEGORY_TOP = '-154px';
const CURTAIN_TOP_EXTENSION = 240;
const CURTAIN_BOTTOM_EXTENSION = 24;
const PLACEHOLDER_CARD_COUNT = 21;

const gridWidth =
  CARD_WIDTH * MAX_GRID_COLUMNS + GRID_COLUMN_GAP * (MAX_GRID_COLUMNS - 1);

const placeholderCards = Array.from(
  { length: PLACEHOLDER_CARD_COUNT },
  (_, index) => index + 1
);

const curtainStyle: CSSProperties = {
  backgroundAttachment: 'fixed',
  backgroundImage: `url(${homeBackgroundImage.src})`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function GalleryPage() {
  return (
    <DashboardShell>
      <div className="fixed inset-x-0 bottom-10 top-14 overflow-y-auto overflow-x-hidden px-10 pb-24 pt-[20vh] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20 [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="relative z-30 flex justify-start">
          <GalleryTitleBox />
        </div>

        <section
          className="sticky z-20 mt-6 flex justify-start bg-transparent"
          style={{ top: STICKY_CATEGORY_TOP }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-0"
            style={{
              ...curtainStyle,
              left: -PAGE_PADDING_X,
              right: -PAGE_PADDING_X,
              top: -CURTAIN_TOP_EXTENSION,
              bottom: -CURTAIN_BOTTOM_EXTENSION,
            }}
          />
          <div className="relative z-10">
            <GalleryCategoryTabs />
          </div>
        </section>

        <section
          className="mt-10 grid justify-start"
          style={{
            width: `min(${gridWidth}px, calc(100vw - ${PAGE_PADDING_X * 2}px))`,
            gridTemplateColumns: `repeat(auto-fit, ${CARD_WIDTH}px)`,
            columnGap: GRID_COLUMN_GAP,
            rowGap: GRID_ROW_GAP,
          }}
        >
          {placeholderCards.map(cardNumber => (
            <article
              key={cardNumber}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/35 bg-white/72 shadow-edit backdrop-blur-sm"
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
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
            </article>
          ))}
        </section>
      </div>
    </DashboardShell>
  );
}
