import { fireEvent, render, screen } from '@testing-library/react';

import type { EditorBlock } from '@/shared/types/block';

const mockUpdateBlock = jest.fn();

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: unknown) =>
    (selector as CallableFunction)({
      updateBlock: mockUpdateBlock,
    }),
}));

jest.mock('@/components/molecules/selector', () => ({
  Selector: () => <div data-testid="selector" />,
}));

jest.mock('./NaverMapScript', () => ({
  NaverMapScript: () => null,
}));

jest.mock('./PlaceMap', () => ({
  PlaceMap: () => null,
}));

import { Place } from './Place';

describe('Place', () => {
  beforeEach(() => {
    mockUpdateBlock.mockClear();
  });

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

  it('renders "연락처 추가" checkbox unchecked by default and does not render 연락처 input', () => {
    render(<Place blockInfo={createBlock()} id="place-block-1" />);

    const checkbox = screen.getByLabelText('연락처 추가');
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByLabelText('연락처')).not.toBeInTheDocument();
  });

  it('renders "연락처" input when checkedPlaceTel is true', () => {
    render(
      <Place
        blockInfo={createBlock({ checkedPlaceTel: true })}
        id="place-block-1"
      />
    );

    const checkbox = screen.getByLabelText('연락처 추가');
    expect(checkbox).toBeChecked();
    expect(screen.getByLabelText('연락처')).toBeInTheDocument();
  });

  it('calls updateBlock with checkedPlaceTel when checkbox is clicked', () => {
    render(<Place blockInfo={createBlock()} id="place-block-1" />);

    const checkbox = screen.getByLabelText('연락처 추가');
    fireEvent.click(checkbox);

    expect(mockUpdateBlock).toHaveBeenCalledWith('place-block-1', {
      checkedPlaceTel: true,
    });
  });
});
