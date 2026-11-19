import { fireEvent, render, screen } from '@testing-library/react';

import { getInvitationTemplates } from '@/shared/data/invitationTemplates/catalog';

import { PosterPanel } from './PosterPanel';

const mockApplyTemplate = jest.fn();
jest.mock('@/widgets/editor/preview/hooks/useInvitationTemplate', () => ({
  useInvitationTemplate: () => ({
    applyTemplate: mockApplyTemplate,
    isApplying: false,
  }),
}));

describe('카테고리별 실제 편집 가능한 표지 목록', () => {
  it('카탈로그 전체를 제공하고 웨딩 표지와 생일 표지를 선택해 표지만 적용한다', () => {
    render(<PosterPanel />);
    expect(screen.getAllByRole('button', { name: /표지 적용$/ })).toHaveLength(
      getInvitationTemplates('all').length
    );

    fireEvent.click(
      screen.getByRole('button', { name: '결혼식', exact: true })
    );
    expect(screen.getAllByRole('button', { name: /표지 적용$/ })).toHaveLength(
      getInvitationTemplates('wedding').length
    );
    for (const [name, id] of [
      ['알파인 프로미스', 'showcase-23'],
      ['브릭 시티 웨딩', 'showcase-24'],
      ['정갈한 혼례 초대', 'showcase-44'],
    ]) {
      fireEvent.click(
        screen.getByRole('button', { name: `${name} 표지 적용` })
      );
      expect(mockApplyTemplate).toHaveBeenCalledWith(id, { posterOnly: true });
      mockApplyTemplate.mockClear();
    }

    fireEvent.click(screen.getByRole('button', { name: '생일', exact: true }));
    expect(screen.getAllByRole('button', { name: /표지 적용$/ })).toHaveLength(
      getInvitationTemplates('birthday').length
    );
    expect(
      screen.queryByRole('button', { name: '클래식 모먼트 표지 적용' })
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: '마이 데이 포토 표지 적용' })
    );
    expect(mockApplyTemplate).toHaveBeenCalledWith('showcase-18', {
      posterOnly: true,
    });
  });
});
