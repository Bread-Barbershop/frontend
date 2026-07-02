import 'server-only';

import { NextResponse } from 'next/server';

import {
  loadInvitationMeta,
  ShareUrlPayload,
  upsertInvitationMeta,
} from '@/app/api/drive/_lib/ensureInvitationMetaFile';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { guestPath } from '@/app/api/drive/_lib/guestReadiness';
import { getOrCreateShortCode } from '@/app/api/short-url/_lib/shortUrlStore';

function getSharePublicOrigin(req: Request) {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') ||
    new URL(req.url).origin
  );
}

function toAbsoluteUrl(value: string | null | undefined, publicOrigin: string) {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return null;

  try {
    return new URL(trimmedValue, publicOrigin).toString();
  } catch {
    return null;
  }
}

async function createShareDataWithShortUrl(params: {
  invitationFolderId: string;
  dataJsonFileId?: string;
  shareData: ShareUrlPayload;
  publicOrigin: string;
}) {
  const { invitationFolderId, dataJsonFileId, shareData, publicOrigin } =
    params;
  const fallbackGuestUrl =
    toAbsoluteUrl(shareData.invitationUrl, publicOrigin) ??
    shareData.invitationUrl;

  if (!dataJsonFileId?.trim() || !fallbackGuestUrl) {
    return {
      shareData: fallbackGuestUrl
        ? { ...shareData, invitationUrl: fallbackGuestUrl }
        : shareData,
      guestUrl: fallbackGuestUrl,
      shortCode: null,
    };
  }

  try {
    // 짧은 URL 생성은 공유 편의 기능이므로 실패해도 기존 긴 URL 저장으로 fallback한다.
    const shortUrl = await getOrCreateShortCode(
      invitationFolderId,
      dataJsonFileId
    );

    if (!shortUrl) {
      return {
        shareData: {
          ...shareData,
          invitationUrl: fallbackGuestUrl,
        },
        guestUrl: fallbackGuestUrl,
        shortCode: null,
      };
    }

    const shortGuestUrl =
      toAbsoluteUrl(shortUrl.guestPath, publicOrigin) ?? shortUrl.guestPath;

    return {
      shareData: {
        ...shareData,
        invitationUrl: shortGuestUrl,
      },
      guestUrl: shortGuestUrl,
      shortCode: shortUrl.shortCode,
    };
  } catch (error) {
    console.error('short url creation failed:', error);
    return {
      shareData: {
        ...shareData,
        invitationUrl: fallbackGuestUrl,
      },
      guestUrl: fallbackGuestUrl,
      shortCode: null,
    };
  }
}

function isGuestUrl(value?: string | null) {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return false;

  try {
    const { pathname } = new URL(trimmedValue, 'https://invia.co.kr');
    return pathname.startsWith('/i/') || pathname.startsWith('/guest/');
  } catch {
    return false;
  }
}

function resolveShareGuestUrl(params: {
  invitationUrl?: string | null;
  guestUrl?: string | null;
  dataJsonFileId?: string | null;
  publicOrigin: string;
}) {
  const { invitationUrl, guestUrl, dataJsonFileId, publicOrigin } = params;
  const absoluteInvitationUrl = toAbsoluteUrl(invitationUrl, publicOrigin);
  const absoluteGuestUrl = toAbsoluteUrl(guestUrl, publicOrigin);

  if (absoluteInvitationUrl && isGuestUrl(absoluteInvitationUrl)) {
    return absoluteInvitationUrl;
  }
  if (absoluteGuestUrl && isGuestUrl(absoluteGuestUrl)) {
    return absoluteGuestUrl;
  }

  // 기존 메타에 루트 도메인이 저장된 경우에도 최소한 긴 guest URL로 복구한다.
  const normalizedDataJsonFileId = dataJsonFileId?.trim();
  return normalizedDataJsonFileId
    ? toAbsoluteUrl(guestPath(normalizedDataJsonFileId), publicOrigin)
    : null;
}

function createReadableShareData(
  shareData: ShareUrlPayload,
  payload: {
    guestUrl?: string | null;
    dataJsonFileId?: string | null;
  },
  publicOrigin: string
) {
  const guestUrl = resolveShareGuestUrl({
    invitationUrl: shareData.invitationUrl,
    guestUrl: payload.guestUrl,
    dataJsonFileId: payload.dataJsonFileId,
    publicOrigin,
  });

  if (!guestUrl) return shareData;

  return {
    ...shareData,
    invitationUrl: guestUrl,
  };
}

export async function POST(req: Request) {
  try {
    const publicOrigin = getSharePublicOrigin(req);
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

    const shortUrlResult = await createShareDataWithShortUrl({
      invitationFolderId,
      dataJsonFileId,
      shareData,
      publicOrigin,
    });

    const metaPatch: Parameters<typeof upsertInvitationMeta>[1] = {
      kakaoShare: shortUrlResult.shareData,
    };
    if (shortUrlResult.guestUrl) {
      metaPatch.guestUrl = shortUrlResult.guestUrl;
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
      guestUrl: payload.guestUrl,
      dataJsonFileId: payload.dataJsonFileId,
      shortCode: shortUrlResult.shortCode,
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
    const publicOrigin = getSharePublicOrigin(req);
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
      const shareData = createReadableShareData(
        meta.payload.kakaoShare,
        meta.payload,
        publicOrigin
      );

      return NextResponse.json({
        ok: true,
        metaFileId: meta.metaFileId,
        shareUrlFileId: meta.metaFileId,
        data: shareData,
        guestUrl: shareData.invitationUrl ?? meta.payload.guestUrl,
        dataJsonFileId: meta.payload.dataJsonFileId,
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
