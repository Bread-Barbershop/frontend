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
        'rounded-md bg-[#F5F8FF] text-sm p-1',
        className
      )}
      role="dialog"
    >
      <p className="whitespace-pre-wrap break-keep p-4">
        {text}
      </p>
    </div>
  );
};