import 'server-only';

import { NextResponse } from 'next/server';

import { ensureAssetsFolder } from '@/app/api/drive/_lib/ensureAssetsFolder';
import { ensureInvitationFolder } from '@/app/api/drive/_lib/ensureInvitationFolder';
import {
  ensureWorkspace,
  DriveHttpError,
} from '@/app/api/drive/_lib/ensureWorkspace';

type PostBody = {
  invitationUuid?: string; // 수정 진입이면 들어옴, 신규면 없음
};

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as PostBody;
    const invitationUuid = body.invitationUuid;

    // 1) 워크스페이스 폴더 보장
    const { folderId: workspaceFolderId, reused: workspaceReused } =
      await ensureWorkspace();

    // 2) 초대장 폴더 보장 (workspace 하위, uuid 기반)
    const {
      invitationFolderId,
      invitationUuid: finalInvitationUuid
,
      reused: invitationReused,
    } = await ensureInvitationFolder({
      workspaceFolderId,
      invitationUuid,
    });

    // 3) 에셋 폴더(이미지/오디오) 보장 (invitation 하위)
    const assets = await ensureAssetsFolder(invitationFolderId);

    return NextResponse.json({
      workspaceFolderId,
      invitationFolderId,
      invitationUuid: finalInvitationUuid,
      imageFolderId: assets.imageFolderId,
      audioFolderId: assets.audioFolderId,
      meta: {
        workspaceReused,
        invitationReused,
        assets: assets.meta, // imageReused/audioReused
      },
    });
  } catch (err) {
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
