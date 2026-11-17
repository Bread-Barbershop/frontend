/** @jest-environment node */
jest.mock('./resumableUpload', () => ({ resumableUpload: jest.fn() }));

import { resumableUpload } from './resumableUpload';
import { updateFileToDrive } from './updateFileToDrive';

describe('본문 전송 경로', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(async () =>
      Response.json({ fileId: 'data', name: 'data.json' })
    );
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });
  it('큰 포스터 JSON은 Vercel 요청 본문에 싣지 않고 Drive로 직접 전송한다', async () => {
    jest
      .mocked(resumableUpload)
      .mockResolvedValue({ fileId: 'data', name: 'data.json' });
    const file = new File(
      [JSON.stringify({ poster: 'x'.repeat(2 * 1024 * 1024) })],
      'data.json',
      { type: 'application/json' }
    );
    await updateFileToDrive(file, 'data');
    expect(resumableUpload).toHaveBeenCalledWith(file, '', 'data');
    expect(global.fetch).not.toHaveBeenCalled();
  });
  it('작은 JSON은 토큰 없이 본문 저장 API에 전달한다', async () => {
    await updateFileToDrive(new File(['{}'], 'data.json'), 'data');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/drive/saveData',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });
});
