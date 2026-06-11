'use client';

import { VariantProps } from 'class-variance-authority';
import React from 'react';

import { useTitleFontInfo } from '@/shared/hooks/useTitleFontInfo';
import { cn } from '@/shared/utils/cn';

import { previewTitleVariants } from './PreviewTitle.style';

interface PreviewTitleProps extends VariantProps<typeof previewTitleVariants> {
  isKoTitle?: boolean;
  koTitle?: string;
  enTitle?: string;
  className?: string;
  titleClassName?: string;
}

export const PreviewTitle = ({
  isKoTitle,
  koTitle,
  enTitle,
  className,
  titleClassName,
}: PreviewTitleProps) => {
  const koText = koTitle?.trim() || '제목을 입력해 주세요';
  const enText = enTitle?.trim();
  const { koStyle, enStyle } = useTitleFontInfo();

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)}>
      {enText && enText !== '' && (
        <p
          className={cn(
            previewTitleVariants({ language: 'en' }),
            titleClassName
          )}
          style={enStyle}
        >
          {enText}
        </p>
      )}
      {isKoTitle && (
        <p
          className={cn(
            previewTitleVariants({ language: 'ko' }),
            titleClassName
          )}
          style={koStyle}
        >
          {koText}
        </p>
      )}
    </div>
  );
};

PreviewTitle.displayName = 'PreviewTitle';
