/** @jest-environment node */
import { resumableUpload } from './resumableUpload';

describe('Google 토큰 없는 재개 업로드', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });
  it('이미 받은 바이트 다음부터 전송하고 서버에서 완료를 검증한다', async () => {
    const calls: Array<{ url: string; init?: Parameters<typeof fetch>[1] }> =
      [];
    global.fetch = jest.fn(async (input, init) => {
      const url = String(input);
      calls.push({ url, init });
      if (url === '/api/drive/uploadSession')
        return Response.json({
          uploadId: 'upload',
          uploadUrl:
            'https://www.googleapis.com/upload/drive/v3/files?upload_id=fake',
        });
      if (url === '/api/drive/uploadComplete')
        return Response.json({ fileId: 'file', name: 'photo.jpg' });
      if (
        new Headers(init?.headers).get('content-range')?.startsWith('bytes */')
      )
        return new Response(null, {
          status: 308,
          headers: { Range: 'bytes=0-262143' },
        });
      return Response.json({ id: 'file' });
    });
    const result = await resumableUpload(
      new File([new Uint8Array(524288)], 'photo.jpg', { type: 'image/jpeg' }),
      'images'
    );
    expect(result.fileId).toBe('file');
    const chunks = calls.filter(call => call.url.startsWith('https:'));
    expect(new Headers(chunks[1].init?.headers).get('content-range')).toBe(
      'bytes 262144-524287/524288'
    );
    chunks.forEach(call =>
      expect(new Headers(call.init?.headers).has('authorization')).toBe(false)
    );
    expect(calls.at(-1)?.url).toBe('/api/drive/uploadComplete');
  });
  it('이미 완료된 파일은 다시 전송하지 않고 서버에서 검증한다', async () => {
    global.fetch = jest.fn(async input =>
      String(input).endsWith('uploadSession')
        ? Response.json({ complete: true, uploadId: 'upload' })
        : Response.json({ fileId: 'file', name: 'photo.jpg' })
    );
    await resumableUpload(
      new File(['photo'], 'photo.jpg', { type: 'image/jpeg' }),
      'images'
    );
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
