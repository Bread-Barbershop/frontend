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
    <div className="animate-grow-height grid">
      <section
        className={cn(
          'flex flex-col items-center gap-1 px-5 pb-1.5 w-93.75 h-fit max-h-[750px] overflow-y-auto scrollbar-hide transition-all min-h-0',
          className
        )}
        aria-label={ariaLabel}
      >
        {children}
      </section>
    </div>
  );
};
