import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';

import Carousel from '@/features/EmblaCarousel/Carousel/Carousel';

import { SortablePreviewBlock } from './SortablePreviewBlock';

jest.mock('embla-carousel-react', () => ({
  __esModule: true,
  default: () => [jest.fn(), undefined],
}));

function PreviewBlocks() {
  const [items, setItems] = useState(['첫 번째', '두 번째']);
  const [clicked, setClicked] = useState(false);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <DndContext
      sensors={sensors}
      autoScroll={false}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (over)
          setItems(current =>
            arrayMove(
              current,
              current.indexOf(String(active.id)),
              current.indexOf(String(over.id))
            )
          );
      }}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map(id => (
          <SortablePreviewBlock
            key={id}
            id={id}
            label={id}
            selected
            backgroundColor="#fff"
            registerNode={() => {}}
          >
            <p>{id} 본문</p>
            <Carousel>
              <div>
                <p>{id} 카드 본문</p>
              </div>
            </Carousel>
            <button type="button" onClick={() => setClicked(true)}>
              {id} 내용 보기
            </button>
            <input aria-label={`${id} 입력`} />
          </SortablePreviewBlock>
        ))}
      </SortableContext>
      {clicked && <p>내용을 열었어요</p>}
    </DndContext>
  );
}

function blockOrder() {
  return Array.from(document.querySelectorAll('[data-preview-block-id]')).map(
    element => element.getAttribute('data-preview-block-id')
  );
}

describe('미리보기 블록 드래그', () => {
  beforeEach(() => {
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      // eslint-disable-next-line no-unused-vars -- TypeScript receiver type, not a runtime parameter.
      .mockImplementation(function (this: HTMLElement) {
        const nodes = Array.from(
          document.querySelectorAll('[data-preview-block-id]')
        );
        const block = this.closest('[data-preview-block-id]');
        const top = block ? nodes.indexOf(block) * 120 : 0;
        return {
          x: 0,
          y: top,
          top,
          left: 0,
          bottom: top + 100,
          right: 375,
          width: 375,
          height: 100,
          toJSON: () => ({}),
        };
      });
  });

  afterEach(async () => {
    // dnd-kit removes its document click suppression 50ms after a pointer drop.
    await new Promise(resolve => setTimeout(resolve, 60));
    jest.restoreAllMocks();
  });

  it('본문을 끌면 이웃 블록이 이동하고 놓은 순서로 바뀐다', async () => {
    render(<PreviewBlocks />);
    fireEvent.mouseDown(screen.getByText('첫 번째 본문'), {
      button: 0,
      clientX: 100,
      clientY: 40,
    });
    fireEvent.mouseMove(document, { clientX: 100, clientY: 60 });
    await waitFor(() =>
      expect(screen.getByLabelText('첫 번째 순서 변경')).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    );
    fireEvent.mouseMove(document, { clientX: 100, clientY: 170 });
    await waitFor(() =>
      expect(
        document.querySelector('[data-preview-block-id="두 번째"]')
      ).toHaveStyle({ transform: 'translate3d(0px, -120px, 0)' })
    );
    fireEvent.mouseUp(document);
    await waitFor(() => expect(blockOrder()).toEqual(['두 번째', '첫 번째']));
  });

  it('블록 안의 버튼과 입력창은 드래그를 시작하지 않고 조작할 수 있다', () => {
    render(<PreviewBlocks />);
    const button = screen.getByRole('button', { name: '첫 번째 내용 보기' });
    fireEvent.mouseDown(button, { button: 0, clientX: 100, clientY: 40 });
    fireEvent.mouseMove(document, { clientX: 100, clientY: 170 });
    fireEvent.mouseUp(document);
    fireEvent.click(button);
    fireEvent.change(screen.getByLabelText('첫 번째 입력'), {
      target: { value: '축하합니다' },
    });
    expect(screen.getByText('내용을 열었어요')).toBeInTheDocument();
    expect(screen.getByLabelText('첫 번째 입력')).toHaveValue('축하합니다');
    expect(screen.getByLabelText('첫 번째 순서 변경')).not.toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(blockOrder()).toEqual(['첫 번째', '두 번째']);
  });

  it('키보드로 이동하다 Escape로 취소하면 원래 순서를 유지한다', async () => {
    render(<PreviewBlocks />);
    const handle = screen.getByLabelText('첫 번째 순서 변경');
    handle.focus();
    fireEvent.keyDown(handle, { key: ' ', code: 'Space' });
    await waitFor(() => expect(handle).toHaveAttribute('aria-pressed', 'true'));
    fireEvent.keyDown(document, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await waitFor(() =>
      expect(handle).not.toHaveAttribute('aria-pressed', 'true')
    );
    expect(blockOrder()).toEqual(['첫 번째', '두 번째']);
  });

  it('캐러셀 카드 본문을 대각선으로 스와이프해도 블록 정렬을 시작하지 않는다', () => {
    render(<PreviewBlocks />);
    fireEvent.mouseDown(screen.getByText('첫 번째 카드 본문'), {
      button: 0,
      clientX: 150,
      clientY: 40,
    });
    fireEvent.mouseMove(document, { clientX: 70, clientY: 90 });
    fireEvent.mouseMove(document, { clientX: 20, clientY: 170 });
    expect(screen.getByLabelText('첫 번째 순서 변경')).not.toHaveAttribute(
      'aria-pressed',
      'true'
    );
    fireEvent.mouseUp(document);
    expect(blockOrder()).toEqual(['첫 번째', '두 번째']);
  });
});
