'use client';

import { useEffect, useState } from 'react';

export function BgmPlaybackHint({ isDismissed }: { isDismissed: boolean }) {
  const [isMounted, setIsMounted] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setIsVisible(true), 50);
    const fadeTimer = window.setTimeout(() => setIsVisible(false), 4300);
    const unmountTimer = window.setTimeout(() => setIsMounted(false), 5000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className={`pointer-events-none absolute right-14 top-4 z-50 flex h-8 items-center rounded-full bg-black/55 px-3 text-xs font-medium text-white shadow-sm backdrop-blur-md transition-opacity duration-700 ${
        isVisible && !isDismissed ? 'opacity-100' : 'opacity-0'
      }`}
    >
      클릭하면 음악이 재생됩니다
    </div>
  );
}
