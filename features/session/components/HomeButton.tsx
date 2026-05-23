'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import inviaLogo from '@/shared/assets/logo/Invia-logo.png';
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
      <Image
        src={inviaLogo}
        alt="Invia"
        width={92}
        height={18}
        className="h-[18px] w-auto"
        priority
      />
    </Link>
  );
}

export default HomeButton;
