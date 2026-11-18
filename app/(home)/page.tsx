import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';
import DashboardShell from '@/features/session/components/DashboardShell';
import { DESKTOP_CONTENT_MIN_WIDTH } from '@/shared/config/layout';

import Cta from './components/Cta';
import HomeShowcaseCarousel from './components/HomeShowcaseCarousel';
import MobileHomeHero from './components/MobileHomeHero';
import { getShuffledShowcaseItems } from './components/showcaseItems';
import ShowcasePreviewProvider from './components/ShowcasePreviewProvider';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default async function Home() {
  const session = await getAuthSession();
  const showcaseItems = getShuffledShowcaseItems();

  return (
    <ShowcasePreviewProvider>
      <div className="min-[1340px]:hidden" data-home-variant="mobile">
        <MobileHomeHero />
      </div>

      <div className="hidden min-[1340px]:block" data-home-variant="desktop">
        <DashboardShell minimumWidth={DESKTOP_CONTENT_MIN_WIDTH}>
          <div className="fixed z-10" style={{ left: '2.5rem', top: '30%' }}>
            <Cta initialIsLoggedIn={session.isLoggedIn} />
          </div>
          <HomeShowcaseCarousel items={showcaseItems} />
        </DashboardShell>
      </div>
    </ShowcasePreviewProvider>
  );
}
