'use client';
import React from 'react';

import { Image } from '@/components/atoms/image';
import { PreviewBody } from '@/components/atoms/preview-body/PreviewBody';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

interface Props {
  blockInfo: EditorBlock<'picture'>;
  className: string;
  titleClassName?: string;
  onClick: () => void;
}

function PictureBlockPreview({ blockInfo, className, ...rest }: Props) {
  const preview = useResolvedImageSource(
    blockInfo.props.image && blockInfo.props.image.length > 0
      ? blockInfo.props.image[0]
      : null
  );
  return (
    <MiddlePreviewWrapper
      checkedEnglishTitle={blockInfo.props.isEnglishTitle}
      enTitle={blockInfo.props.enTitle}
      enTitleDefault="PICTURE"
      koTitle={blockInfo.props.title}
      koTitleDefault="사진"
      className={className}
      {...rest}
    >
      <div className={`flex flex-col ${blockInfo.props.isContents && 'gap-6'}`}>
        <div>
          {blockInfo.props.isContents && (
            <PreviewBody html={blockInfo.props.contentsHtml ?? ''} />
          )}
        </div>
        {!preview && (
          <div className="w-[335px] h-[335px] flex-center bg-border-neutral rounded-3xl">
            <p className="text-text-primary text-[13px]">
              사진을 추가해주세요.
            </p>
          </div>
        )}
        {preview && (
          <div className="relative w-[335px] h-[335px]">
            <Image
              src={preview}
              alt="사진 컴포넌트 이미지"
              fill
              className="object-cover rounded-3xl"
            />
          </div>
        )}
      </div>
    </MiddlePreviewWrapper>
  );
}

export default PictureBlockPreview;
