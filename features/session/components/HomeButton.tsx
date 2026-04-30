'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import inviaLogo from '@/shared/assets/logo/Invia-logo.png';

function HomeButton() {
  const pathname = usePathname();

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname.startsWith('/editor')) {
      const leave = window.confirm(
        '수정된 내용이 저장되지 않을 수 있습니다.\n정말 나가시겠습니까?'
      );
      if (!leave) e.preventDefault();
    }
  };

  return (
    <Link
      href="/"
      className="flex items-center"
      onClick={handleHomeClick}
      aria-label="Invia 홈으로 이동"
    >
      <Image src={inviaLogo} alt="Invia" width={92} height={18} priority />
    </Link>
  );
}

export default HomeButton;
