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
    subTitle,
    placeName,
    placeDetail,
    placeAddress,
    placeTel,
    checkedSubTitle,
    checkedPlaceTel,
    mapLocked,
  } = blockInfo.props;
  // 기존 데이터에 checkedPlaceTel 필드가 없는 경우 placeTel 존재 여부로 폴백 (하위 호환)
  const showPlaceTel = checkedPlaceTel !== undefined ? checkedPlaceTel : Boolean(placeTel?.trim());
  const defaultTitle = getDefaultPlaceTitle(blockInfo.type);
  const { fontFamily } = useBodyFontInfo();

  return (
    <MiddlePreviewWrapper
      className={className}
      childClassName="gap-6"
      titleClassName={titleClassName}
      checkedSubTitle={checkedSubTitle}
      subTitle={subTitle}
      subTitleDefault="LOCATION"
      mainTitle={normalizePlaceTitle(title, blockInfo.type)}
      mainTitleDefault={defaultTitle}
      {...rest}
    >
      <NaverMapScript onReady={() => setIsScriptLoaded(true)} />
      <section
        className="flex flex-col justify-center items-center text-text-primary"
        style={{ fontFamily }}
      >
        <p className="font-normal text-[16px]">{placeAddress}</p>
        <p className="font-normal text-[16px]">
          {placeName} {placeDetail}
        </p>
      </section>
      {showPlaceTel && Boolean(placeTel?.trim()) && (
        <p className="font-normal text-text-tertiary" style={{ fontFamily }}>
          TEL. {formatPhoneNumber(placeTel)}
        </p>
      )}

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
