'use client';

import Script from 'next/script';

interface Props {
  onReady?: () => void;
}

export function NaverMapScript({ onReady }: Props) {
  return (
    <Script
      id="naver-map-sdk"
      strategy="afterInteractive"
      src={`https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_MAP_KEY}&submodules=geocoder`}
      onReady={onReady}
    />
  );
}
