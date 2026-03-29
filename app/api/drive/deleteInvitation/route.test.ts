/**
 * @jest-environment node
 */

jest.mock('@/app/api/drive/_lib/googleFetch', () => ({
  googleFetch: jest.fn(),
}));

import { DELETE } from '@/app/api/drive/deleteInvitation/route';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

describe('deleteInvitation Route Handler 테스트', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('folderId가 없으면 400을 반환한다', async () => {
    const req = new Request('http://localhost/api/drive/deleteInvitation', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toEqual({
      success: false,
      message: 'folderId가 필요합니다.',
    });
    expect(googleFetch).not.toHaveBeenCalled();
  });

  it('삭제가 성공하면 success true를 반환한다', async () => {
    (googleFetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 204,
      json: jest.fn(),
    });

    const req = new Request('http://localhost/api/drive/deleteInvitation', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderId: 'folder-123' }),
    });

    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ success: true });
    expect(googleFetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/drive/v3/files/folder-123',
      { method: 'DELETE' }
    );
  });

  it('Drive 삭제가 실패하면 에러 응답을 반환한다', async () => {
    (googleFetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      json: jest.fn().mockResolvedValue({
        error: { message: 'forbidden' },
      }),
    });

    const req = new Request('http://localhost/api/drive/deleteInvitation', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderId: 'folder-403' }),
    });

    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(403);
    expect(json).toEqual({
      success: false,
      message: '폴더 삭제에 실패했습니다.',
      error: { error: { message: 'forbidden' } },
    });
  });

  it('예외가 발생하면 500을 반환한다', async () => {
    (googleFetch as jest.Mock).mockRejectedValue(new Error('unexpected failure'));

    const req = new Request('http://localhost/api/drive/deleteInvitation', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderId: 'folder-500' }),
    });

    const res = await DELETE(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json).toEqual({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  });
});
