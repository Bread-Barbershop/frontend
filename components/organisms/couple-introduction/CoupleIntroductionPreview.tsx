import { type HTMLAttributes } from 'react';

import { Image } from '@/components/atoms/image';
import { PreviewBody } from '@/components/atoms/preview-body/PreviewBody';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
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
  titleClassName?: string;
  isGuestPage?: boolean;
}

function CoupleIntroductionPreview({
  blockInfo,
  className = '',
  titleClassName,
  isGuestPage = false,
  ...rest
}: Props) {
  const {
    groom = '',
    bride = '',
    groomImage = { id: '', image: [] },
    brideImage = { id: '', image: [] },
    title = '',
    checkedSubTitle = true,
    subTitle = '',
    messageJson = null,
    messageHtml = null,
    showContent = false,
    brideFirst = false,
  } = blockInfo.props;
  const { fontFamily } = useBodyFontInfo();

  const hasGroomImageSlot =
    Array.isArray(groomImage.image) && groomImage.image.length > 0;
  const hasBrideImageSlot =
    Array.isArray(brideImage.image) && brideImage.image.length > 0;
  //const transportImages = []; //Array.isArray(images) ? images : [];

  let groomTransportSource = pickResolvableImageSource(groomImage.image[0]);
  let brideTransportSource = pickResolvableImageSource(brideImage.image[0]);

  if (groomImage.image?.length === 1 && hasBrideImageSlot) {
    if (hasGroomImageSlot && !hasBrideImageSlot) {
      groomTransportSource = pickResolvableImageSource(groomImage.image[0]);
      brideTransportSource = null;
    } else if (!hasGroomImageSlot && hasBrideImageSlot) {
      groomTransportSource = null;
      brideTransportSource = pickResolvableImageSource(brideImage.image[0]);
    }
  }

  const groomFallbackSource = pickResolvableImageSource(groomImage?.image?.[0]);
  const brideFallbackSource = pickResolvableImageSource(brideImage?.image?.[0]);
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
    <MiddlePreviewWrapper
      className={className}
      titleClassName={titleClassName}
      checkedSubTitle={checkedSubTitle}
      subTitle={subTitle}
      subTitleDefault="INTRODUCTION"
      mainTitle={title}
      mainTitleDefault="신랑・신부 소개"
      {...rest}
    >
      <div className="flex w-full flex-row gap-4.5">
        {profileItems.map(profile => (
          <div
            key={profile.key}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4"
          >
            {profile.imageSrc ? (
              <div className="relative aspect-square w-full overflow-hidden rounded-3xl">
                <Image
                  src={profile.imageSrc}
                  alt={`${profile.label} 사진`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              !isGuestPage && (
                <div className="flex aspect-square w-full items-center justify-center rounded-3xl bg-border-neutral">
                  <p>사진을 추가해 주세요.</p>
                </div>
              )
            )}
            <p className="text-[16px] font-medium" style={{ fontFamily }}>
              {profile.name || '성함'}
            </p>
          </div>
        ))}
      </div>

      {showContent && <PreviewBody html={html} />}
    </MiddlePreviewWrapper>
  );
}

export default CoupleIntroductionPreview;
