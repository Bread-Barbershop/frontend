import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PrivacyNoticeModal from './PrivacyNoticeModal';

describe('PrivacyNoticeModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with Google Drive link and folder info under item 3 when open is true', () => {
    render(<PrivacyNoticeModal open={true} onClose={mockOnClose} />);

    expect(
      screen.getByRole('heading', { name: '안심하고 이용하세요' })
    ).toBeInTheDocument();

    // Check item 3 main text
    expect(
      screen.getByText(/Google Drive 계정에 직접 업로드/i)
    ).toBeInTheDocument();

    // Check callout box content
    expect(
      screen.getByText(/‘나의 모바일 청첩장’/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/우리 청첩장이 안전하게 저장돼요/i)
    ).toBeInTheDocument();

    // Check external link
    const driveLink = screen.getByRole('link', {
      name: /Google Drive\(내 드라이브\) 바로가기/i,
    });
    expect(driveLink).toBeInTheDocument();
    expect(driveLink).toHaveAttribute(
      'href',
      'https://drive.google.com/drive/my-drive'
    );
    expect(driveLink).toHaveAttribute('target', '_blank');
    expect(driveLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('알겠어요 버튼을 누르면 닫기 콜백을 호출한다', () => {
    render(<PrivacyNoticeModal open={true} onClose={mockOnClose} />);

    const confirmButton = screen.getByRole('button', { name: '알겠어요' });
    fireEvent.click(confirmButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('바깥 오버레이를 누르면 확인 없이 안내를 닫는다', async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    render(
      <PrivacyNoticeModal open onClose={mockOnClose} onConfirm={onConfirm} />
    );
    const backdrop = screen.getByRole('dialog').parentElement!;

    await user.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('알겠어요 버튼은 별도로 지정한 확인 콜백을 호출한다', () => {
    const onConfirm = jest.fn();
    render(
      <PrivacyNoticeModal open onClose={mockOnClose} onConfirm={onConfirm} />
    );

    fireEvent.click(screen.getByRole('button', { name: '알겠어요' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    render(<PrivacyNoticeModal open={true} onClose={mockOnClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not render modal when open is false', () => {
    render(<PrivacyNoticeModal open={false} onClose={mockOnClose} />);

    expect(
      screen.queryByRole('heading', { name: /안심하고 이용하세요/i })
    ).not.toBeInTheDocument();
  });

  it('renders mobile variant title correctly', () => {
    render(
      <PrivacyNoticeModal
        open={true}
        onClose={mockOnClose}
        variant="mobileHome"
      />
    );

    expect(
      screen.getByRole('heading', { name: '안심하고 이용하세요.' })
    ).toBeInTheDocument();
  });
});
