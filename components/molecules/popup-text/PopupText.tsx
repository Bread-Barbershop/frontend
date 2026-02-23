'use client';

import { cn } from '@/shared/utils/cn';

interface PopupTextProps {
  text: string;
  className?: string;
}

export const PopupText = ({ text, className }: PopupTextProps) => {
  return (
    <div
      className={cn(
        'h-18.5 overflow-hidden rounded-md bg-[`#F5F8FF`] p-4 text-sm',
        className
      )}
    >
      <p className="line-clamp-2">{text}</p>
    </div>
  );
};
