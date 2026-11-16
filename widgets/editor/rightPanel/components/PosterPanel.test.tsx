import { fireEvent, render, screen } from '@testing-library/react';

import { PosterPanel } from './PosterPanel';

const mockApplyTemplate = jest.fn();
jest.mock('@/widgets/editor/preview/hooks/useInvitationTemplate', () => ({
  useInvitationTemplate: () => ({
    applyTemplate: mockApplyTemplate,
    isApplying: false,
  }),
}));

describe('카테고리별 실제 편집 가능한 표지 목록', () => {
  it('23종을 제공하고 생일 분류에서는 해당 디자인만 보여주며 표지만 적용한다', () => {
    render(<PosterPanel />);
    expect(screen.getAllByRole('button', { name: /표지 적용$/ })).toHaveLength(
      23
    );
    fireEvent.click(screen.getByRole('button', { name: '생일', exact: true }));
    expect(screen.getAllByRole('button', { name: /표지 적용$/ })).toHaveLength(
      4
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
