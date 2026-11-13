import { act, renderHook } from '@testing-library/react';
import {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';

import { useGallerySwipeClick } from './useGallerySwipeClick';

function dispatchPointerEvent(
  type: 'pointermove' | 'pointerup' | 'pointercancel',
  { pointerId = 1, clientX = 0, clientY = 0 } = {}
) {
  const event = new Event(type);
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    clientX: { value: clientX },
    clientY: { value: clientY },
  });

  act(() => window.dispatchEvent(event));
}

function startPointer(
  handlePointerDown: ReturnType<typeof useGallerySwipeClick>['handlePointerDown'],
  { pointerId = 1, button = 0, isPrimary = true } = {}
) {
  act(() =>
    handlePointerDown({
      pointerId,
      button,
      isPrimary,
      clientX: 0,
      clientY: 0,
    } as ReactPointerEvent)
  );
}

function clickCard(
  handleCardClick: ReturnType<typeof useGallerySwipeClick>['handleCardClick'],
  detail = 1
) {
  act(() => handleCardClick(2, { detail } as ReactMouseEvent));
}

describe('useGallerySwipeClick', () => {
  it('실제 포인터 입력 없이 발생한 이동이나 자동 스크롤은 사진 클릭을 막지 않는다', () => {
    const imageClick = jest.fn();
    const { result } = renderHook(() => useGallerySwipeClick(imageClick));

    dispatchPointerEvent('pointermove', { clientX: 40, clientY: 20 });
    clickCard(result.current.handleCardClick);

    expect(imageClick).toHaveBeenCalledWith(2);
  });

  it('마우스와 터치의 짧은 탭은 사진을 연다', () => {
    const imageClick = jest.fn();
    const { result } = renderHook(() => useGallerySwipeClick(imageClick));

    startPointer(result.current.handlePointerDown, { pointerId: 1 });
    dispatchPointerEvent('pointerup', { pointerId: 1 });
    clickCard(result.current.handleCardClick);

    startPointer(result.current.handlePointerDown, { pointerId: 2 });
    dispatchPointerEvent('pointerup', { pointerId: 2 });
    clickCard(result.current.handleCardClick);

    expect(imageClick).toHaveBeenNthCalledWith(1, 2);
    expect(imageClick).toHaveBeenNthCalledWith(2, 2);
  });

  it('임계치를 넘긴 실제 드래그의 클릭만 한 번 막는다', () => {
    const imageClick = jest.fn();
    const { result } = renderHook(() => useGallerySwipeClick(imageClick));

    startPointer(result.current.handlePointerDown);
    dispatchPointerEvent('pointermove', { clientX: 9 });
    dispatchPointerEvent('pointerup');
    clickCard(result.current.handleCardClick);
    expect(imageClick).not.toHaveBeenCalled();

    startPointer(result.current.handlePointerDown);
    dispatchPointerEvent('pointerup');
    clickCard(result.current.handleCardClick);
    expect(imageClick).toHaveBeenCalledTimes(1);
  });

  it('8px 이하 이동은 클릭으로 처리한다', () => {
    const imageClick = jest.fn();
    const { result } = renderHook(() => useGallerySwipeClick(imageClick));

    startPointer(result.current.handlePointerDown);
    dispatchPointerEvent('pointermove', { clientX: 8 });
    dispatchPointerEvent('pointerup');
    clickCard(result.current.handleCardClick);

    expect(imageClick).toHaveBeenCalledWith(2);
  });

  it('pointercancel과 키보드 활성화는 사진 열기를 차단하지 않는다', () => {
    const imageClick = jest.fn();
    const { result } = renderHook(() => useGallerySwipeClick(imageClick));

    startPointer(result.current.handlePointerDown);
    dispatchPointerEvent('pointermove', { clientX: 20 });
    dispatchPointerEvent('pointercancel');
    clickCard(result.current.handleCardClick);

    startPointer(result.current.handlePointerDown);
    dispatchPointerEvent('pointermove', { clientX: 20 });
    dispatchPointerEvent('pointerup');
    act(() => result.current.handleCardClick(3));

    expect(imageClick).toHaveBeenNthCalledWith(1, 2);
    expect(imageClick).toHaveBeenNthCalledWith(2, 3);
  });
});
