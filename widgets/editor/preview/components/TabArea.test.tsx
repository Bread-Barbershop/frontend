import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import TabArea from './TabArea';

describe('TabArea 컴포넌트', () => {
  const defaultProps = {
    active: 'wedding',
    tabClick: jest.fn(),
    searchQuery: '',
    onSearchChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('탭 목록과 검색 인풋이 정상적으로 렌더링되고 닫기 버튼은 표시하지 않는다', () => {
    render(<TabArea {...defaultProps} />);

    expect(screen.getByText('결혼식')).toBeInTheDocument();
    expect(screen.getByText('돌잔치')).toBeInTheDocument();
    expect(screen.getByText('레이아웃')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('블록 검색')).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: '블록 추가 닫기' })
    ).not.toBeInTheDocument();
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
});
