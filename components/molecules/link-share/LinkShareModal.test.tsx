import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toDataURL } from 'qrcode';

import { QR_DATA_URL, SHARE_URL } from './fixtures/shareLink';
import { LinkShareModal } from './LinkShareModal';

jest.mock('qrcode', () => ({ toDataURL: jest.fn() }));

const mockToDataURL = toDataURL as jest.Mock;

describe('LinkShareModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToDataURL.mockResolvedValue(QR_DATA_URL);
  });

  it('동일한 초대장 URL의 링크와 저장 가능한 QR을 함께 표시한다', async () => {
    render(<LinkShareModal url={SHARE_URL} onClose={jest.fn()} />);

    expect(
      screen.getByRole('dialog', { name: '링크와 QR로 공유하기' })
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: '초대장 링크' })).toHaveValue(
      SHARE_URL
    );
    expect(
      await screen.findByRole('img', { name: '초대장 공유 QR 코드' })
    ).toHaveAttribute('src', QR_DATA_URL);
    expect(mockToDataURL).toHaveBeenCalledWith(
      SHARE_URL,
      expect.objectContaining({ width: 1024, margin: 4 })
    );
    expect(screen.getByRole('link', { name: 'QR 저장하기' })).toHaveAttribute(
      'href',
      QR_DATA_URL
    );
    expect(screen.getByRole('link', { name: 'QR 저장하기' })).toHaveAttribute(
      'download',
      'invitation-qr.png'
    );
  });

  it('상대 경로도 스캔 가능한 절대 URL로 변환해 복사하고 QR을 만든다', async () => {
    const user = userEvent.setup();
    const absoluteUrl = new URL('/i/invitation', window.location.origin).href;
    const writeText = jest.spyOn(navigator.clipboard, 'writeText');
    render(<LinkShareModal url="/i/invitation" onClose={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: '링크 복사하기' }));

    expect(writeText).toHaveBeenCalledWith(absoluteUrl);
    expect(mockToDataURL).toHaveBeenCalledWith(absoluteUrl, expect.any(Object));
    expect(screen.getByText('링크를 복사했어요.')).toBeInTheDocument();
  });

  it('클립보드 권한이 거절되면 링크를 직접 복사하도록 안내하고 QR은 유지한다', async () => {
    const user = userEvent.setup();
    jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(new Error('Clipboard permission denied'));
    render(<LinkShareModal url={SHARE_URL} onClose={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: '링크 복사하기' }));

    expect(screen.getByRole('alert')).toHaveTextContent('직접 복사해 주세요.');
    expect(screen.getByRole('textbox', { name: '초대장 링크' })).toHaveValue(
      SHARE_URL
    );
    expect(
      await screen.findByRole('img', { name: '초대장 공유 QR 코드' })
    ).toBeInTheDocument();
  });

  it('QR 생성에 실패해도 링크를 복사할 수 있고 QR 생성을 재시도할 수 있다', async () => {
    const user = userEvent.setup();
    mockToDataURL.mockRejectedValueOnce(new Error('QR generation failed'));
    const writeText = jest.spyOn(navigator.clipboard, 'writeText');
    render(<LinkShareModal url={SHARE_URL} onClose={jest.fn()} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'QR을 만들지 못했어요.'
    );
    expect(screen.getByRole('button', { name: 'QR 저장하기' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '링크 복사하기' }));
    expect(writeText).toHaveBeenCalledWith(SHARE_URL);

    await user.click(screen.getByRole('button', { name: 'QR 다시 만들기' }));

    expect(
      await screen.findByRole('img', { name: '초대장 공유 QR 코드' })
    ).toBeInTheDocument();
    expect(screen.queryByText('QR을 만들지 못했어요.')).not.toBeInTheDocument();
  });

  it('이전 URL의 QR 생성이 늦게 끝나도 변경된 URL의 QR을 유지한다', async () => {
    let finishPrevious = (value: string): void => {
      throw new Error(`QR 생성 요청이 시작되지 않았어요: ${value}`);
    };
    mockToDataURL.mockImplementationOnce(
      () =>
        new Promise<string>(resolve => {
          finishPrevious = resolve;
        })
    );
    const onClose = jest.fn();
    const { rerender } = render(
      <LinkShareModal url="https://example.com/i/previous" onClose={onClose} />
    );
    await waitFor(() => expect(mockToDataURL).toHaveBeenCalledTimes(1));

    rerender(<LinkShareModal url={SHARE_URL} onClose={onClose} />);
    await screen.findByRole('img', { name: '초대장 공유 QR 코드' });
    finishPrevious('data:image/png;base64,b2xk');

    await waitFor(() => {
      expect(
        screen.getByRole('img', { name: '초대장 공유 QR 코드' })
      ).toHaveAttribute('src', QR_DATA_URL);
    });
  });

  it('Escape로 닫고 모달을 제거하면 스크롤과 기존 포커스를 복원한다', () => {
    const onClose = jest.fn();
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const previousOverflow = document.body.style.overflow;
    const { unmount } = render(
      <LinkShareModal url={SHARE_URL} onClose={onClose} />
    );

    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByRole('dialog')).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    unmount();

    expect(document.body.style.overflow).toBe(previousOverflow);
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
