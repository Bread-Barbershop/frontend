import { Suspense, type CSSProperties } from 'react';

import DashboardShell from '@/features/session/components/DashboardShell';
import homeBackgroundImage from '@/shared/assets/images/home/home-background.png';

import GalleryCategoryTabs from './components/GalleryCategoryTabs';
import GalleryTemplateGrid from './components/GalleryTemplateGrid';
import GalleryTitleBox from './components/GalleryTitleBox';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '초대장 갤러리',
  description: '초대장 디자인을 미리 보고 원하는 템플릿으로 바로 시작하세요.',
  alternates: {
    canonical: '/gallery',
  },
};

const PAGE_PADDING_X = 40;
const STICKY_CATEGORY_TOP = 'max(-154px, -20vh)';
const CURTAIN_TOP_EXTENSION = 240;
const CURTAIN_BOTTOM_EXTENSION = 24;

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
      <div className="fixed inset-x-0 bottom-10 top-14 overflow-y-auto overflow-x-hidden px-10 pb-24 pt-[20vh] motion-safe:scroll-smooth [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20 [&::-webkit-scrollbar-track]:bg-transparent">
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
            <Suspense fallback={null}>
              <GalleryCategoryTabs />
            </Suspense>
          </div>
        </section>

        <Suspense fallback={null}>
          <GalleryTemplateGrid />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
