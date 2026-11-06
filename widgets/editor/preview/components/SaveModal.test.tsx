/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import React from 'react';

import { SaveModal } from './SaveModal';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

jest.mock('./SaveLottie', () => ({
  SaveLottie: () => <div data-testid="save-animation" />,
}));

describe('SaveModal', () => {
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
});
