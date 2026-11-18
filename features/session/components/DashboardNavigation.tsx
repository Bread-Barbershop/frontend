'use client';

import { Menu } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/shared/utils/cn';

import HeaderAuthControl from './HeaderAuthControl';
import NavMenu from './NavMenu';

type DashboardNavigationProps = {
  initialIsLoggedIn: boolean;
  responsive: boolean;
};

export default function DashboardNavigation({
  initialIsLoggedIn,
  responsive,
}: DashboardNavigationProps) {
  const navId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const wideViewport = window.matchMedia('(min-width: 64rem)');
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };
    const dismissOnOutsidePress = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !wrapperRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    wideViewport.addEventListener('change', closeOnDesktop);
    document.addEventListener('pointerdown', dismissOnOutsidePress);

    return () => {
      wideViewport.removeEventListener('change', closeOnDesktop);
      document.removeEventListener('pointerdown', dismissOnOutsidePress);
    };
  }, [isOpen]);

  const closeAndFocusToggle = () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <div
      ref={wrapperRef}
      className="flex h-full items-center"
      onBlur={event => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          setIsOpen(false);
        }
      }}
      onKeyDown={event => {
        if (!isOpen || event.key !== 'Escape') return;
        if (
          event.target instanceof Element &&
          event.target.closest('dialog, [role="dialog"]')
        )
          return;

        event.preventDefault();
        closeAndFocusToggle();
      }}
    >
      {responsive && (
        <button
          ref={toggleRef}
          type="button"
          aria-label="메뉴"
          aria-controls={navId}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(open => !open)}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-plain hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-black lg:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      )}
      <nav
        id={navId}
        aria-label="주 메뉴"
        className={cn(
          'flex h-full items-center gap-6',
          responsive &&
            'max-lg:absolute max-lg:inset-x-4 max-lg:top-full max-lg:h-auto max-lg:max-h-[calc(100dvh-4.5rem)] max-lg:flex-col max-lg:items-stretch max-lg:gap-1 max-lg:overflow-y-auto max-lg:rounded-xl max-lg:bg-white max-lg:p-2 max-lg:shadow-lg max-lg:[&>:is(a,button)]:min-h-11',
          responsive && !isOpen && 'max-lg:hidden'
        )}
      >
        <NavMenu onNavigate={isOpen ? closeAndFocusToggle : undefined} />
        <HeaderAuthControl initialIsLoggedIn={initialIsLoggedIn} />
      </nav>
    </div>
  );
}
