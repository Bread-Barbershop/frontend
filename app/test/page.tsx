'use client';

import { Button } from '@/components/atoms/button';
import KakaoIcon from '@/shared/assets/icons/kakao.svg';

import { openAccountApp } from '../api/account/openAccountApp';

export default function Page() {
  const handleCopyAccount = async (bank: string, account: string) => {
    await navigator.clipboard.writeText(`${bank} ${account}`);
  };

  const handleOpenKakao = () => {
    openAccountApp();
  };

  return (
    <Button
      type="button"
      variant="borderless"
      className="w-10"
      onClick={async () => {
        // async 추가
        try {
          // 1. 복사가 완료될 때까지 기다림
          await handleCopyAccount('국민', '1234567890');

          // 2. 복사 성공 후 앱 실행
          handleOpenKakao();
        } catch (error) {
          console.error('복사 실패:', error);
        }
      }}
    >
      <KakaoIcon />
    </Button>
  );
}
