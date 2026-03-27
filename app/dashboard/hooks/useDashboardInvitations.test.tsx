/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';

import useDashboardInvitations from '@/app/dashboard/hooks/useDashboardInvitations';

const pushMock = jest.fn();
const replaceMock = jest.fn();
const refreshMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

describe('useDashboardInvitations 테스트', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  it('loadInvitation이 유효하지 않은 요청이면 홈으로 리다이렉트한다', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({
        message: '유효한 요청이 아닙니다.',
      }),
    });

    const { result } = renderHook(() => useDashboardInvitations());

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/');
    });

    expect(refreshMock).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
    expect(result.current.invites).toEqual([]);
  });

  it('loadInvitation이 401이면 홈으로 리다이렉트한다', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({
        message: '재로그인이 필요합니다.',
      }),
    });

    renderHook(() => useDashboardInvitations());

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/');
    });

    expect(refreshMock).toHaveBeenCalled();
  });
});
