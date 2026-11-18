/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toDataURL } from 'qrcode';
import React from 'react';

import {
  QR_DATA_URL,
  SHARE_URL,
} from '@/components/molecules/link-share/fixtures/shareLink';
import { DASHBOARD_PENDING_INVITATION_KEY } from '@/shared/constants/dashboardPendingInvitation';

import {
  familyAudience,
  savedBasicInvitation,
} from './fixtures/invitationAudiences';
import { SaveModal } from './SaveModal';

jest.mock('qrcode', () => ({ toDataURL: jest.fn() }));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('./SaveLottie', () => ({
  SaveLottie: () => <div data-testid="save-animation" />,
}));

describe('SaveModal', () => {
  beforeEach(() => {
    (toDataURL as jest.Mock).mockResolvedValue(QR_DATA_URL);
  });

  const commonProps = {
    isLoading: false,
    isFail: false,
    loadingMessage: '',
    retry: jest.fn(),
    onClose: jest.fn(),
  };

  it('저장은 완료됐지만 공개 준비 중이면 상태를 구분해 안내한다', () => {
    render(
      <SaveModal
        {...commonProps}
        pendingInvitation={{
          invitationFolderId: 'invitation-folder-id',
          invitationUuid: 'invitation-uuid',
          dataJsonFileId: 'data-json-file-id',
          guestUrl: 'https://example.com/i/code',
          published: true,
          ready: false,
          createdAt: new Date(0).toISOString(),
        }}
      />
    );

    expect(
      screen.getByText('저장 완료 · 공개 준비 중이에요.')
    ).toBeInTheDocument();
  });

  it('공개 준비가 완료되면 일반 저장 완료 문구를 표시한다', () => {
    render(
      <SaveModal
        {...commonProps}
        pendingInvitation={{
          invitationFolderId: 'invitation-folder-id',
          invitationUuid: 'invitation-uuid',
          dataJsonFileId: 'data-json-file-id',
          guestUrl: 'https://example.com/i/code',
          published: true,
          ready: true,
          createdAt: new Date(0).toISOString(),
        }}
      />
    );

    expect(screen.getByText('성공적으로 저장되었습니다!')).toBeInTheDocument();
  });

  it('하객용 초대장을 저장한 뒤 나가도 대시보드 임시 카드를 만들지 않는다', () => {
    sessionStorage.removeItem(DASHBOARD_PENDING_INVITATION_KEY);
    render(
      <SaveModal
        {...commonProps}
        skipDashboardHandoff
        pendingInvitation={{
          ...savedBasicInvitation,
          invitationFolderId: familyAudience.folderId,
          invitationUuid: familyAudience.invitationUuid,
          guestUrl: '/i/abc123?to=family',
        }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '여기서 나가기' }));
    expect(sessionStorage.getItem(DASHBOARD_PENDING_INVITATION_KEY)).toBeNull();
  });

  it('저장 후 링크 공유하기를 누르면 링크와 QR을 함께 표시하고 닫으면 완료 화면으로 돌아온다', async () => {
    const user = userEvent.setup();
    render(
      <SaveModal
        {...commonProps}
        pendingInvitation={{
          invitationFolderId: 'invitation-folder-id',
          invitationUuid: 'invitation-uuid',
          dataJsonFileId: 'data-json-file-id',
          guestUrl: SHARE_URL,
          published: true,
          ready: true,
          createdAt: new Date(0).toISOString(),
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: '링크 공유하기' }));

    expect(screen.getByRole('textbox', { name: '초대장 링크' })).toHaveValue(
      SHARE_URL
    );
    expect(
      await screen.findByRole('img', { name: '초대장 공유 QR 코드' })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(
      screen.getByRole('button', { name: '다시 수정하기' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '여기서 나가기' })
    ).toBeInTheDocument();
    expect(commonProps.onClose).not.toHaveBeenCalled();
  });

  it('공개 준비 중인 초대장은 링크와 QR의 접속 가능 시점을 안내한다', async () => {
    const user = userEvent.setup();
    render(
      <SaveModal
        {...commonProps}
        pendingInvitation={{
          invitationFolderId: 'invitation-folder-id',
          invitationUuid: 'invitation-uuid',
          dataJsonFileId: 'data-json-file-id',
          guestUrl: SHARE_URL,
          published: true,
          ready: false,
          createdAt: new Date(0).toISOString(),
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: '링크 공유하기' }));

    expect(
      screen.getByText(/준비가 끝나면 링크와 QR로 접속/)
    ).toBeInTheDocument();
    await screen.findByRole('img', { name: '초대장 공유 QR 코드' });
  });

  it('저장이 실패하면 공유 버튼을 표시하지 않는다', () => {
    render(<SaveModal {...commonProps} isFail pendingInvitation={null} />);

    expect(
      screen.queryByRole('button', { name: '링크 공유하기' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '다시 저장하기' })
    ).toBeInTheDocument();
  });
});
