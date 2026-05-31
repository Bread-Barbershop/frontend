import 'server-only';

import { NextResponse } from 'next/server';

import {
  createAssetsFolders,
  ensureAssetsFolder,
} from '@/app/api/drive/_lib/ensureAssetsFolder';
import {
  createDataJsonFile,
  ensureDataJsonFile,
} from '@/app/api/drive/_lib/ensureDataJsonFile';
import {
  createInvitationFolder,
  ensureInvitationFolder,
} from '@/app/api/drive/_lib/ensureInvitationFolder';
import {
  ensureWorkspace,
  DriveHttpError,
} from '@/app/api/drive/_lib/ensureWorkspace';
import { getFreshAccessToken } from '@/app/api/drive/_lib/getFreshAccessToken';

type PostBody = {
  invitationUuid?: string; // 수정 진입이면 들어옴, 신규면 없음
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as PostBody;
    const invitationUuid = body.invitationUuid;

    const { accessToken, expiresAt } = await getFreshAccessToken();

    // 1) 워크스페이스 폴더 보장
    const { folderId: workspaceFolderId, reused: workspaceReused } =
      await ensureWorkspace();

    const invitation = invitationUuid
      ? await ensureInvitationFolder({
          workspaceFolderId,
          invitationUuid,
        })
      : await createInvitationFolder({ workspaceFolderId });

    const {
      invitationFolderId,
      invitationUuid: finalInvitationUuid,
      reused: invitationReused,
    } = invitation;

    const dataJson = invitationReused
      ? await ensureDataJsonFile(invitationFolderId)
      : await createDataJsonFile(invitationFolderId);

    const assets = invitationReused
      ? await ensureAssetsFolder(invitationFolderId)
      : await createAssetsFolders(invitationFolderId);

    return NextResponse.json({
      workspaceFolderId,
      invitationFolderId,
      invitationUuid: finalInvitationUuid,
      imageFolderId: assets.imageFolderId,
      audioFolderId: assets.audioFolderId,

      dataJsonFileId: dataJson.dataJsonFileId,

      accessToken,
      expiresAt,

      meta: {
        workspaceReused, // 재사용 여부
        invitationReused, // 재사용 여부

        dataJsonReused: dataJson.reused, // 재사용 여부

        assets: assets.meta, // imageReused/audioReused
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'auth_required') {
      return NextResponse.json(
        { message: '재로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    if (err instanceof DriveHttpError) {
      return NextResponse.json(
        { message: err.message, details: err.details },
        { status: err.status }
      );
    }

    return NextResponse.json(
      {
        message: '알 수 없는 오류',
        details: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
