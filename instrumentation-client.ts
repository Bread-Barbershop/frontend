// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import { redactSensitiveTelemetry } from '@/shared/utils/redactSensitiveTelemetry';

const environment =
  process.env.NEXT_PUBLIC_APP_ENV ||
  process.env.NEXT_PUBLIC_VERCEL_ENV ||
  process.env.NODE_ENV;

const release =
  process.env.NEXT_PUBLIC_SENTRY_RELEASE ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment,
  release,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  sendDefaultPii: false,
  beforeBreadcrumb: breadcrumb => redactSensitiveTelemetry(breadcrumb),
  beforeSend: event => redactSensitiveTelemetry(event),
  beforeSendTransaction: event => redactSensitiveTelemetry(event),
  dataCollection: {
    userInfo: false,
    httpBodies: [],
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
