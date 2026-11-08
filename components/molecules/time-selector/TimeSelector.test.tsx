import { render, screen } from '@testing-library/react';

import { TimeSelector } from './TimeSelector';

jest.mock('@/components/molecules/selector', () => ({
  Selector: ({
    selected,
    placeholder = '선택',
  }: {
    selected: { label: string } | null;
    placeholder?: string;
  }) => <button type="button">{selected?.label ?? placeholder}</button>,
}));

describe('TimeSelector의 미입력 상태', () => {
  it('행사 시간이 저장되지 않았을 때 정오를 선택된 값처럼 표시하지 않는다', () => {
    render(<TimeSelector value="" onChange={jest.fn()} />);
    expect(screen.getAllByRole('button', { name: '선택' })).toHaveLength(3);
    expect(screen.queryByRole('button', { name: '오후' })).not.toBeInTheDocument();
  });

  it('저장된 시간이 있으면 기존처럼 시각을 표시한다', () => {
    render(<TimeSelector value="오후 03:20" onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: '오후' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '03' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
  });
});
