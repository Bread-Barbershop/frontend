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

  it('forwards a sentry payload to discord with an environment label', async () => {
    const request = new Request('https://example.com/api/sentry/discord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'triggered',
        project: 'frontend',
        data: {
          issue: {
            title: 'TypeError: Cannot read properties of undefined',
            culprit: 'app/payment/page.tsx',
            permalink: 'https://sentry.io/issues/123',
          },
          event: {
            level: 'error',
            release: 'frontend@1.2.3',
            environment: 'production',
          },
        },
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://discord.example/webhook',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    const [, options] = (global.fetch as jest.Mock).mock.calls[0];
    const discordBody = JSON.parse(options.body as string);

    expect(discordBody.content).toBe('[운영] Sentry triggered');
    expect(discordBody.embeds[0].title).toBe(
      '[운영] TypeError: Cannot read properties of undefined'
    );
    expect(discordBody.embeds[0].fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: '환경',
          value: '운영 (production)',
        }),
        expect.objectContaining({
          name: '프로젝트',
          value: 'frontend',
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
      body: JSON.stringify({
        action: 'triggered',
        data: {
          event: {
            environment: 'preview',
          },
        },
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(502);
    expect(json).toEqual({
      ok: false,
      error: 'Discord webhook request failed.',
      status: 400,
      details: 'bad request',
    });
  });
});
