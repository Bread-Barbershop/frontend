'use client';

import Script from 'next/script';
import { useEffect } from 'react';

interface Props {
  onReady?: () => void;
}

const NAVER_MAP_READY_EVENT = 'naver-map-ready';

const isNaverMapReady = () =>
  typeof window !== 'undefined' && Boolean(window.naver?.maps);

export function NaverMapScript({ onReady }: Props) {
  useEffect(() => {
    if (!onReady) return;

    if (isNaverMapReady()) {
      onReady();
      return;
    }

    const handleReady = () => {
      onReady();
    };

    window.addEventListener(NAVER_MAP_READY_EVENT, handleReady);

    return () => {
      window.removeEventListener(NAVER_MAP_READY_EVENT, handleReady);
    };
  }, [onReady]);

  const handleReady = () => {
    window.dispatchEvent(new Event(NAVER_MAP_READY_EVENT));
  };

  return (
    <Script
      id="naver-map-sdk"
      strategy="afterInteractive"
      src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_MAP_KEY}&submodules=geocoder`}
      onReady={handleReady}
    />
  );
}
