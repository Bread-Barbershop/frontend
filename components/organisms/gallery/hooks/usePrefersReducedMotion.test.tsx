import { act, renderHook } from '@testing-library/react';

import { usePrefersReducedMotion } from './usePrefersReducedMotion';

describe('usePrefersReducedMotion', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('OS 설정 변경을 감지하고 리스너를 해제한다', () => {
    let onChange = () => {};
    const mediaQuery = {
      matches: false,
      addEventListener: jest.fn((type: string, callback: () => void) => {
        if (type === 'change') onChange = callback;
      }),
      removeEventListener: jest.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: jest.fn(() => mediaQuery),
    });

    const { result, unmount } = renderHook(usePrefersReducedMotion);
    expect(result.current).toBe(false);
    expect(mediaQuery.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );

    act(() => {
      mediaQuery.matches = true;
      onChange();
    });
    expect(result.current).toBe(true);

    act(() => {
      mediaQuery.matches = false;
      onChange();
    });
    expect(result.current).toBe(false);

    unmount();
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });
});
