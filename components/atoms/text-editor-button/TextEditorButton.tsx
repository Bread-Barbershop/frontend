'use client';

import { ReactNode, MouseEvent } from 'react';

interface TextEditorButtonProps {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

function TextEditorButton({
  active = false,
  disabled = false,
  onClick,
  icon,
  label,
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
      className="w-8 h-8
        flex items-center justify-center
        transition-colors
        hover:bg-gray-200
        rounded-md
        cursor-pointer
        "
    >
      {icon}
    </button>
  );
}

export default TextEditorButton;
