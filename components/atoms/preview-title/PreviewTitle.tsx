'use client';

import { VariantProps } from 'class-variance-authority';
import React from 'react';
import { useShallow } from 'zustand/shallow';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { BulkData } from '@/shared/types/block';
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
  const enText = enTitle?.trim();
  const { titleData, isEngTitle } = useEditorStore(
    useShallow(state => ({
      titleData: state.titleData,
      isEngTitle: state.isEngTitle,
    }))
  );

  const toStyle = (data: BulkData, isEng?: boolean): React.CSSProperties => ({
    fontSize: isEng ? '13px' : data.fontSize,
    // fontFamily: data.fontFamily === 'default' ? undefined : data.fontFamily,
    fontWeight: data.bold ? '700' : '400',
    fontStyle: data.italic ? 'italic' : 'normal',
    textDecoration: data.underline ? 'underline' : 'none',
    color: data.color,
  });

  return (
    <div className={cn('flex flex-col gap-1 w-full', className)}>
      {isEngTitle && enText !== '' && (
        <p
          className={cn(
            previewTitleVariants({ language: 'en' }),
            titleClassName
          )}
          style={!titleData.isDefault ? toStyle(titleData, true) : undefined}
        >
          {enText}
        </p>
      )}

      <p
        className={cn(previewTitleVariants({ language: 'ko' }), titleClassName)}
        style={!titleData.isDefault ? toStyle(titleData) : undefined}
      >
        {koText}
      </p>
    </div>
  );
};

PreviewTitle.displayName = 'PreviewTitle';
