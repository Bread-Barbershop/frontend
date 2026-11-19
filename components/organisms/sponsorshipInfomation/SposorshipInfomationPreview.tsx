import React from 'react';

import { Image } from '@/components/atoms/image';
import AutoScrollCarousel from '@/features/EmblaCarousel/AutoScrollCarousel/AutoScrollCarousel';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import { useResolvedImageSources } from '@/shared/hooks/useResolvedImageSources';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

import { readSponsorEntries, type SponsorEntry } from './sponsorEntries';

interface Props {
  blockInfo: EditorBlock<'sponsorshipInfomation'>;
  className: string;
  titleClassName?: string;
  isGuestPage?: boolean;
  onClick?: () => void;
}

function SponsorCard({ sponsor }: { sponsor: SponsorEntry }) {
  const src = useResolvedImageSource(sponsor.logo);
  const name = sponsor.name.trim();
  return (
    <li className="flex min-w-0 max-w-full flex-col items-center justify-center gap-2 break-words text-center">
      {src && (
        <div className="h-16 w-24">
          <Image
            src={src}
            alt={name ? '' : '후원사 로고'}
            fill
            sizes="96px"
            className="object-contain"
          />
        </div>
      )}
      {name && (
        <span className="max-w-full whitespace-pre-wrap font-medium">
          {name}
        </span>
      )}
    </li>
  );
}

function LegacyLogos({ images }: { images: (File | string)[] }) {
  const preview = useResolvedImageSources(images);
  if (preview.length === 1)
    return (
      <div className="size-21">
        <Image
          src={preview[0]}
          alt="후원사 로고 이미지"
          fill
          className="object-contain rounded-lg"
        />
      </div>
    );
  if (preview.length < 2) return null;
  const slides = preview.length <= 4 ? [...preview, ...preview] : preview;
  return (
    <AutoScrollCarousel className="h-21 w-full" carouselClassName="gap-10">
      {slides.map((src, index) => (
        <div
          key={index}
          className={cn('min-w-0 flex-[0_0_26%]', index === 0 && 'ml-10')}
        >
          <Image
            src={src}
            alt="후원사 로고 이미지"
            fill
            className="object-contain rounded-lg"
          />
        </div>
      ))}
    </AutoScrollCarousel>
  );
}

function SponsorshipInfomationPreview({
  blockInfo,
  className,
  titleClassName,
  isGuestPage = false,
  ...rest
}: Props) {
  const entries = readSponsorEntries(blockInfo.props).filter(
    entry => entry.name.trim() || entry.logo
  );
  if (isGuestPage && !entries.length) return null;

  return (
    <MiddlePreviewWrapper
      className={cn('px-0', className)}
      checkedSubTitle={blockInfo.props.isSubTitle}
      subTitle={blockInfo.props.subTitle}
      subTitleDefault="OUR SPONSORS"
      titleClassName={cn('px-5', titleClassName)}
      mainTitle={blockInfo.props.title}
      mainTitleDefault="후원사"
      {...rest}
    >
      {!entries.length ? (
        <p className="px-5 text-xs text-text-tertiary">
          후원사 이름이나 로고를 등록해 주세요.
        </p>
      ) : !blockInfo.props.sponsors?.length ? (
        <LegacyLogos images={blockInfo.props.images} />
      ) : (
        <ul
          aria-label="후원사 목록"
          className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-5 px-5"
        >
          {entries.map(entry => (
            <SponsorCard key={entry.id} sponsor={entry} />
          ))}
        </ul>
      )}
    </MiddlePreviewWrapper>
  );
}

export default SponsorshipInfomationPreview;
