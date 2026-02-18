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
      className={`
        w-8 h-8
        flex items-center justify-center
        rounded-md transition-colors
        ${active ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}
      `}
    >
      {icon}
    </button>
  );
}

export default TextEditorButton;
