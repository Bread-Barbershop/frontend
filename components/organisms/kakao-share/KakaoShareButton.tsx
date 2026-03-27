'use client';

import React, { useState, useEffect } from 'react';

interface KakaoShareButtonProps {
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl: string;
  buttonText?: string;
}

declare global {
  interface Window {
    Kakao: any;
  }
}

export const KakaoShareButton = ({
  title,
  description,
  imageUrl,
  linkUrl,
  buttonText = '초대장 보기',
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
    if (!window.Kakao) {
      alert('카카오 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    initKakao();

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: title,
        description: description,
        imageUrl:
          imageUrl ||
          'https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png',
        link: {
          mobileWebUrl: linkUrl,
          webUrl: linkUrl,
        },
      },
      buttons: [
        {
          title: buttonText,
          link: {
            mobileWebUrl: linkUrl,
            webUrl: linkUrl,
          },
        },
      ],
    });
  };

  return (
    <button
      onClick={handleShare}
      disabled={!isLoaded}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors shadow-sm ${
        isLoaded
          ? 'bg-[#FAE100] text-[#3C1E1E] hover:bg-[#F7E600]'
          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
      }`}
    >
      <div className="w-5 h-5">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2C6.48,2,2,5.48,2,9.75c0,2.6,1.7,4.88,4.28,6.23c-0.12,0.44-0.44,1.61-0.5,1.85c-0.08,0.31,0.1,0.31,0.22,0.24 c0.12-0.07,1.96-1.33,2.75-1.89c0.41,0.06,0.83,0.09,1.25,0.09c5.52,0,10-3.48,10-7.75S17.52,2,12,2z" />
        </svg>
      </div>
      {isLoaded ? '카카오톡 공유하기' : '카카오 SDK 로드 중...'}
    </button>
  );
};
