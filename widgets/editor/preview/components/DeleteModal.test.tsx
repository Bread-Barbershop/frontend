import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import DeleteModal from './DeleteModal';

describe('DeleteModal 컴포넌트', () => {
  const defaultProps = {
    onDelete: jest.fn(),
    setIsDeleteModal: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('삭제 확인 문구 및 버튼이 정상 렌더링된다', () => {
    render(<DeleteModal {...defaultProps} />);

    expect(
      screen.getByText('해당 페이지를 삭제하시겠습니까?')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
  });

  it('"예" 버튼 클릭 시 onDelete가 호출된다', () => {
    render(<DeleteModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: '예' }));
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('"아니오" 버튼 클릭 시 setIsDeleteModal(false)가 호출된다', () => {
    render(<DeleteModal {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: '아니오' }));
    expect(defaultProps.setIsDeleteModal).toHaveBeenCalledWith(false);
  });

  it('Escape 키 입력 시 setIsDeleteModal(false)가 호출된다', () => {
    render(<DeleteModal {...defaultProps} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(defaultProps.setIsDeleteModal).toHaveBeenCalledWith(false);
  });
});
