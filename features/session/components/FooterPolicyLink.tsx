'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useConfirm } from '@/shared/hooks/useConfirm';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import type { MouseEvent } from 'react';

type FooterPolicyLinkProps = {
  className?: string;
};

function FooterPolicyLink({ className }: FooterPolicyLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { confirm } = useConfirm();
  const isDirty = useEditorStore(state => state.isDirty);

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    if (!pathname.startsWith('/editor') || !isDirty) return;

    e.preventDefault();

    const isConfirm = await confirm({
      message:
        '수정된 내용이 저장되지 않을 수 있습니다.\n정말 나가시겠습니까?',
      variant: 'white',
      yPosition: 'center',
    });

    if (isConfirm) {
      router.push('/policy');
    }
  };

  return (
    <Link href="/policy" className={className} onClick={handleClick}>
      개인정보 처리방침
    </Link>
  );
}

export default FooterPolicyLink;
