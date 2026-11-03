import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import SortableItems from './SortableItems';

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    setNodeRef: jest.fn(),
    attributes: {},
    listeners: {
      onPointerDown: jest.fn(),
    },
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}));

jest.mock('@/shared/data/componentsInfo/componentInfo', () => ({
  componentCls: [
    {
      english: 'greeting',
      list: [
        {
          component: 'Greeting1',
          contents: <span>인사말 1</span>,
        },
      ],
    },
  ],
}));

describe('SortableItems 컴포넌트', () => {
  const defaultProps = {
    id: 'block-1',
    blockInfo: {
      id: 'block-1',
      type: 'greeting' as const,
      component: 'Greeting1',
      order: 1,
      data: {},
    },
    isSelected: false,
    onSelect: jest.fn(),
    onContextMenu: jest.fn(),
    onDeleteRequest: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('아이템 내용이 정상적으로 렌더링된다', () => {
    render(<SortableItems {...defaultProps} />);

    expect(screen.getByText('인사말 1')).toBeInTheDocument();
  });

  it('호버 시 노출되는 삭제(X) 버튼이 렌더링된다', () => {
    render(<SortableItems {...defaultProps} />);

    const deleteBtn = screen.getByRole('button', { name: '삭제하기' });
    expect(deleteBtn).toBeInTheDocument();
  });

  it('삭제(X) 버튼 클릭 시 onDeleteRequest가 호출되고 onSelect는 호출되지 않는다', () => {
    render(<SortableItems {...defaultProps} />);

    const deleteBtn = screen.getByRole('button', { name: '삭제하기' });

    fireEvent.pointerDown(deleteBtn);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();

    fireEvent.click(deleteBtn);
    expect(defaultProps.onDeleteRequest).toHaveBeenCalledWith('block-1');
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('우클릭 시 onContextMenu가 호출된다', () => {
    render(<SortableItems {...defaultProps} />);

    const item = screen.getByText('인사말 1').closest('[role="button"]')!;
    fireEvent.contextMenu(item);

    expect(defaultProps.onContextMenu).toHaveBeenCalledWith(
      expect.anything(),
      'block-1'
    );
  });
});
