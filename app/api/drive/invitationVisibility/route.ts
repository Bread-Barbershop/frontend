import 'server-only';

import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import {
  applyAudienceVisibility,
  withVisibilityLock,
} from '@/app/api/drive/_lib/audienceVisibility';
import { captureDriveError } from '@/app/api/drive/_lib/captureDriveError';
import { ensureDataJsonFile } from '@/app/api/drive/_lib/ensureDataJsonFile';
import {
  loadInvitationMeta,
  upsertInvitationMeta,
} from '@/app/api/drive/_lib/ensureInvitationMetaFile';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import {
  guestPath,
  waitUntilGuestReady,
} from '@/app/api/drive/_lib/guestReadiness';
import {
  getInvitationPublicOrigin,
  getOwnedAudienceLink,
} from '@/app/api/drive/_lib/invitationAudiences';
import {
  getDriveFile,
  PreviewAccessError,
} from '@/app/api/drive/_lib/previewAccess';
import { publishPermissionWithRetry } from '@/app/api/drive/_lib/publishPermissionWithRetry';
import { revokePublicPermissionWithRetry } from '@/app/api/drive/_lib/revokePublicPermissionWithRetry';

type Body = {
  invitationFolderId?: string;
  visible?: boolean;
  preserveAudienceScope?: boolean;
};

const VERIFY_MAX_ATTEMPTS = 3;
const VERIFY_DELAY_MS = 350;

function revalidateGuestCaches(dataJsonFileId: string) {
  revalidateTag(`invitation:${dataJsonFileId}`, { expire: 0 });
  revalidatePath(guestPath(dataJsonFileId));
}

async function resolveVisibilityGuestUrl(
  invitationFolderId: string,
  dataJsonFileId: string
) {
  try {
    const meta = await loadInvitationMeta(invitationFolderId);
    const savedGuestUrl = meta?.payload.guestUrl?.trim();

    // shareUrl 저장 단계에서 만든 /i/{code}가 있으면 공개 상태 변경에서도 유지한다.
    return savedGuestUrl || guestPath(dataJsonFileId);
  } catch {
    return guestPath(dataJsonFileId);
  }
}

export async function POST(req: Request) {
  const { invitationFolderId, visible, preserveAudienceScope } =
    (await req.json()) as Body;

  if (!invitationFolderId) {
    return NextResponse.json(
      { ok: false, error: 'invitationFolderId required' },
      { status: 400 }
    );
  }

  if (typeof visible !== 'boolean') {
    return NextResponse.json(
      { ok: false, error: 'visible boolean required' },
      { status: 400 }
    );
  }

  try {
    const audience = await getOwnedAudienceLink(
      invitationFolderId,
      getInvitationPublicOrigin(req)
    );
    if (audience) {
      const { dataJsonFileId } = await ensureDataJsonFile(invitationFolderId);
      revalidateGuestCaches(dataJsonFileId);
      const ready =
        audience.published &&
        (
          await waitUntilGuestReady(dataJsonFileId, {
            maxAttempts: VERIFY_MAX_ATTEMPTS,
            delayMs: VERIFY_DELAY_MS,
          })
        ).ok;
      return NextResponse.json({
        ok: true,
        inherited: true,
        published: audience.published,
        ready,
        guestUrl: audience.guestUrl,
        dataJsonFileId,
      });
    }
  } catch (error) {
    const status =
      error instanceof PreviewAccessError || error instanceof DriveHttpError
        ? error.status
        : 502;
    captureDriveError({
      error,
      operation: 'drive_audience_visibility',
      status,
    });
    return NextResponse.json(
      { ok: false, error: '초대장의 공개 상태를 확인하지 못했습니다.' },
      { status }
    );
  }

  try {
    return await withVisibilityLock(invitationFolderId, async () => {
      const folder = await getDriveFile(invitationFolderId);
      if (folder?.appProperties?.audience_visibility) {
        const result = await applyAudienceVisibility(
          invitationFolderId,
          visible,
          undefined,
          preserveAudienceScope === true
        );
        const baseVisible =
          result.visibility.published &&
          !result.visibility.pending &&
          result.visibility.publicSlugs.includes('');
        revalidateGuestCaches(result.dataJsonFileId);
        return NextResponse.json({
          ok: true,
          published: preserveAudienceScope
            ? baseVisible
            : result.visibility.published,
          ready:
            baseVisible &&
            (
              await waitUntilGuestReady(result.dataJsonFileId, {
                maxAttempts: VERIFY_MAX_ATTEMPTS,
                delayMs: VERIFY_DELAY_MS,
              })
            ).ok,
          guestUrl: result.guestUrl,
          dataJsonFileId: result.dataJsonFileId,
        });
      }
      return setRootVisibility(invitationFolderId, visible);
    });
  } catch (error) {
    captureDriveError({ error, operation: 'drive_visibility_update' });
    return NextResponse.json(
      { ok: false, error: '초대장의 공개 상태를 변경하지 못했어요.' },
      { status: error instanceof DriveHttpError ? error.status : 502 }
    );
  }
}

