'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import InviaLogo from '@/shared/assets/logo/invia-logo.svg';
import { useConfirm } from '@/shared/hooks/useConfirm';

function HomeButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { confirm } = useConfirm();

  const handleHomeClick = async (e: React.MouseEvent) => {
    if (pathname.startsWith('/editor')) {
      // 1. 비동기 작업 전에 즉시 기본 브라우저/Next.js 이동 방지
      e.preventDefault();

      // 2. 모달 승인 대기
      const isConfirm = await confirm({
        message:
          '수정된 내용이 저장되지 않을 수 있습니다.\n정말 나가시겠습니까?',
        variant: 'white',
        yPosition: 'center',
      });

      // 3. 승인 시 수동으로 이동 처리
      if (isConfirm) {
        router.push('/');
      }
    }
  };

  return (
    <Link
      href="/"
      className="flex h-full max-h-full items-center px-6"
      onClick={handleHomeClick}
      aria-label="Invia 홈으로 이동"
    >
      <InviaLogo
        className="block h-[23px] w-[92px] shrink-0"
        aria-label="Invia"
        role="img"
      />
    </Link>
  );
}

export default HomeButton;
