'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

function HomeButton() {
  const pathname = usePathname(); // "/products/123"

  const handleHomeClick = (e: React.MouseEvent) => {
    if (pathname === '/editor') {
      const leave = window.confirm(
        '수정된 내용이 저장되지 않을 수 있습니다.\n정말 나가시겠습니까?'
      );
      if (!leave) e.preventDefault();
    }
  };

  return (
    <Link
      href="/"
      className="font-semibold text-xl text-black"
      onClick={handleHomeClick}
    >
      Invia
    </Link>
  );
}

export default HomeButton;
