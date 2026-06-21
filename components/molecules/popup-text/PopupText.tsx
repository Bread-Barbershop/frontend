'use client';

import { cn } from '@/shared/utils/cn';

interface PopupTextProps {
  text: string;
  className?: string;
  twoLineEllipsis?: boolean;
}

export const PopupText = ({
  text,
  className,
  twoLineEllipsis = false,
}: PopupTextProps) => {
  return (
    <div
      className={cn(
        'flex h-9 items-center overflow-hidden rounded-xl bg-bg-sub px-4 py-0 text-sm',
        className
      )}
    >
      <p
        className={cn(
          twoLineEllipsis
            ? 'line-clamp-2 overflow-hidden whitespace-normal'
            : 'truncate whitespace-nowrap'
        )}
      >
        {text}
      </p>
    </div>
  );
};
