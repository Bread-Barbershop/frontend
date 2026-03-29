import { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

interface Props {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const LeftEditorWrapper = ({
  children,
  className,
  ariaLabel,
}: Props) => {
  return (
    <section
      className={cn(
        'flex flex-col items-center gap-1 px-5 pb-3 w-93.75 h-fit max-h-203 overflow-y-auto',
        className
      )}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  );
};
