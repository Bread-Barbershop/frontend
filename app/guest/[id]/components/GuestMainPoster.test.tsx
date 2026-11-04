import { render } from '@testing-library/react';
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
});
