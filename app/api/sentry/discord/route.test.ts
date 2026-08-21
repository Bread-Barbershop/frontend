/**
 * @jest-environment node
 */

import { POST } from '@/app/api/sentry/discord/route';

describe('sentry discord webhook route', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = {
      ...originalEnv,
      DISCORD_SENTRY_WEBHOOK_URL: 'https://discord.example/webhook',
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      text: jest.fn().mockResolvedValue(''),
    }) as jest.Mock;
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('formats an invitation save failure for quick diagnosis', async () => {
    const request = new Request('https://example.com/api/sentry/discord', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'created',
        project: 'frontend',
        data: {
          error: {
            title: 'TypeError: Cannot read properties of undefined',
            culprit: 'app/payment/page.tsx',
            web_url: 'https://sentry.io/issues/123',
            level: 'error',
            release: 'frontend@1.2.3',
            tags: [
              ['environment', 'production'],
              ['operation', 'invitation_save'],
              ['failed_stage', 'upload_images'],
              ['image_failure_count', '17'],
              ['audio_failure_count', '0'],
              ['data_failure_count', '0'],
            ],
          },
        },
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://discord.example/webhook',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const discordBody = JSON.parse(options.body as string);

    expect(discordBody.content).toBe('[운영] 초대장 저장 실패');
    expect(discordBody.embeds[0]).toMatchObject({
      title: '초대장 저장 실패',
      description:
        '이미지 업로드(upload_images) 단계에서 이미지 17개 업로드에 실패했습니다.',
    });
    expect(discordBody.embeds[0].fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: '단계',
          value: '이미지 업로드(upload_images)',
        }),
        expect.objectContaining({
          name: '오류',
          value: 'TypeError: Cannot read properties of undefined',
        }),
        expect.objectContaining({
          name: '환경',
          value: '운영(production)',
        }),
      ])
    );
  });

  it('returns 502 when discord rejects the request', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue('bad request'),
    }) as jest.Mock;

    const request = new Request('https://example.com/api/sentry/discord', {
      method: 'POST',
      body: JSON.stringify({ data: { error: { title: 'Drive error' } } }),
    });

    const response = await POST(request);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Discord webhook request failed.',
      status: 400,
      details: 'bad request',
    });
  });

  it('forwards a payload without a drive operation tag', async () => {
    const request = new Request('https://example.com/api/sentry/discord', {
      method: 'POST',
      body: JSON.stringify({
        action: 'triggered',
        data: {
          error: {
            title: 'Unhandled error',
            tags: [['environment', 'preview']],
          },
        },
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
