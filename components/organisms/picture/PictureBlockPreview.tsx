'use client';
import React from 'react';

import { Image } from '@/components/atoms/image';
import { PreviewBody } from '@/components/atoms/preview-body/PreviewBody';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

interface Props {
  blockInfo: EditorBlock<'picture'>;
  className: string;
  titleClassName?: string;
  isGuestPage?: boolean;
  onClick: () => void;
}

function PictureBlockPreview({
  blockInfo,
  className,
  isGuestPage = false,
  ...rest
}: Props) {
  const preview = useResolvedImageSource(
    blockInfo.props.image && blockInfo.props.image.length > 0
      ? blockInfo.props.image[0]
      : null
  );

  return (
    <MiddlePreviewWrapper
      noTitle={!blockInfo.props.isTitle}
      checkedEnglishTitle={blockInfo.props.isEnglishTitle}
      checkedKoTitle={blockInfo.props.isTitle}
      enTitle={blockInfo.props.enTitle}
      enTitleDefault="PICTURE"
      koTitle={blockInfo.props.title}
      koTitleDefault="사진"
      className={className}
      {...rest}
    >
      <div
        className={cn(
          'flex flex-col w-full',
          blockInfo.props.isContents && 'gap-6'
        )}
      >
        <div>
          {blockInfo.props.isContents && (
            <PreviewBody html={blockInfo.props.contentsHtml ?? ''} />
          )}
        </div>
        {!preview && !isGuestPage && (
          <div className="w-full aspect-square flex-center bg-border-neutral rounded-3xl">
            <p className="text-text-secondary text-sm">사진을 추가해주세요.</p>
          </div>
        )}
        {preview && (
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden">
            <Image
              src={preview}
              alt="사진 컴포넌트 이미지"
              fill
              className="object-cover"
              draggable={true}
            />
          </div>
        )}
      </div>
    </MiddlePreviewWrapper>
  );
}

export default PictureBlockPreview;
