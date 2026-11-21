import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { ScrollFadeIn } from './ScrollFadeIn';

describe('ScrollFadeIn 컴포넌트', () => {
  let originalIntersectionObserver: typeof window.IntersectionObserver;
  let originalMatchMedia: typeof window.matchMedia;
  let observeMock: jest.Mock;
  let unobserveMock: jest.Mock;
  let disconnectMock: jest.Mock;
  let triggerIntersect: jest.Mock<void, [isIntersecting?: boolean]>;

  beforeEach(() => {
    originalIntersectionObserver = window.IntersectionObserver;
    originalMatchMedia = window.matchMedia;
    observeMock = jest.fn();
    unobserveMock = jest.fn();
    disconnectMock = jest.fn();

    window.IntersectionObserver = jest.fn().mockImplementation(callback => {
      triggerIntersect = jest.fn((isIntersecting = true) => {
        const target = observeMock.mock.calls[0]?.[0] as
          | HTMLElement
          | undefined;
        callback([{ target, isIntersecting }]);
      });
      return {
        observe: observeMock,
        unobserve: unobserveMock,
        disconnect: disconnectMock,
      };
    }) as any;
  });

  afterEach(() => {
    fireEvent.scroll(window, { target: { scrollY: 0 } });
    window.IntersectionObserver = originalIntersectionObserver;
    window.matchMedia = originalMatchMedia;
    jest.restoreAllMocks();
  });

  it('기본값이면 내용을 즉시 표시하고 스크롤을 관찰하지 않는다', () => {
    render(
      <ScrollFadeIn data-testid="static-block">
        <div>테스트 컴포넌트</div>
      </ScrollFadeIn>
    );

    expect(screen.getByText('테스트 컴포넌트')).toBeInTheDocument();
    expect(screen.getByTestId('static-block')).toHaveClass('opacity-100');
    expect(observeMock).not.toHaveBeenCalled();
  });

  it('선택한 전환 시간과 부드러움을 실제 렌더링에 적용한다', () => {
    render(
      <ScrollFadeIn
        data-testid="block"
        animationDurationMs={1400}
        animationType="fade"
        animationEasing="soft"
      >
        <p>초대합니다</p>
      </ScrollFadeIn>
    );
    act(() => triggerIntersect());
    expect(screen.getByTestId('block')).toHaveStyle({
      transitionDuration: '1400ms',
      transitionTimingFunction: 'ease-in-out',
    });
  });

  it('초기에는 비가시화 상태 클래스(opacity-0, translate-y-6)를 갖는다', () => {
    render(
      <ScrollFadeIn data-testid="block" animationType="fade-up">
        <div>테스트 컴포넌트</div>
      </ScrollFadeIn>
    );

    const wrapper = screen.getByTestId('block');
    expect(wrapper).toHaveClass('opacity-0');
    expect(wrapper).toHaveClass('translate-y-6');
  });

  it('뷰포트에 진입하면 내용이 원래 위치에 표시된다', () => {
    const { container } = render(
      <ScrollFadeIn data-testid="block" animationType="fade-up">
        <div>테스트 컴포넌트</div>
      </ScrollFadeIn>
    );

    const wrapper = screen.getByTestId('block');
    expect(wrapper).toHaveClass('opacity-0');

    act(() => {
      triggerIntersect();
    });

    expect(wrapper).toHaveClass('opacity-100');
    expect(wrapper).not.toHaveClass('translate-y-6');
    expect(unobserveMock).toHaveBeenCalledWith(container.firstElementChild);
  });

  it.each(['down-only', 'down-repeat'] as const)(
    '%s 모드에서는 건너뛴 블록으로 올라오면 즉시 표시하고 다음 하향 진입 때 재생한다',
    triggerMode => {
      render(
        <div style={{ overflowY: 'auto' }} data-testid="preview-panel">
          <ScrollFadeIn
            data-testid="block"
            animationType="fade"
            triggerMode={triggerMode}
          >
            초대합니다
          </ScrollFadeIn>
        </div>
      );
      const block = screen.getByTestId('block');
      const panel = screen.getByTestId('preview-panel');
      act(() => triggerIntersect(false));
      fireEvent.scroll(panel, { target: { scrollTop: 1500 } });
      fireEvent.scroll(panel, { target: { scrollTop: 1100 } });
      act(() => triggerIntersect());
      expect(block).toHaveClass('opacity-100');
      expect(block).toHaveStyle({ transitionDuration: '0ms' });
      expect(unobserveMock).not.toHaveBeenCalled();

      fireEvent.scroll(panel, { target: { scrollTop: 0 } });
      act(() => triggerIntersect(false));
      expect(block).toHaveClass('opacity-0');
      fireEvent.scroll(panel, { target: { scrollTop: 1100 } });
      act(() => triggerIntersect());
      expect(block).toHaveClass('opacity-100');
      expect(block).toHaveStyle({ transitionDuration: '700ms' });
      expect(unobserveMock).toHaveBeenCalledTimes(
        triggerMode === 'down-only' ? 1 : 0
      );
    }
  );

  it.each([
    ['down-repeat', '0ms'],
    ['both', '700ms'],
  ] as const)(
    '%s 모드는 설정된 방향으로 재진입할 때마다 재생한다',
    (triggerMode, upwardDuration) => {
      render(
        <ScrollFadeIn
          data-testid="block"
          animationType="fade"
          triggerMode={triggerMode}
        >
          초대합니다
        </ScrollFadeIn>
      );
      const block = screen.getByTestId('block');
      fireEvent.scroll(window, { target: { scrollY: 1100 } });
      act(() => triggerIntersect());
      fireEvent.scroll(window, { target: { scrollY: 1500 } });
      act(() => triggerIntersect(false));
      fireEvent.scroll(window, { target: { scrollY: 1100 } });
      act(() => triggerIntersect());
      expect(block).toHaveClass('opacity-100');
      expect(block).toHaveStyle({ transitionDuration: upwardDuration });

      fireEvent.scroll(window, { target: { scrollY: 0 } });
      act(() => triggerIntersect(false));
      expect(block).toHaveClass('opacity-0');
      fireEvent.scroll(window, { target: { scrollY: 1100 } });
      act(() => triggerIntersect());
      expect(block).toHaveClass('opacity-100');
      expect(block).toHaveStyle({ transitionDuration: '700ms' });
      expect(unobserveMock).not.toHaveBeenCalled();
    }
  );

  it('IntersectionObserver가 없는 환경에서는 즉시 가시화된다', () => {
    // @ts-expect-error Mocking window without IntersectionObserver
    delete window.IntersectionObserver;

    render(
      <ScrollFadeIn data-testid="block" animationType="from-right">
        <div>테스트 컴포넌트</div>
      </ScrollFadeIn>
    );

    const wrapper = screen.getByTestId('block');
    expect(wrapper).toHaveClass('opacity-100');
    expect(wrapper).not.toHaveClass('translate-x-6');
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

    render(
      <ScrollFadeIn data-testid="block" animationType="paired">
        <div>테스트 컴포넌트</div>
      </ScrollFadeIn>
    );

    const wrapper = screen.getByTestId('block');
    expect(wrapper).toHaveClass('opacity-100');
    expect(observeMock).not.toHaveBeenCalled();
  });

  it('애니메이션 완료(transitionEnd) 시 will-change 속성을 해제하며, 자식 이벤트 버블링은 무시한다', () => {
    render(
      <ScrollFadeIn data-testid="block" animationType="fade-up">
        <button type="button">자식 버튼</button>
      </ScrollFadeIn>
    );

    const wrapper = screen.getByTestId('block');
    const childButton = screen.getByRole('button');
    expect(wrapper.className).toContain('will-change-[opacity,transform]');

    act(() => {
      triggerIntersect();
    });

    expect(wrapper).toHaveClass('opacity-100');

    // 자식 컴포넌트에서 발생한 transitionend 버블링은 will-change를 해제하지 않음
    act(() => {
      const bubbleEvent = new Event('transitionend', { bubbles: true });
      childButton.dispatchEvent(bubbleEvent);
    });

    expect(wrapper.className).toContain('will-change-[opacity,transform]');

    // wrapper 본인의 transitionend (opacity 또는 transform) 발생 시 해제
    act(() => {
      const selfEvent = new Event('transitionend', { bubbles: true });
      Object.defineProperty(selfEvent, 'propertyName', { value: 'opacity' });
      wrapper.dispatchEvent(selfEvent);
    });

    expect(wrapper.className).not.toContain('will-change-[opacity,transform]');
  });
});
