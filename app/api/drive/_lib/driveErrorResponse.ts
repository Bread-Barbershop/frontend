import { NextResponse } from 'next/server';

import { AuthStorageError } from '@/app/api/auth/_lib/authStorage';
import { SessionRequiredError } from '@/app/api/auth/_lib/serverSession';

import { DriveHttpError } from './ensureWorkspace';

export function driveErrorResponse(error: unknown) {
  const status =
    error instanceof DriveHttpError ||
    error instanceof AuthStorageError ||
    error instanceof SessionRequiredError
      ? error.status
      : 503;
  return NextResponse.json(
    {
      error:
        status === 401
          ? 'auth_required'
          : status === 403
            ? 'drive_access_denied'
            : 'drive_request_failed',
      message:
        error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.',
    },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        ...(status === 409 || status === 429 || status === 503
          ? { 'Retry-After': '3' }
          : {}),
      },
    }
  );
}
