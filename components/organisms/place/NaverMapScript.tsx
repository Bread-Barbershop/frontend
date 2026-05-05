'use client';

import Script from 'next/script';
import { useEffect } from 'react';

interface Props {
  onReady?: () => void;
}

function isNaverMapReady() {
  return typeof window !== 'undefined' && Boolean(window.naver?.maps);
}

export function NaverMapScript({ onReady }: Props) {
  useEffect(() => {
    if (isNaverMapReady()) {
      onReady?.();
    }
  }, [onReady]);

  return (
    <Script
      id="naver-map-sdk"
      strategy="afterInteractive"
      src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_MAP_KEY}&submodules=geocoder`}
      onLoad={onReady}
      onReady={onReady}
    />
  );
}
