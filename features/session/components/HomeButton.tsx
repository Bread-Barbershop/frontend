'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import InviaLogo from '@/shared/assets/logo/invia-logo.svg';
import { useConfirm } from '@/shared/hooks/useConfirm';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';

function HomeButton({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { confirm } = useConfirm();
  const isDirty = useEditorStore(state => state.isDirty);

  const handleHomeClick = async (e: React.MouseEvent) => {
    if (pathname.startsWith('/editor') && isDirty) {
      e.preventDefault();

      const isConfirm = await confirm({
        message:
          '수정된 내용이 저장되지 않을 수 있습니다.\n정말 나가시겠습니까?',
        variant: 'white',
        yPosition: 'center',
      });

      if (isConfirm) {
        router.push('/');
      }
    }
  };

  return (
    <Link
      href="/"
      className={cn('flex h-full max-h-full items-center px-6', className)}
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
