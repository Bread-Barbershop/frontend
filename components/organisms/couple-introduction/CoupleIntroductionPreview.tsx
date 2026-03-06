import { HTMLAttributes, useEffect, useMemo } from 'react';

import { Image } from '@/components/atoms/image';
import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { EditorBlock } from '@/shared/types/block';

function usePreviewImage(files?: File[]) {
  const src = useMemo(() => {
    const file = files?.[0];
    return file ? URL.createObjectURL(file) : null;
  }, [files]);

  useEffect(() => {
    return () => {
      if (src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [src]);

  return src;
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'coupleIntroduction'>;
  titleClassName: string;
}

function CoupleIntroductionPreview({
  blockInfo,
  className = '',
  titleClassName,
  ...rest
}: Props) {
  const {
    groom = '',
    bride = '',
    groomImage = [],
    brideImage = [],
    title = '',
    messageJson = null,
    messageHtml = null,
    showProfileImage = false,
    showTitle = false,
    showContent = false,
    brideFirst = false,
  } = blockInfo.props;

  const groomImageSrc = usePreviewImage(groomImage);
  const brideImageSrc = usePreviewImage(brideImage);
  const html = messageHtml ?? tiptapJsonToHtmlUniversal(messageJson);
  const profileItems = brideFirst
    ? [
        {
          key: 'bride',
          label: '신부',
          name: bride,
          imageSrc: brideImageSrc,
        },
        {
          key: 'groom',
          label: '신랑',
          name: groom,
          imageSrc: groomImageSrc,
        },
      ]
    : [
        {
          key: 'groom',
          label: '신랑',
          name: groom,
          imageSrc: groomImageSrc,
        },
        {
          key: 'bride',
          label: '신부',
          name: bride,
          imageSrc: brideImageSrc,
        },
      ];

  return (
    <section className={`px-5 ${className}`} {...rest}>
      <PreviewTitle
        enTitle="INTRODUCTION"
        koTitle={showTitle && title ? title : '신랑・신부 소개'}
        className="mb-6"
        titleClassName={titleClassName}
      />

      <div className="flex gap-4.5 justify-center">
        {profileItems.map(profile => (
          <div
            key={profile.key}
            className="w-40 flex flex-col justify-center items-center gap-4"
          >
            {showProfileImage &&
              (profile.imageSrc ? (
                <div className="relative size-40 rounded-lg overflow-hidden">
                  <Image
                    src={profile.imageSrc}
                    alt={`${profile.label} 사진`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="size-40 rounded-3xl bg-border-neutral flex justify-center items-center">
                  <p>사진을 추가해 주세요.</p>
                </div>
              ))}
            <p className="text-[16px] font-semibold">
              {profile.name || '성함'}
            </p>
          </div>
        ))}
      </div>

      {showContent && (
        <div
          className="text-sm mt-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </section>
  );
}

export default CoupleIntroductionPreview;
