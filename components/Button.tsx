import { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export interface ButtonProps {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({
  children,
  disabled,
  onClick,
  className,
  variant = 'secondary',
  size = 'md',
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-700',
    danger: 'bg-red-600',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      disabled={disabled}
      // cn 함수로 기본 스타일 + 조건부 스타일 + 외부 스타일을 병합
      className={cn(
        // 기본 스타일
        'rounded text-white border-none cursor-pointer',
        // variant
        variantStyles[variant],
        // size
        sizeStyles[size],
        // disabled
        'disabled:bg-gray-300 disabled:cursor-not-allowed',
        // 외부 className (최종 우선)
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
