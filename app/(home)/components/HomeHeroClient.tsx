'use client';

import { useState } from 'react';

import Cta from '@/app/(home)/components/Cta';
import Showcase from '@/app/(home)/components/Showcase';

type HomeHeroClientProps = {
  initialIsLoggedIn: boolean;
};

function HomeHeroClient({ initialIsLoggedIn }: HomeHeroClientProps) {
  const [isShowcaseHovered, setIsShowcaseHovered] = useState(false);

  return (
    <section className="relative h-full min-h-0 flex justify-center items-end">
      <Cta
        initialIsLoggedIn={initialIsLoggedIn}
        isShowcaseHovered={isShowcaseHovered}
      />
      <Showcase onHoverChange={setIsShowcaseHovered} />
    </section>
  );
}

export default HomeHeroClient;
