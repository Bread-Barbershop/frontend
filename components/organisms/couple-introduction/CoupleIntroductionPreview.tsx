import { type HTMLAttributes } from 'react';

import { Image } from '@/components/atoms/image';
import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import {
  useResolvedImageSource,
  type ResolvableImageSource,
} from '@/shared/hooks/useResolvedImageSource';
import { EditorBlock } from '@/shared/types/block';

function pickResolvableImageSource(value: unknown): ResolvableImageSource {
  if (value instanceof File) return value;
  if (typeof value === 'string') return value;
  return null;
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
    images = [],
    title = '',
    messageJson = null,
    messageHtml = null,
    showProfileImage = false,
    showTitle = false,
    showContent = false,
    brideFirst = false,
  } = blockInfo.props;

  const hasGroomImageSlot = Array.isArray(groomImage) && groomImage.length > 0;
  const hasBrideImageSlot = Array.isArray(brideImage) && brideImage.length > 0;
  const transportImages = Array.isArray(images) ? images : [];

  let groomTransportSource = pickResolvableImageSource(transportImages[0]);
  let brideTransportSource = pickResolvableImageSource(transportImages[1]);

  if (transportImages.length === 1) {
    if (hasGroomImageSlot && !hasBrideImageSlot) {
      groomTransportSource = pickResolvableImageSource(transportImages[0]);
      brideTransportSource = null;
    } else if (!hasGroomImageSlot && hasBrideImageSlot) {
      groomTransportSource = null;
      brideTransportSource = pickResolvableImageSource(transportImages[0]);
    }
  }

  const groomFallbackSource = pickResolvableImageSource(groomImage?.[0]);
  const brideFallbackSource = pickResolvableImageSource(brideImage?.[0]);
  const groomImageSrc = useResolvedImageSource(
    groomTransportSource ?? groomFallbackSource
  );
  const brideImageSrc = useResolvedImageSource(
    brideTransportSource ?? brideFallbackSource
  );
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
                <div className="relative size-40 rounded-3xl overflow-hidden">
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
