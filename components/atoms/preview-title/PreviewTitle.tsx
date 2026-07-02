'use client';

import { VariantProps } from 'class-variance-authority';
import React from 'react';

import { useTitleFontInfo } from '@/shared/hooks/useTitleFontInfo';
import { cn } from '@/shared/utils/cn';

import { previewTitleVariants } from './PreviewTitle.style';

interface PreviewTitleProps extends VariantProps<typeof previewTitleVariants> {
  isMainTitle?: boolean;
  mainTitle?: string;
  subTitle?: string;
  className?: string;
  titleClassName?: string;
}

export const PreviewTitle = ({
  isMainTitle,
  mainTitle,
  subTitle,
  className,
  titleClassName,
}: PreviewTitleProps) => {
  const mainText = mainTitle?.trim() || '제목을 입력해 주세요';
  const subText = subTitle?.trim();
  const { mainStyle, subStyle } = useTitleFontInfo();

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)}>
      {subText && subText !== '' && (
        <p
          className={cn(
            previewTitleVariants({ language: 'sub' }),
            titleClassName
          )}
          style={subStyle}
        >
          {subText}
        </p>
      )}
      {isMainTitle && (
        <p
          className={cn(
            previewTitleVariants({ language: 'main' }),
            titleClassName
          )}
          style={mainStyle}
        >
          {mainText}
        </p>
      )}
    </div>
  );
};

PreviewTitle.displayName = 'PreviewTitle';
