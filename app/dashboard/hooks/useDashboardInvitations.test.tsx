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

describe('useDashboardInvitations', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  it('redirects home when loadInvitation returns an invalid request error', async () => {
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

  it('redirects home when loadInvitation returns 401', async () => {
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

  it('hydrates publishedUrl from the initial invitation load', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        workspaceFolderId: 'workspace-folder-1',
        invites: [
          {
            folderId: 'folder-1',
            name: 'Invitation 1',
            createdTime: '2026-03-21T10:00:00.000Z',
            invitationUuid: 'uuid-1',
            publishedUrl: '/guest/data-json-file-id-1',
          },
          {
            folderId: 'folder-2',
            name: 'Invitation 2',
            createdTime: '2026-03-20T10:00:00.000Z',
            invitationUuid: 'uuid-2',
            publishedUrl: null,
          },
        ],
        nextPageToken: null,
      }),
    });

    const { result } = renderHook(() => useDashboardInvitations());

    await waitFor(() => {
      expect(result.current.invites).toHaveLength(2);
    });

    expect(result.current.getPublishedUrl('folder-1')).toBe(
      'http://localhost/guest/data-json-file-id-1'
    );
    expect(result.current.getPublishedUrl('folder-2')).toBeNull();
  });
});
