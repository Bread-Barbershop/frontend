'use client';
import React from 'react';

import { Image } from '@/components/atoms/image';
import { PreviewBody } from '@/components/atoms/preview-body/PreviewBody';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

import { resolvePictureTransform } from './pictureTransform';

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
  const transform = resolvePictureTransform(blockInfo.props);
  const preview = useResolvedImageSource(
    blockInfo.props.image && blockInfo.props.image.length > 0
      ? blockInfo.props.image[0]
      : null
  );

  return (
    <MiddlePreviewWrapper
      noTitle={!blockInfo.props.isTitle}
      checkedSubTitle={blockInfo.props.isSubTitle}
      checkedMainTitle={blockInfo.props.isTitle}
      subTitle={blockInfo.props.subTitle}
      subTitleDefault="PICTURE"
      mainTitle={blockInfo.props.title}
      mainTitleDefault="사진"
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
          <div className="relative w-full rounded-3xl overflow-hidden" style={{ aspectRatio: transform.aspectRatio }}>
            <Image
              src={preview}
              alt="초대장 사진"
              fill
              className="object-cover"
              style={{ transform: transform.transform, objectPosition: transform.objectPosition, filter: transform.filter }}
              draggable={false}
            />
            {blockInfo.props.imageFilter === 'vignette' && (
              <div className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{ boxShadow: 'inset 0 0 80px 15px rgba(0,0,0,.38)' }} />
            )}
          </div>
        )}
      </div>
    </MiddlePreviewWrapper>
  );
}

export default PictureBlockPreview;
