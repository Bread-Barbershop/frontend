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
        'flex h-18.5 items-center overflow-hidden rounded-md bg-[#F5F8FF] p-4 text-sm',
        className
      )}
    >
      <p className="line-clamp-2 overflow-hidden">{text}</p>
    </div>
  );
};
