import { HTMLAttributes } from 'react';

import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import type { EditorBlock } from '@/shared/types/block';

import Map from './Map';
import Navigation from './Navigation';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'place'>;
}

export const PlacePreview = ({ blockInfo, ...rest }: Props) => {
  const { placeName, placeDetail, placeAddress, placeTel } = blockInfo.props;

  return (
    <div {...rest}>
      <PreviewTitle
        enTitle="LOCATION"
        koTitle={blockInfo.props.title}
        className="py-6"
      />
      <div className="px-5 flex flex-col items-center justify-center text-center gap-3.5 pb-6">
        <section className="flex flex-col justify-center items-center text-text-primary">
          <p className="font-semibold text-[16px]">
            {placeName} {placeDetail}
          </p>
          <p className="font-semibold pb-2.5 text-sm">{placeAddress}</p>
        </section>
        <p className="font-normal text-text-tertiary pb-2.5">TEL. {placeTel}</p>

        {blockInfo.props.openMap && (
          <Map
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
      </div>
    </div>
  );
};