async function setRootVisibility(invitationFolderId: string, visible: boolean) {
  const { dataJsonFileId } = await ensureDataJsonFile(invitationFolderId);
  const guestUrl = await resolveVisibilityGuestUrl(
    invitationFolderId,
    dataJsonFileId
  );

  if (!visible) {
    const revokeResult =
      await revokePublicPermissionWithRetry(invitationFolderId);

    if (!revokeResult.ok) {
      const responseStatus =
        revokeResult.status && revokeResult.status >= 400
          ? revokeResult.status
          : 502;

      captureDriveError({
        error: new Error(
          revokeResult.error ?? 'Drive public permission revoke failed'
        ),
        operation: 'drive_visibility_revoke',
        status: responseStatus,
        context: {
          attempts: revokeResult.attempt,
          immediateFail: Boolean(revokeResult.immediateFail),
        },
      });

      return NextResponse.json(
        {
          ok: false,
          published: true,
          ready: false,
          guestUrl,
          dataJsonFileId,
          error: 'visibility_revoke_failed',
          status: responseStatus,
          attempts: revokeResult.attempt,
          immediateFail: Boolean(revokeResult.immediateFail),
          details: revokeResult.details,
          ...(revokeResult.error ? { cause: revokeResult.error } : {}),
        },
        { status: responseStatus }
      );
    }

    await upsertInvitationMeta(invitationFolderId, {
      published: false,
      guestUrl,
      dataJsonFileId,
    });
    revalidateGuestCaches(dataJsonFileId);

    return NextResponse.json({
      ok: true,
      published: false,
      ready: false,
      guestUrl,
      dataJsonFileId,
      ...(revokeResult.ignored ? { ignored: revokeResult.ignored } : {}),
    });
  }

  const permissionResult = await publishPermissionWithRetry(invitationFolderId);

  if (!permissionResult.ok) {
    const responseStatus =
      permissionResult.status && permissionResult.status >= 400
        ? permissionResult.status
        : 502;

    captureDriveError({
      error: new Error(
        permissionResult.error ?? 'Drive public permission publish failed'
      ),
      operation: 'drive_visibility_publish',
      status: responseStatus,
      context: {
        attempts: permissionResult.attempt,
        immediateFail: Boolean(permissionResult.immediateFail),
      },
    });

    return NextResponse.json(
      {
        ok: false,
        published: false,
        ready: false,
        guestUrl,
        dataJsonFileId,
        error: 'visibility_publish_failed',
        status: responseStatus,
        attempts: permissionResult.attempt,
        immediateFail: Boolean(permissionResult.immediateFail),
        details: permissionResult.details,
        ...(permissionResult.error ? { cause: permissionResult.error } : {}),
      },
      { status: responseStatus }
    );
  }

  await upsertInvitationMeta(invitationFolderId, {
    published: true,
    guestUrl,
    dataJsonFileId,
  });
  revalidateGuestCaches(dataJsonFileId);

  const verification = await waitUntilGuestReady(dataJsonFileId, {
    maxAttempts: VERIFY_MAX_ATTEMPTS,
    delayMs: VERIFY_DELAY_MS,
  });

  if (!verification.ok) {
    return NextResponse.json(
      {
        ok: true,
        published: true,
        ready: false,
        guestUrl,
        dataJsonFileId,
        warning: 'guest_not_ready_after_visibility_change',
        status: 202,
        details: verification,
        ...(permissionResult.ignored
          ? { ignored: permissionResult.ignored }
          : {}),
      },
      { status: 202 }
    );
  }

  return NextResponse.json({
    ok: true,
    published: true,
    ready: true,
    guestUrl,
    dataJsonFileId,
    ...(permissionResult.ignored ? { ignored: permissionResult.ignored } : {}),
  });
}
