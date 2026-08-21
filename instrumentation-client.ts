// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

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
  debug: process.env.NEXT_PUBLIC_SENTRY_DEBUG === 'true',

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
});

if (process.env.NEXT_PUBLIC_SENTRY_DEBUG === 'true') {
  const client = Sentry.getClient();

  console.info('[Sentry] client initialization', {
    enabled: client?.getOptions().enabled,
    hasDsn: Boolean(client?.getOptions().dsn),
    environment,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
