import 'server-only';

import * as Sentry from '@sentry/nextjs';

type DriveErrorContext = Record<string, boolean | number | string | undefined>;

function getHttpStatus(error: unknown, fallbackStatus?: number): number | undefined {
  if (typeof fallbackStatus === 'number') return fallbackStatus;

  if (error instanceof Error) {
    const match = error.message.match(/:\s*(\d{3})$/);
    if (match?.[1]) return Number(match[1]);
  }

  const candidate = error as { status?: unknown; code?: unknown };
  const status = candidate?.status ?? candidate?.code;
  return typeof status === 'number' ? status : undefined;
}

export function captureDriveError(params: {
  error: unknown;
  operation: string;
  status?: number;
  context?: DriveErrorContext;
}) {
  const status = getHttpStatus(params.error, params.status);

  // Authentication and invalid-request responses are expected user recovery paths.
  if (status !== undefined && status < 500) return;

  const error =
    params.error instanceof Error
      ? params.error
      : new Error(`Google Drive operation failed: ${params.operation}`);

  Sentry.withScope(scope => {
    scope.setTag('operation', params.operation);
    scope.setTag('error_source', 'google_drive');
    scope.setContext('drive_operation', {
      httpStatus: status,
      ...params.context,
    });
    Sentry.captureException(error);
  });
}
