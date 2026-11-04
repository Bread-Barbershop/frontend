import { render } from '@testing-library/react';
import React from 'react';

import { GuestMainPoster } from './GuestMainPoster';

const mockImage = jest.fn(() => null);

jest.mock('@/widgets/mainPoster/libs/customImage-filter', () => ({}));
jest.mock('@/shared/hooks/useResolvedImageSource', () => ({
  useResolvedImageSource: () => 'https://lh3.googleusercontent.com/d/poster-file-id',
}));
jest.mock('@/components/atoms/image', () => ({
  Image: (props: Record<string, unknown>) => mockImage(props),
}));

describe('GuestMainPoster image loading', () => {
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
});
