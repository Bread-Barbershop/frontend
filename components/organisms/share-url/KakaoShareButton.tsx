'use client';

import { useState, useEffect } from 'react';

import { DEFAULT_IMAGE_URL } from '@/app/guest/[id]/constants/constant';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
} from '@/shared/utils/shareUrlDefaults';

interface Props {
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl: string;
  showLocationButton?: boolean;
  locationInfo?: {
    lat: number;
    lng: number;
    placeName: string;
  };
}

export const KakaoShareButton = ({
  title,
  description,
  imageUrl,
  linkUrl,
  showLocationButton = false,
  locationInfo,
}: Props) => {
  const [isLoaded, setIsLoaded] = useState(
    () => typeof window !== 'undefined' && !!window.Kakao
  );

  // 카카오 SDK가 window 객체에 정상적으로 로드되는지 파악하는 로직
  // 100ms 마다 확인하고, 5초 동안 로드되지 않으면 멈춤 (폴링)
  useEffect(() => {
    if (isLoaded) return;

    const interval = setInterval(() => {
      if (window.Kakao) {
        setIsLoaded(true);
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isLoaded]);

  const handleShare = () => {
    if (typeof window === 'undefined' || !window.Kakao) {
      alert('카카오 SDK 스크립트가 아직 로드되지 않았습니다.');
      return;
    }

    // 카카오 SDK 초기화
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
    }

    const safeLinkUrl = linkUrl || window.location.href;

    const messageButtons = [
      {
        title: '보러가기',
        link: {
          mobileWebUrl: safeLinkUrl,
          webUrl: safeLinkUrl,
        },
      },
    ];

    if (showLocationButton && locationInfo) {
      const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(
        locationInfo.placeName
      )},${locationInfo.lat},${locationInfo.lng}`;

      const bypassUrl = `${window.location.origin}/api/map-redirect?url=${encodeURIComponent(kakaoMapUrl)}`;

      messageButtons.push({
        title: '위치보기',
        link: {
          mobileWebUrl: bypassUrl,
          webUrl: bypassUrl,
        },
      });
    }

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: title || DEFAULT_TITLE,
        description: description || DEFAULT_DESCRIPTION,
        imageUrl: imageUrl || `${window.location.origin}${DEFAULT_IMAGE_URL}`,
        link: {
          mobileWebUrl: safeLinkUrl,
          webUrl: safeLinkUrl,
        },
      },
      buttons: messageButtons,
    });
  };

  return (
    <button
      onClick={e => {
        e.preventDefault();
        handleShare();
      }}
      className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-black/85 font-semibold py-3.5 px-4 rounded-xl hover:bg-[#FADA0A] transition-colors cursor-pointer"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" className="fill-black/85">
        <path d="M12 3c-5.523 0-10 3.513-10 7.846 0 2.768 1.764 5.187 4.417 6.517-.215.7-.783 2.65-.898 3.12 0 0-.018.083.037.118.056.036.126.022.126.022 1.01-.143 3.32-1.077 4.608-1.745 1.144.17 2.336.257 3.553.257 5.522 0 10-3.514 10-7.843S17.522 3 12 3z" />
      </svg>
      카카오톡 공유하기
    </button>
  );
};
