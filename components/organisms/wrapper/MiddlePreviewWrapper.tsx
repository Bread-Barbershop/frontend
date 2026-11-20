'use client';

import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';

import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

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
  matchBodyFontSize?: boolean;
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
  matchBodyFontSize = false,
  isGuestPage: _isGuestPage,
  ...rest
}: Props) => {
  const bodyFontSize = useEditorStore(state =>
    matchBodyFontSize ? state.bodyData?.fontSize : undefined
  );

  return (
    <div
      className={cn('flex flex-col items-center py-8 px-5 gap-6', className)}
      {...rest}
    >
      {!noTitle && (
        <PreviewTitle
          isMainTitle={checkedMainTitle}
          subTitle={
            checkedSubTitle
              ? subTitle && subTitle.length >= 1
                ? subTitle
                : subTitleDefault
              : ''
          }
          mainTitle={
            checkedMainTitle
              ? mainTitle && mainTitle.length >= 1
                ? mainTitle
                : mainTitleDefault
              : ''
          }
          titleClassName={titleClassName}
        />
      )}
      <div
        style={
          bodyFontSize
            ? ({
                '--text-xs': bodyFontSize,
                '--text-sm': bodyFontSize,
              } as CSSProperties)
            : undefined
        }
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
