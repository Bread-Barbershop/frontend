'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { Fragment } from 'react/jsx-runtime';

import { useConfirm } from '@/shared/hooks/useConfirm';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { DASHBOARD_SHELL_NAV_MENU } from '../config/dashboardShell.config';

const HEADER_NAV_LINK_CLASS =
  'flex items-center border-b border-transparent px-2 py-[6.5px] text-[16px] font-semibold text-text-plain transition-colors hover:border-black hover:text-black';

function NavMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { confirm } = useConfirm();
  const isDirty = useEditorStore(state => state.isDirty);

  const handleNavMenuClick = async (e: React.MouseEvent, href: string) => {
    if (pathname.startsWith('/editor') && isDirty) {
      e.preventDefault();
      const isConfirm = await confirm({
        message:
          '수정된 내용이 저장되지 않을 수 있습니다.\n정말 나가시겠습니까?',
        variant: 'white',
        yPosition: 'center',
      });
      if (!isConfirm) {
        e.preventDefault();
        return;
      }
      router.push(href);
    }
  };
  return (
    <Fragment>
      {DASHBOARD_SHELL_NAV_MENU.map(menu => (
        <Link
          key={`${menu.title}-${menu.href}`}
          href={menu.href}
          className={HEADER_NAV_LINK_CLASS}
          onClick={event => handleNavMenuClick(event, menu.href)}
        >
          {menu.title}
        </Link>
      ))}
    </Fragment>
  );
}
export default NavMenu;
