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
    let onChange: ((event: MediaQueryListEvent) => void) | undefined;
    const mediaQuery = {
      matches: false,
      addEventListener: jest.fn(
        (_type: string, callback: (event: MediaQueryListEvent) => void) => {
          onChange = callback;
        }
      ),
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
      onChange?.({ matches: true } as MediaQueryListEvent);
    });
    expect(result.current).toBe(true);

    act(() => {
      onChange?.({ matches: false } as MediaQueryListEvent);
    });
    expect(result.current).toBe(false);

    unmount();
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });
});
