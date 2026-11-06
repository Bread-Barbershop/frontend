import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { TransportationBlock } from './TransportationBlock';
import { TransportationPreview } from './TransportationPreview';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

const initialBlock: EditorBlock<'transportation'> = {
  id: 'transportation-block',
  type: 'wedding',
  component: 'transportation',
  props: {
    title: '오시는 길 안내',
    subwayLine: '',
    subwayStation: '',
    subwayExit: '',
    subwayWalk: '',
    busRoutes: '',
    shuttleStop: '',
    shuttleInterval: '',
    parkingHours: '',
    alternativeParking: '',
    navigationUrl: '',
  },
};

function TransportationEditorHarness() {
  const block = useEditorStore(
    state => state.block[0] as EditorBlock<'transportation'> | undefined
  );

  if (!block) return null;

  return (
    <>
      <TransportationBlock blockInfo={block} id={block.id} />
      <TransportationPreview blockInfo={block} />
    </>
  );
}

describe('교통 안내 내비게이션 URL 편집 통합', () => {
  beforeEach(() => {
    useEditorStore.setState({ block: [initialBlock] });
  });

  afterEach(() => {
    act(() => {
      useEditorStore.getState().reset();
    });
  });

  it('제목은 40자, 나머지 안내 필드는 512자로 제한한다', () => {
    render(<TransportationEditorHarness />);

    fireEvent.change(screen.getByLabelText('제목'), {
      target: { value: '안내 제목'.repeat(9) },
    });
    fireEvent.change(screen.getByLabelText('호선'), {
      target: { value: 'line'.repeat(130) },
    });

    const updatedBlock = useEditorStore.getState()
      .block[0] as EditorBlock<'transportation'>;
    expect(updatedBlock.props.title).toHaveLength(40);
    expect(updatedBlock.props.subwayLine).toHaveLength(512);
  });

  it('긴 지도 링크를 붙여 넣은 뒤 전체 쿼리를 미리보기에 유지한다', async () => {
    const user = userEvent.setup();
    const longDestination = `서울 예식장 ${'상세 장소 안내 '.repeat(10)}`;
    const pastedUrl = `https://map.naver.com/p/search?destination=${encodeURIComponent(longDestination)}&source=invitation`;
    const normalizedUrl = new URL(pastedUrl).toString();
    expect(pastedUrl.length).toBeGreaterThan(512);
    expect(pastedUrl.length).toBeLessThan(2048);

    render(<TransportationEditorHarness />);

    const input = screen.getByLabelText(/내비게이션 링크/);
    await user.click(input);
    await user.paste(pastedUrl);

    expect(
      (useEditorStore.getState().block[0] as EditorBlock<'transportation'>)
        .props.navigationUrl
    ).toBe(pastedUrl);
    expect(
      screen.getByRole('link', { name: '내비게이션 바로가기' })
    ).toHaveAttribute('href', normalizedUrl);
    expect(
      new URL(
        screen
          .getByRole('link', { name: '내비게이션 바로가기' })
          .getAttribute('href') ?? ''
      ).searchParams.get('destination')
    ).toBe(longDestination);

    const reloadedBlock = JSON.parse(
      JSON.stringify(useEditorStore.getState().block)
    ) as EditorBlock<'transportation'>[];
    act(() => {
      useEditorStore.getState().setBlock(reloadedBlock);
    });

    expect(
      screen.getByRole('link', { name: '내비게이션 바로가기' })
    ).toHaveAttribute('href', normalizedUrl);
  });
});
