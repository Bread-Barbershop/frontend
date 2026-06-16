import { getAuthSession } from '@/app/api/auth/_lib/getAuthSession';
import CarouselBase from '@/app/dashboard/components/carousel/CarouselBase';

import Cta from './components/Cta';
import { getShuffledShowcaseItems } from './components/showcaseItems';

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
    <>
      <div
        className="fixed z-10"
        style={{ left: '2.5rem', top: '30%' }}
      >
        <Cta initialIsLoggedIn={session.isLoggedIn} />
      </div>
      <CarouselBase items={showcaseItems} startIndex={0} />
    </>
  );
}
