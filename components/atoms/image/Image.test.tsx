import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { Image } from './Image';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ''} />
  ),
}));

jest.mock('@/shared/assets/icons/loadingSpinner.svg', () => ({
  __esModule: true,
  default: () => <svg data-testid="image-loading-spinner" />,
}));

jest.mock('@/shared/hooks/useDriveImageResolveMode', () => ({
  useDriveImageResolveMode: () => 'public',
}));

describe('Image error callback', () => {
  it.each([false, true])(
    '드래그 가능 여부와 관계없이 이미지 오류를 전달한다 (draggable=%s)',
    draggable => {
      const onError = jest.fn();
      render(
        <Image
          src="/image.webp"
          alt="초대장 이미지"
          draggable={draggable}
          onError={onError}
        />
      );

      fireEvent.error(screen.getByAltText('초대장 이미지'));

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      );
    }
  );
});
