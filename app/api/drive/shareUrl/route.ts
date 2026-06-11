import 'server-only';

import { NextResponse } from 'next/server';

import {
  loadInvitationMeta,
  ShareUrlPayload,
  upsertInvitationMeta,
} from '@/app/api/drive/_lib/ensureInvitationMetaFile';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';

export async function POST(req: Request) {
  try {
    const { invitationFolderId, shareData, dataJsonFileId } =
      (await req.json()) as {
        invitationFolderId: string;
        shareData: ShareUrlPayload;
        dataJsonFileId?: string;
      };

    if (!invitationFolderId) {
      return NextResponse.json(
        { ok: false, error: 'invitationFolderId required' },
        { status: 400 }
      );
    }

    const metaPatch: Parameters<typeof upsertInvitationMeta>[1] = {
      kakaoShare: shareData,
    };
    if (shareData.invitationUrl) {
      metaPatch.guestUrl = shareData.invitationUrl;
    }
    if (typeof dataJsonFileId === 'string' && dataJsonFileId.trim()) {
      metaPatch.dataJsonFileId = dataJsonFileId.trim();
    }

    const { metaFileId, payload } = await upsertInvitationMeta(
      invitationFolderId,
      metaPatch
    );

    return NextResponse.json({
      ok: true,
      metaFileId,
      shareUrlFileId: metaFileId,
      data: payload.kakaoShare,
    });
  } catch (err) {
    if (err instanceof DriveHttpError) {
      return NextResponse.json(
        { ok: false, error: err.message, details: err.details },
        { status: err.status }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const invitationFolderId = searchParams.get('invitationFolderId')?.trim();

    if (!invitationFolderId) {
      return NextResponse.json(
        { ok: false, error: 'invitationFolderId required' },
        { status: 400 }
      );
    }

    const meta = await loadInvitationMeta(invitationFolderId);
    if (meta?.payload.kakaoShare) {
      return NextResponse.json({
        ok: true,
        metaFileId: meta.metaFileId,
        shareUrlFileId: meta.metaFileId,
        data: meta.payload.kakaoShare,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'share data not found in meta.json',
      },
      { status: 404 }
    );
  } catch (err) {
    if (err instanceof DriveHttpError) {
      return NextResponse.json(
        { ok: false, error: err.message, details: err.details },
        { status: err.status }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'unknown error',
      },
      { status: 500 }
    );
  }
}
