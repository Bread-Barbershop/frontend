'use client';

import React, { useState, useEffect } from 'react';

interface KakaoShareButtonProps {
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl: string;
  buttonText?: string;
  showLocationButton?: boolean;
  locationInfo?: {
    lat: number;
    lng: number;
    placeName: string;
  };
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Kakao: any;
  }
}

export const KakaoShareButton = ({
  title,
  description,
  imageUrl,
  linkUrl,
  buttonText = '청첩장 보기',
  showLocationButton = false,
  locationInfo,
}: KakaoShareButtonProps) => {
  const [isLoaded, setIsLoaded] = useState(() => 
    typeof window !== 'undefined' && !!window.Kakao
  );

  useEffect(() => {
    if (isLoaded) return;

    // 로드 대기 (최대 5초)
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

  const initKakao = () => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JS_KEY);
    }
  };

  const handleShare = () => {
    if (typeof window === 'undefined' || !window.Kakao) {
      alert('카카오 SDK 스크립트가 아직 로드되지 않았습니다.');
      return;
    }

    initKakao();

    // 동적 버튼 구성부 (카카오 예제 형태 차용)
    // 카카오 SDK는 웹링크가 빈 값이면 버튼 자체를 날려버립니다.
    const safeLinkUrl = linkUrl || window.location.href;

    const messageButtons = [
      {
        title: buttonText || '청첩장 보기', // 빈 문자열("")일 경우에도 기본값을 사용하도록 폴백
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
        title: '위치 보기',
        link: {
          mobileWebUrl: bypassUrl,
          webUrl: bypassUrl,
        },
      });
    }

    // 카카오 제공 예시와 동일한 API 스펙
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: title || '초대장',
        description: description || '소중한 분들을 초대합니다.',
        imageUrl:
          imageUrl ||
          'https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png',
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
      id="kakaotalk-sharing-btn"
      onClick={(e) => {
        e.preventDefault();
        handleShare();
      }}
      className="inline-block hover:opacity-80 transition-opacity"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png"
        alt="카카오톡 공유 보내기 버튼"
        className="w-full max-w-[200px] object-contain"
      />
    </button>
  );
};
