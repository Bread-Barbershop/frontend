import { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

type InvitationActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: 'accent' | 'default';
};

function InvitationActionButton({
  children,
  className,
  disabled,
  tone = 'default',
  type = 'button',
  ...props
}: InvitationActionButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={cn(
        'min-w-55 rounded-lg border border-border-neutral bg-white px-4 py-2 text-sm font-semibold disabled:cursor-default disabled:opacity-60',
        tone === 'accent' ? 'text-[#1F72EF]' : 'text-text-primary',
        !disabled && 'cursor-pointer',
        className
      )}
    >
      {children}
    </button>
  );
}

export default InvitationActionButton;
