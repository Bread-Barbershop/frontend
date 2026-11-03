import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import ContentsArea from './ContentsArea';

jest.mock('@/shared/store/editorStore/useEditorStore');

describe('ContentsArea 컴포넌트', () => {
  const mockAddBlock = jest.fn();
  const mockSelectedBlock = jest.fn();
  const mockAddAllBlock = jest.fn();
  const mockSetIsEdit = jest.fn();

  const scrollContainerRef = { current: document.createElement('div') };
  const sectionRefs = { current: {} };

  beforeEach(() => {
    jest.clearAllMocks();
    (useEditorStore as unknown as jest.Mock).mockReturnValue({
      addBlock: mockAddBlock,
      selectedBlock: mockSelectedBlock,
      addAllBlock: mockAddAllBlock,
      setIsEdit: mockSetIsEdit,
    });
  });

  it('검색어가 없을 때 기본 카테고리와 컴포넌트들이 렌더링된다', () => {
    render(
      <ContentsArea
        scrollContainerRef={scrollContainerRef}
        sectionRefs={sectionRefs}
        searchQuery=""
      />
    );

    expect(screen.getByText('결혼식')).toBeInTheDocument();
    expect(screen.getAllByText('인사말').length).toBeGreaterThan(0);
  });

  it('검색어 입력 시 일치하는 컴포넌트만 필터링되어 렌더링된다', () => {
    render(
      <ContentsArea
        scrollContainerRef={scrollContainerRef}
        sectionRefs={sectionRefs}
        searchQuery="신랑신부"
      />
    );

    expect(screen.getByText('신랑신부소개')).toBeInTheDocument();
    // '신랑신부소개'가 없는 생일, 세미나 등은 노출되지 않음
    expect(screen.queryByText('생일')).not.toBeInTheDocument();
  });

  it('일치하는 결과가 없으면 검색 결과 없음 안내가 렌더링된다', () => {
    render(
      <ContentsArea
        scrollContainerRef={scrollContainerRef}
        sectionRefs={sectionRefs}
        searchQuery="일치하지않는컴포넌트명xyz"
      />
    );

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('컴포넌트 클릭 시 addBlock 및 selectedBlock이 호출된다', () => {
    render(
      <ContentsArea
        scrollContainerRef={scrollContainerRef}
        sectionRefs={sectionRefs}
        searchQuery="신랑신부"
      />
    );

    const item = screen.getByText('신랑신부소개').closest('li')!;
    fireEvent.click(item);

    expect(mockAddBlock).toHaveBeenCalledWith(
      'wedding',
      'coupleIntroduction',
      expect.any(String)
    );
    expect(mockSelectedBlock).toHaveBeenCalledWith(expect.any(String));
    expect(mockSetIsEdit).toHaveBeenCalledWith(false);
  });
});
