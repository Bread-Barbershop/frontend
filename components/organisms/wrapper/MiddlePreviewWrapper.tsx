import { HTMLAttributes, ReactNode } from 'react';

import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import { cn } from '@/shared/utils/cn';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className: string;
  isGuestPage?: boolean;
  noTitle?: boolean;
  titleClassName?: string;
  checkedSubTitle?: boolean;
  checkedMainTitle?: boolean;
  subTitle?: string;
  subTitleDefault?: string;
  mainTitle?: string;
  mainTitleDefault?: string;
  childClassName?: string;
}

export const MiddlePreviewWrapper = ({
  children,
  className,
  noTitle = false,
  titleClassName,
  checkedSubTitle,
  checkedMainTitle = true,
  subTitle,
  subTitleDefault,
  mainTitle,
  mainTitleDefault,
  childClassName,
  isGuestPage: _isGuestPage,
  ...rest
}: Props) => {
  return (
    <div
      className={cn('flex flex-col items-center py-8 px-5 gap-6', className)}
      {...rest}
    >
      {!noTitle && (
        <PreviewTitle
          isKoTitle={checkedMainTitle}
          enTitle={
            checkedSubTitle
              ? subTitle && subTitle.length > 1
                ? subTitle
                : subTitleDefault
              : ''
          }
          koTitle={
            checkedMainTitle
              ? mainTitle && mainTitle.length > 1
                ? mainTitle
                : mainTitleDefault
              : ''
          }
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
