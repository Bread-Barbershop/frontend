'use client';

import { useEffect } from 'react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';
import type { buildShowcaseInvitation } from '@/shared/data/buildShowcaseInvitation';

export default function ShowcaseDocument(
  props: ReturnType<typeof buildShowcaseInvitation>
) {
  useEffect(() => {
    // iframe 내부에 포커스가 있어도 미리보기를 Escape로 닫을 수 있다.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && window.parent !== window) {
        window.parent.postMessage(
          { type: 'invia:close-showcase' },
          window.location.origin
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <GuestRenderer {...props} isGuestPage />;
}
