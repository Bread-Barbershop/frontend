import { act, render } from '@testing-library/react';
import React from 'react';

import { GuestMainPoster } from './GuestMainPoster';

const mockImage = jest.fn((props: Record<string, unknown>) => {
  void props;
  return <div data-testid="mock-image" className={props.wrapperClassName as string} />;
});

jest.mock('@/widgets/mainPoster/libs/customImage-filter', () => ({}));
jest.mock('@/shared/hooks/useResolvedImageSource', () => ({
  useResolvedImageSource: () => 'https://lh3.googleusercontent.com/d/poster-file-id',
}));
jest.mock('@/components/atoms/image', () => ({
  Image: (props: Record<string, unknown>) => mockImage(props),
}));

describe('GuestMainPoster image loading and layout', () => {
  beforeEach(() => {
    mockImage.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses eager/high fetch without a duplicate Next Image priority preload', () => {
    render(<GuestMainPoster thumbnailFileId="poster-file-id" />);
    const props = mockImage.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(props.loading).toBe('eager');
    expect(props.fetchPriority).toBe('high');
    expect(props.priority).toBeUndefined();
    expect(props.unoptimized).toBe(true);
  });

  it('renders with 100% width wrapper and centered layout to prevent shrinking on wider screens', () => {
    const { container, getByTestId } = render(
      <GuestMainPoster thumbnailFileId="poster-file-id" />
    );

    const outerContainer = container.firstElementChild as HTMLElement;
    expect(outerContainer).toHaveClass('w-full', 'relative', 'overflow-hidden', 'flex', 'justify-center');

    const props = mockImage.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(props.width).toBe(375);
    expect(props.height).toBe(812);
    expect(props.wrapperClassName).toContain('w-full');
    expect(props.wrapperClassName).toContain('flex');
    expect(props.wrapperClassName).toContain('justify-center');
    expect(props.className).toContain('w-full');
    expect(props.className).toContain('h-auto');

    const renderedWrapper = getByTestId('mock-image');
    expect(renderedWrapper).toHaveClass('w-full');
  });

  it('대표 이미지 로딩 실패 시 재시도 안내를 표시하고 미리보기 로딩을 해제한다', () => {
    const onReady = jest.fn();
    const { getByText } = render(
      <GuestMainPoster thumbnailFileId="poster-file-id" onReady={onReady} />
    );
    const imageProps = mockImage.mock.calls[0]?.[0] as Record<string, unknown>;

    act(() => {
      (imageProps.onError as () => void)();
    });

    expect(getByText('초대장 이미지를 불러오지 못했어요.')).toBeInTheDocument();
    expect(getByText('다시 시도하기')).toBeInTheDocument();
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('대표 이미지 요청이 오래 멈추면 이미지를 유지한 채 재시도를 안내한다', () => {
    jest.useFakeTimers();
    const onReady = jest.fn();
    const { getByTestId, getByText } = render(
      <GuestMainPoster thumbnailFileId="poster-file-id" onReady={onReady} />
    );

    act(() => {
      jest.advanceTimersByTime(10_000);
    });

    expect(getByText(/대표 이미지를 불러오는 중이에요/)).toBeInTheDocument();
    expect(getByText('다시 시도하기')).toBeInTheDocument();
    expect(getByTestId('mock-image')).toBeInTheDocument();
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('대표 이미지가 정상 로딩되면 지연 안내를 표시하지 않는다', () => {
    jest.useFakeTimers();
    const onReady = jest.fn();
    const { queryByText } = render(
      <GuestMainPoster thumbnailFileId="poster-file-id" onReady={onReady} />
    );
    const imageProps = mockImage.mock.calls[0]?.[0] as Record<string, unknown>;

    act(() => {
      (imageProps.onLoad as () => void)();
      jest.advanceTimersByTime(10_000);
    });

    expect(queryByText(/대표 이미지를 불러오는 중이에요/)).not.toBeInTheDocument();
    expect(onReady).toHaveBeenCalledTimes(1);
  });
});
