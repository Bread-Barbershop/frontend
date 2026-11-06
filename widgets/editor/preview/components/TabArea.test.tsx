import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import TabArea from './TabArea';

describe('TabArea 컴포넌트', () => {
  const defaultProps = {
    active: 'wedding',
    tabClick: jest.fn(),
    closeClick: jest.fn(),
    searchQuery: '',
    onSearchChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('탭 목록, 검색 인풋, 닫기 버튼이 정상적으로 렌더링된다', () => {
    render(<TabArea {...defaultProps} />);

    expect(screen.getByText('결혼식')).toBeInTheDocument();
    expect(screen.getByText('돌잔치')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('블록 검색')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '닫기' })).toBeInTheDocument();
  });

  it('검색 인풋에 텍스트 입력 시 onSearchChange가 호출된다', () => {
    render(<TabArea {...defaultProps} />);

    const input = screen.getByPlaceholderText('블록 검색');
    fireEvent.change(input, { target: { value: '인사말' } });

    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('인사말');
  });

  it('검색어가 있을 때 검색어 지우기(X) 버튼을 누르면 빈 문자열로 초기화된다', () => {
    render(<TabArea {...defaultProps} searchQuery="갤러리" />);

    const clearBtn = screen.getByRole('button', { name: '검색어 지우기' });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('');
  });

  it('닫기 버튼 클릭 시 closeClick이 호출된다', () => {
    render(<TabArea {...defaultProps} />);

    const closeBtn = screen.getByRole('button', { name: '닫기' });
    fireEvent.click(closeBtn);

    expect(defaultProps.closeClick).toHaveBeenCalledTimes(1);
  });
});
