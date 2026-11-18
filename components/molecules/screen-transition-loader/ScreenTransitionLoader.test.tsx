import { render, screen } from '@testing-library/react';

import ScreenTransitionLoader from './ScreenTransitionLoader';

jest.mock('@/shared/assets/logo/invia-logo.svg', () => ({
  __esModule: true,
  default: () => null,
}));

describe('화면 전환 로더', () => {
  it('준비 상태와 Invia 브랜드 이름을 접근 가능한 이름으로 제공한다', () => {
    render(<ScreenTransitionLoader label="에디터를 준비하는 중" />);

    const progressbar = screen.getByRole('progressbar', {
      name: '에디터를 준비하는 중',
    });
    expect(
      screen.getByRole('status', { name: '에디터를 준비하는 중' })
    ).toBeInTheDocument();
    expect(progressbar).not.toHaveAttribute('aria-valuenow');
    expect(
      screen.getByRole('img', { name: 'Invite via Invia' })
    ).toBeInTheDocument();
    expect(screen.getByText('Invite via')).toBeInTheDocument();
  });
});
