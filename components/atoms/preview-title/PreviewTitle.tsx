'use client';

import { VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/utils/cn';

import { previewTitleVariants } from './PreviewTitle.style';

interface PreviewTitleProps extends VariantProps<typeof previewTitleVariants> {
  koTitle?: string;
  enTitle?: string;
  className?: string;
  titleClassName?: string;
}

export const PreviewTitle = ({
  koTitle,
  enTitle,
  className,
  titleClassName,
}: PreviewTitleProps) => {
  const koText = koTitle?.trim() || '제목을 입력해주세요';
  const enText = enTitle?.trim() || '제목을 입력해주세요';

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)}>
      <p className={cn(previewTitleVariants({ language: 'en' }), titleClassName)}>
        {enText}
      </p>
      <p className={cn(previewTitleVariants({ language: 'ko' }), titleClassName)}>
        {koText}
      </p>
    </div>
  );
};

PreviewTitle.displayName = 'PreviewTitle';
