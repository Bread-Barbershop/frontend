'use client';

import { HTMLAttributes, useState } from 'react';

import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import type { EditorBlock } from '@/shared/types/block';
import { formatPhoneNumber } from '@/shared/utils/phoneNumber';
import {
  getDefaultPlaceTitle,
  normalizePlaceTitle,
} from '@/shared/utils/placeTitle';

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
    mapLocked,
  } = blockInfo.props;
  const defaultTitle = getDefaultPlaceTitle(blockInfo.type);
  const { fontFamily, color } = useBodyFontInfo();

  return (
    <MiddlePreviewWrapper
      className={className}
      childClassName="gap-6"
      titleClassName={titleClassName}
      checkedEnglishTitle={checkedEnglishTitle}
      enTitle={englishTitle}
      enTitleDefault="LOCATION"
      koTitle={normalizePlaceTitle(title, blockInfo.type)}
      koTitleDefault={defaultTitle}
      {...rest}
    >
      <NaverMapScript onReady={() => setIsScriptLoaded(true)} />
      <section
        className="flex flex-col justify-center items-center text-text-primary"
        style={{ fontFamily, color }}
      >
        <p className="font-normal text-[16px]">
          {placeName} {placeDetail}
        </p>
        <p className="font-normal text-[16px]">{placeAddress}</p>
      </section>
      <p
        className="font-normal text-text-tertiary"
        style={{ fontFamily, color }}
      >
        TEL. {formatPhoneNumber(placeTel)}
      </p>

      {blockInfo.props.openMap && isScriptLoaded && (
        <PlaceMap
          lng={blockInfo.props.lng}
          lat={blockInfo.props.lat}
          category="preview"
          locked={Boolean(mapLocked)}
        />
      )}

      {blockInfo.props.openMap && blockInfo.props.openNavi && (
        <Navigation
          lat={blockInfo.props.lat}
          lng={blockInfo.props.lng}
          name={blockInfo.props.placeAddress}
        />
      )}
    </MiddlePreviewWrapper>
  );
};
