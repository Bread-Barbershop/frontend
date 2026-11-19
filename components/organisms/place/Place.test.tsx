import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Dispatch } from 'react';

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

jest.mock('react-daum-postcode', () =>
  function MockPostcode({ defaultQuery, onComplete }: {
    defaultQuery: string;
    onComplete: Dispatch<{ address: string }>;
  }) {
    return (
      <>
        <input aria-label="우편번호 검색어" defaultValue={defaultQuery} />
        <button onClick={() => onComplete({ address: '서울 성동구 성수이로 10' })}>
          주소 선택
        </button>
      </>
    );
  }
);

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

  it.each(['엔터', '검색 버튼'])('%s로 입력한 한글 검색어 전체를 전달한다', async method => {
    const user = userEvent.setup();
    render(<Place blockInfo={createBlock()} id="place-block-1" />);
    const input = screen.getByRole('textbox', { name: '주소' });
    await user.type(input, '성수이로');

    expect(screen.queryByLabelText('우편번호 검색어')).not.toBeInTheDocument();
    if (method === '엔터') await user.keyboard('{Enter}');
    else await user.click(screen.getByRole('button', { name: '주소 검색' }));

    expect(screen.getByLabelText('우편번호 검색어')).toHaveValue('성수이로');
    expect(mockUpdateBlock).not.toHaveBeenCalled();
  });

  it('한글 조합을 확정하는 엔터로는 검색을 시작하지 않는다', () => {
    render(<Place blockInfo={createBlock()} id="place-block-1" />);
    const input = screen.getByRole('textbox', { name: '주소' });

    expect(fireEvent.keyDown(input, { key: 'Enter', isComposing: true })).toBe(false);
    expect(fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 })).toBe(false);
    expect(screen.queryByLabelText('우편번호 검색어')).not.toBeInTheDocument();
  });

  it('검색을 취소하면 기존 주소가 유지되고 검색어를 고쳐 다시 검색할 수 있다', async () => {
    const user = userEvent.setup();
    const block = createBlock();
    render(<Place blockInfo={block} id={block.id} />);
    const input = screen.getByRole('textbox', { name: '주소' });
    await user.type(input, '성수{Enter}');
    await user.click(screen.getByRole('button', { name: '닫기' }));

    expect(screen.getByText(block.props.placeAddress, { exact: false })).toBeVisible();
    expect(mockUpdateBlock).not.toHaveBeenCalled();
    await user.type(input, '이로{Enter}');
    expect(screen.getByLabelText('우편번호 검색어')).toHaveValue('성수이로');
  });

  it('검색 결과를 선택하면 주소와 지도 좌표가 함께 반영된다', async () => {
    const user = userEvent.setup();
    const roadAddress = '서울 성동구 성수이로 10';
    const geocode = jest.fn((_request, resolve) => resolve('OK', {
      v2: { addresses: [{ roadAddress, x: '127.05', y: '37.54' }] },
    }));
    Object.defineProperty(window, 'naver', {
      configurable: true,
      value: { maps: { Service: { Status: { OK: 'OK' }, geocode } } },
    });
    try {
      const block = createBlock();
      render(<Place blockInfo={block} id={block.id} />);
      await user.type(screen.getByRole('textbox', { name: '주소' }), '성수{Enter}');
      await user.click(screen.getByRole('button', { name: '주소 선택' }));

      expect(geocode).toHaveBeenCalledWith({ query: roadAddress }, expect.any(Function));
      expect(mockUpdateBlock).toHaveBeenCalledWith(block.id, {
        placeAddress: roadAddress, lng: 127.05, lat: 37.54,
      });
      expect(screen.queryByLabelText('우편번호 검색어')).not.toBeInTheDocument();
    } finally {
      Reflect.deleteProperty(window, 'naver');
    }
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
