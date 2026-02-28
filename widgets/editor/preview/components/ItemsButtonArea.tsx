import { useDndContext } from '@dnd-kit/core';
import { EmblaCarouselType } from 'embla-carousel';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

interface ItemsButtonAreaProps {
  selectedId: string | null;
  portalTarget: HTMLElement | null;
  emblaApi?: EmblaCarouselType | null;
}

function ItemsButtonArea({
  selectedId,
  portalTarget,
  emblaApi,
}: ItemsButtonAreaProps) {
  const deleteBlock = useEditorStore(state => state.deleteBlock);
  // dnd-kit의 draggableNodes 레지스트리를 통해 모든 정렬 가능 요소의 DOM 참조에 접근합니다.
  const { draggableNodes } = useDndContext();
  const [top, setTop] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  /**
   * 선택된 아이템의 현재 DOM 위치를 계산하여 버튼의 top 좌표를 업데이트합니다.
   * dnd-kit의 레지스트리에서 직접 노드를 찾아내므로 상위에서의 ref 전달이 필요 없습니다.
   */
  const updatePosition = useCallback(() => {
    if (!selectedId || !portalTarget) return;

    // selectedId에 해당하는 드래그 가능 노드를 레지스트리에서 가져옵니다.
    const draggableNode = draggableNodes.get(selectedId);
    const itemEl = draggableNode?.node.current;

    if (itemEl) {
      const itemRect = itemEl.getBoundingClientRect();
      const targetRect = portalTarget.getBoundingClientRect();

      // Embla Carousel의 가시 영역(viewport)을 가져옵니다.
      const viewportEl = emblaApi?.rootNode();
      if (viewportEl) {
        const viewportRect = viewportEl.getBoundingClientRect();
        // 아이템의 중앙 지점이 뷰포트 안에 있는지 확인합니다.
        const itemCenter = (itemRect.top + itemRect.bottom) / 2;
        const isWithinViewport =
          itemCenter >= viewportRect.top && itemCenter <= viewportRect.bottom;
        setIsVisible(isWithinViewport);
      } else {
        setIsVisible(true);
      }

      // 포탈 타겟(부모 컨테이너) 대비 상대적인 Y 좌표를 계산합니다.
      setTop(itemRect.top - targetRect.top);
    }
  }, [selectedId, portalTarget, draggableNodes, emblaApi]);

  /**
   * 레이아웃 측정 및 이벤트 구독을 관리합니다.
   * useLayoutEffect를 사용하여 화면 페인팅 직전에 위치를 계산함으로써 깜빡임을 방지합니다.
   */
  useLayoutEffect(() => {
    // 초기 마운트 시 브라우저가 레이아웃을 확정한 후 측정하도록 requestAnimationFrame을 사용합니다.
    const rafId = requestAnimationFrame(updatePosition);

    if (!emblaApi) return () => cancelAnimationFrame(rafId);

    // Embla Carousel의 스크롤 및 재초기화 이벤트를 구독하여 실시간으로 위치를 동기화합니다.
    emblaApi.on('scroll', updatePosition);
    emblaApi.on('reInit', updatePosition);

    return () => {
      cancelAnimationFrame(rafId);
      emblaApi.off('scroll', updatePosition);
      emblaApi.off('reInit', updatePosition);
    };
  }, [emblaApi, updatePosition]);

  // 포탈 타겟이나 선택된 ID가 없거나, 가시 영역을 벗어나면 렌더링하지 않습니다.
  if (!portalTarget || !selectedId || !isVisible) return null;

  /**
   * createPortal을 사용하여 버튼 영역을 캐러셀 외부(portalTarget)로 이동시킵니다.
   * 이를 통해 캐러셀의 overflow: hidden 제약에 버튼이 잘리는 문제를 해결합니다.
   */
  return createPortal(
    <div
      className="absolute -right-13 w-13 py-1 flex gap-0.5 bg-bg-base rounded-tr-sm rounded-br-sm shadow-sm z-50 pointer-events-auto"
      style={{ top: `${top}px` }}
    >
      <span className="w-px h-6 bg-[#EAEAEA]"></span>
      <button type="button" className="w-6 h-6 flex-center">
        <svg
          width="13"
          height="14"
          viewBox="0 0 13 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.75 5.41667H11.75M0.75 8.08333H11.75M4.1875 10.75L6.25 12.75L8.3125 10.75M4.1875 2.75L6.25 0.75L8.3125 2.75"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        className="w-6 h-6 flex-center"
        onPointerDown={() => deleteBlock(selectedId)}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.75 6.75H8.75M0.75 6.75C0.75 7.53793 0.905195 8.31815 1.20672 9.0461C1.50825 9.77405 1.95021 10.4355 2.50736 10.9926C3.06451 11.5498 3.72595 11.9917 4.4539 12.2933C5.18185 12.5948 5.96207 12.75 6.75 12.75C7.53793 12.75 8.31815 12.5948 9.0461 12.2933C9.77405 11.9917 10.4355 11.5498 10.9926 10.9926C11.5498 10.4355 11.9917 9.77405 12.2933 9.0461C12.5948 8.31815 12.75 7.53793 12.75 6.75C12.75 5.96207 12.5948 5.18185 12.2933 4.4539C11.9917 3.72595 11.5498 3.06451 10.9926 2.50736C10.4355 1.95021 9.77405 1.50825 9.0461 1.20672C8.31815 0.905195 7.53793 0.75 6.75 0.75C5.96207 0.75 5.18185 0.905195 4.4539 1.20672C3.72595 1.50825 3.06451 1.95021 2.50736 2.50736C1.95021 3.06451 1.50825 3.72595 1.20672 4.4539C0.905195 5.18185 0.75 5.96207 0.75 6.75Z"
            stroke="#F32E2E"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>,
    portalTarget
  );
}

export default ItemsButtonArea;
