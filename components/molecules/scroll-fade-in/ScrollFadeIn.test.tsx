import { act, render, screen } from '@testing-library/react';
import React from 'react';

import { ScrollFadeIn } from './ScrollFadeIn';

describe('ScrollFadeIn 컴포넌트', () => {
  let originalIntersectionObserver: typeof window.IntersectionObserver;
  let observeMock: jest.Mock;
  let unobserveMock: jest.Mock;
  let disconnectMock: jest.Mock;
  let observerCallback: (_entries: Partial<IntersectionObserverEntry>[]) => void;

  beforeEach(() => {
    originalIntersectionObserver = window.IntersectionObserver;
    observeMock = jest.fn();
    unobserveMock = jest.fn();
    disconnectMock = jest.fn();

    window.IntersectionObserver = jest.fn().mockImplementation(callback => {
      observerCallback = callback;
      return {
        observe: observeMock,
        unobserve: unobserveMock,
        disconnect: disconnectMock,
      };
    }) as any;
  });

  afterEach(() => {
    window.IntersectionObserver = originalIntersectionObserver;
    jest.restoreAllMocks();
  });

  it('자식 요소를 정상적으로 렌더링한다', () => {
    render(
      <ScrollFadeIn>
        <div>테스트 컴포넌트</div>
      </ScrollFadeIn>
    );

    expect(screen.getByText('테스트 컴포넌트')).toBeInTheDocument();
  });

  it('초기에는 비가시화 상태 클래스(opacity-0, translate-y-6)를 갖는다', () => {
    const { container } = render(
      <ScrollFadeIn>
        <div>테스트 컴포넌트</div>
      </ScrollFadeIn>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('opacity-0');
    expect(wrapper).toHaveClass('translate-y-6');
  });

  it('IntersectionObserver를 통해 뷰포트에 진입하면 가시화 상태 클래스(opacity-100, translate-y-0)로 변경된다', () => {
    const { container } = render(
      <ScrollFadeIn>
        <div>테스트 컴포넌트</div>
      </ScrollFadeIn>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('opacity-0');

    act(() => {
      observerCallback([
        {
          target: wrapper,
          isIntersecting: true,
        },
      ]);
    });

    expect(wrapper).toHaveClass('opacity-100');
    expect(wrapper).toHaveClass('translate-y-0');
    expect(unobserveMock).toHaveBeenCalledWith(wrapper);
  });

  it('IntersectionObserver가 없는 환경에서는 즉시 가시화된다', () => {
    // @ts-expect-error Mocking window without IntersectionObserver
    delete window.IntersectionObserver;

    const { container } = render(
      <ScrollFadeIn>
        <div>테스트 컴포넌트</div>
      </ScrollFadeIn>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('opacity-100');
    expect(wrapper).toHaveClass('translate-y-0');
  });

  it('prefers-reduced-motion이 활성화된 경우 즉시 가시화된다', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { container } = render(
      <ScrollFadeIn>
        <div>테스트 컴포넌트</div>
      </ScrollFadeIn>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('opacity-100');
    expect(wrapper).toHaveClass('translate-y-0');
  });
});
