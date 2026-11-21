import { NextResponse } from 'next/server';

import { validateAudienceSlug } from '@/features/invitation/audiences/model';

import {
  applyAudienceVisibility,
  getVisibilityOptions,
  withVisibilityLock,
} from '../_lib/audienceVisibility';
import { captureDriveError } from '../_lib/captureDriveError';
import { DriveHttpError } from '../_lib/ensureWorkspace';
import { PreviewAccessError } from '../_lib/previewAccess';

export const maxDuration = 120;
const headers = { 'Cache-Control': 'no-store' };
const validId = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
function failure(error: unknown) {
  if (error instanceof PreviewAccessError)
    return NextResponse.json(
      { message: error.userMessage },
      { status: error.status, headers }
    );
  if (error instanceof DriveHttpError)
    return NextResponse.json(
      { message: error.message },
      { status: error.status, headers }
    );
  captureDriveError({ error, operation: 'drive_audience_visibility_settings' });
  return NextResponse.json(
    { message: '공개 범위를 확인하지 못했어요. 다시 시도해 주세요.' },
    { status: 503, headers }
  );
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('folderId');
  if (!validId(id))
    return NextResponse.json(
      { message: '행사를 확인해 주세요.' },
      { status: 400, headers }
    );
  try {
    return NextResponse.json(await getVisibilityOptions(id), { headers });
  } catch (error) {
    return failure(error);
  }
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !validId(body?.folderId) ||
    typeof body.published !== 'boolean' ||
    typeof body.revision !== 'string' ||
    !Array.isArray(body.publicSlugs) ||
    !body.publicSlugs.every(
      (slug: unknown) =>
        typeof slug === 'string' && (slug === '' || !validateAudienceSlug(slug))
    )
  ) {
    return NextResponse.json(
      { message: '공개 범위를 확인해 주세요.' },
      { status: 400, headers }
    );
  }
  try {
    return NextResponse.json(
      await withVisibilityLock(body.folderId, () =>
        applyAudienceVisibility(body.folderId, body.published, {
          publicSlugs: body.publicSlugs,
          revision: body.revision,
        })
      ),
      { headers }
    );
  } catch (error) {
    return failure(error);
  }
}
