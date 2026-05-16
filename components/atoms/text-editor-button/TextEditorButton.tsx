'use client';

import { ReactNode, MouseEvent } from 'react';

import { cn } from '@/shared/utils/cn';

interface TextEditorButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  className?: string;
}

function TextEditorButton({
  active = false,
  disabled = false,
  onClick,
  icon,
  label,
  className,
}: TextEditorButtonProps) {
  const handleMouseDown = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      className={cn(
        `w-8 h-8
        flex items-center justify-center
        transition-colors
        hover:bg-gray-200
        rounded-md
        cursor-pointer`,
        className,
        active && 'text-primary'
      )}
    >
      {icon}
    </button>
  );
}

export default TextEditorButton;
