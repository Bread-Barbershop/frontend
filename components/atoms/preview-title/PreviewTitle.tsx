'use client';

import { VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/utils/cn';

import { previewTitleVariants } from './PreviewTitle.style';

interface PreviewTitleProps extends VariantProps<typeof previewTitleVariants> {
  koTitle?: string;
  enTitle?: string;
  className?: string;
}

export const PreviewTitle = ({
  koTitle,
  enTitle,
  className,
}: PreviewTitleProps) => {
  const koText = koTitle?.trim() || '제목을 입력해주세요';
  const enText = enTitle?.trim() || '제목을 입력해주세요';

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)}>
      <p className={previewTitleVariants({ language: 'en' })}>{enText}</p>
      <p className={previewTitleVariants({ language: 'ko' })}>{koText}</p>
    </div>
  );
};

PreviewTitle.displayName = 'PreviewTitle';
