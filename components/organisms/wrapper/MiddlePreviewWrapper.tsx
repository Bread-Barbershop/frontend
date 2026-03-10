import { HTMLAttributes, ReactNode } from 'react';

import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import { cn } from '@/shared/utils/cn';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className: string;
  noTitle?: boolean;
  titleClassName?: string;
  enTitle?: string;
  koTitle?: string;
  childClassName?: string;
}

export const MiddlePreviewWrapper = ({
  children,
  className,
  noTitle = false,
  titleClassName,
  enTitle,
  koTitle,
  childClassName,
  ...rest
}: Props) => {
  return (
    <div
      className={cn('flex flex-col items-center py-8 px-5 gap-6', className)}
      {...rest}
    >
      {!noTitle && (
        <PreviewTitle
          enTitle={enTitle}
          koTitle={koTitle}
          titleClassName={titleClassName}
        />
      )}
      <div
        className={cn(
          'w-full flex flex-col items-center justify-center text-center gap-3.5',
          childClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};
