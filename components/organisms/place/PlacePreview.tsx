import { HTMLAttributes } from 'react';

import { MiddlePreviewWrapper } from '@/components/molecules/wrapper/MiddlePreviewWrapper';
import type { EditorBlock } from '@/shared/types/block';

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
  const { placeName, placeDetail, placeAddress, placeTel } = blockInfo.props;

  return (
    <MiddlePreviewWrapper
      className={className}
      titleClassName={titleClassName}
      enTitle="LOCATION"
      koTitle={blockInfo.props.title}
      {...rest}
    >
      <section className="flex flex-col justify-center items-center text-text-primary">
        <p className="font-semibold text-[16px]">
          {placeName} {placeDetail}
        </p>
        <p className="font-semibold pb-2.5 text-sm">{placeAddress}</p>
      </section>
      <p className="font-normal text-text-tertiary pb-2.5">TEL. {placeTel}</p>

      {blockInfo.props.openMap && (
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
