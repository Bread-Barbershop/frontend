import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import type { EditorBlock } from '@/shared/types/block';

jest.mock('@/components/organisms/wrapper/MiddlePreviewWrapper', () => ({
  MiddlePreviewWrapper: ({ children }: { children: ReactNode }) => (
    <div data-testid="middle-preview-wrapper">{children}</div>
  ),
}));

jest.mock('@/shared/hooks/useBodyFontInfo', () => ({
  useBodyFontInfo: () => ({ fontFamily: 'sans-serif' }),
}));

jest.mock('./NaverMapScript', () => ({
  NaverMapScript: () => null,
}));

jest.mock('./PlaceMap', () => ({
  PlaceMap: () => null,
}));

jest.mock('./Navigation', () => ({
  Navigation: () => null,
}));

import { PlacePreview } from './PlacePreview';

describe('PlacePreview', () => {
  const createBlock = (
    propsPartial: Partial<EditorBlock<'place'>['props']> = {}
  ): EditorBlock<'place'> => ({
    id: 'place-block-1',
    type: 'birthday',
    component: 'place',
    props: {
      title: '행사 장소',
      subTitle: 'LOCATION',
      country: '국내',
      placeName: '서울숲',
      placeDetail: '중앙광장',
      placeAddress: '서울특별시 성동구 뚝섬로 273',
      placeTel: '01012345678',
      checkedSubTitle: true,
      checkedPlaceTel: false,
      openMap: false,
      openNavi: false,
      mapLocked: false,
      lng: 127.04,
      lat: 37.54,
      ...propsPartial,
    },
  });

  it('does not render TEL when checkedPlaceTel is false by default', () => {
    render(<PlacePreview blockInfo={createBlock()} className="test-place" />);
    expect(screen.queryByText(/TEL\./i)).not.toBeInTheDocument();
  });

  it('renders TEL when checkedPlaceTel is true and placeTel is provided', () => {
    render(
      <PlacePreview
        blockInfo={createBlock({ checkedPlaceTel: true, placeTel: '01012345678' })}
        className="test-place"
      />
    );
    expect(screen.getByText('TEL. 010-1234-5678')).toBeInTheDocument();
  });

  it('does not render TEL when checkedPlaceTel is true but placeTel is empty', () => {
    render(
      <PlacePreview
        blockInfo={createBlock({ checkedPlaceTel: true, placeTel: '' })}
        className="test-place"
      />
    );
    expect(screen.queryByText(/TEL\./i)).not.toBeInTheDocument();
  });

});
