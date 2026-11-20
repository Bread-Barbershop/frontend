import { cn } from '@/shared/utils/cn';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLElement> {
  ariaLabel?: string;
}

export const LeftEditorWrapper = ({
  children,
  className,
  ariaLabel,
  ...sectionProps
}: Props) => {
  return (
    <div className="grid w-full justify-items-center">
      <section
        {...sectionProps}
        className={cn(
          'relative flex flex-col items-center gap-1 px-5 pb-1.5 w-93.75 h-fit max-h-[750px] overflow-y-auto scrollbar-hide transition-all min-h-0',
          className
        )}
        aria-label={ariaLabel}
      >
        {children}
      </section>
    </div>
  );
};
