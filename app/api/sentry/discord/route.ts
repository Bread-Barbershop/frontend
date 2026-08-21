import 'server-only';

import { NextResponse } from 'next/server';

import {
  buildDiscordWebhookBody,
  isAuthorizedSentryWebhook,
  type SentryWebhookPayload,
} from '@/app/api/sentry/discord/_lib/discordWebhook';

export const dynamic = 'force-dynamic';

function getDiscordWebhookUrl() {
  return process.env.DISCORD_SENTRY_WEBHOOK_URL?.trim();
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Sentry Discord webhook endpoint is ready.',
  });
}

export async function POST(request: Request) {
  const discordWebhookUrl = getDiscordWebhookUrl();

  if (!discordWebhookUrl) {
    return NextResponse.json(
      {
        ok: false,
        error: 'DISCORD_SENTRY_WEBHOOK_URL is not configured.',
      },
      { status: 500 }
    );
  }

  if (!isAuthorizedSentryWebhook(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Unauthorized webhook request.',
      },
      { status: 401 }
    );
  }

  const rawBody = await request.text();
  let payload: SentryWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as SentryWebhookPayload;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid JSON payload.',
      },
      { status: 400 }
    );
  }

  const discordPayload = buildDiscordWebhookBody(payload);
  let discordResponse: Response;

  try {
    discordResponse = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Discord webhook request failed.',
        details:
          error instanceof Error ? error.message : 'Unknown fetch error.',
      },
      { status: 502 }
    );
  }

  if (!discordResponse.ok) {
    const responseText = await discordResponse.text();

    return NextResponse.json(
      {
        ok: false,
        error: 'Discord webhook request failed.',
        status: discordResponse.status,
        details: responseText,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
  });
}
