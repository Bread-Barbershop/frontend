'use client';

import { HTMLAttributes, useState } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import type { EditorBlock } from '@/shared/types/block';
import { formatPhoneNumber } from '@/shared/utils/phoneNumber';

import { NaverMapScript } from './NaverMapScript';
import { Navigation } from './Navigation';
import { PlaceMap } from './PlaceMap';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'place'>;
  className: string;
  titleClassName?: string;
}

export const PlacePreview = ({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const {
    title,
    englishTitle,
    placeName,
    placeDetail,
    placeAddress,
    placeTel,
    checkedEnglishTitle,
  } = blockInfo.props;

  return (
    <MiddlePreviewWrapper
      className={className}
      titleClassName={titleClassName}
      checkedEnglishTitle={checkedEnglishTitle}
      enTitle={englishTitle}
      enTitleDefault="LOCATION"
      koTitle={title}
      koTitleDefault="오시는 길"
      {...rest}
    >
      <NaverMapScript onReady={() => setIsScriptLoaded(true)} />
      <section className="flex flex-col justify-center items-center text-text-primary">
        <p className="font-semibold text-[16px]">
          {placeName} {placeDetail}
        </p>
        <p className="font-semibold pb-2.5 text-sm">{placeAddress}</p>
      </section>
      <p className="font-normal text-text-tertiary pb-2.5">
        TEL. {formatPhoneNumber(placeTel)}
      </p>

      {blockInfo.props.openMap && isScriptLoaded && (
        <PlaceMap
          lng={blockInfo.props.lng}
          lat={blockInfo.props.lat}
          category="preview"
        />
      )}

      {blockInfo.props.openNavi && (
        <Navigation
          lat={blockInfo.props.lat}
          lng={blockInfo.props.lng}
          name={blockInfo.props.placeAddress}
        />
      )}
    </MiddlePreviewWrapper>
  );
};
