/* eslint-disable @typescript-eslint/no-unused-vars */
import { HTMLAttributes } from 'react';

import { PreviewTitle } from '@/components/atoms/preview-title/PreviewTitle';
import type { EditorBlock } from '@/widgets/editor/store/useEditorStore';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'gallery'>;
}

export const PlacePreview = ({ blockInfo, className = '', ...rest }: Props) => {
  // const { placeName, placeDetail, placeAddress, placeTel } = blockInfo.props;
  const placeName = '000웨딩홀';
  const placeDetail = '0층 그랜드볼룸';
  const placeAddress = '서울특별시 강남구 테헤란로 123';
  const placeTel = '02-1234-5678';

  return (
    <div className={`px-5 ${className}`} {...rest}>
      {/* <PreviewTitle
        enTitle="LOCATION"
        koTitle={blockInfo.props.title}
        className="mb-6"
      /> */}
      <div className="flex justify-center items-center text-text-primary">
        <p className="font-semibold">
          {placeName} {placeDetail}
        </p>
        <p className="font-semibold pb-6">{placeAddress}</p>
        <p className="font-normal text-text-tertiary pb-6">TEL. {placeTel}</p>
      </div>
    </div>
  );
};
