import { cn } from '@/shared/utils/cn';

import type { ComponentProps } from 'react';

export default function NoticeConfirmButton({
  children = '알겠어요',
  className,
  disabled,
  onClick,
}: Pick<ComponentProps<'button'>, 'children' | 'className' | 'disabled'> & {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        'shrink-0 cursor-pointer rounded-lg bg-transparent px-8 py-[13.5px] font-pretendard text-sm font-semibold leading-5 text-text-primary transition-colors enabled:hover:bg-status-error-bg/32 enabled:active:bg-btn-close-pressed focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
