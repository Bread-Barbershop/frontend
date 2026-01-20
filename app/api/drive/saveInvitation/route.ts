import 'server-only';

import { NextResponse } from 'next/server';

import { ensureAssetsFolder } from '@/app/api/drive/_lib/ensureAssetsFolder';
import { ensureInvitationFolder } from '@/app/api/drive/_lib/ensureInvitationFolder';
import {
  ensureWorkspace,
  DriveHttpError,
} from '@/app/api/drive/_lib/ensureWorkspace';

export async function POST() {
  try {
    // 1) 워크스페이스 폴더 보장
    const { folderId: workspaceFolderId, reused: workspaceReused } =
      await ensureWorkspace();

    // 2) 초대장 폴더 보장 (workspace 하위)
    const { invitationFolderId, reused: invitationReused } =
      await ensureInvitationFolder(workspaceFolderId);

    // 3) 에셋 폴더(이미지/오디오) 보장 (invitation 하위)
    const assets = await ensureAssetsFolder(invitationFolderId);

    return NextResponse.json({
      workspaceFolderId,
      invitationFolderId,
      imageFolderId: assets.imageFolderId,
      audioFolderId: assets.audioFolderId,
      meta: {
        workspaceReused,
        invitationReused,
        assets: assets.meta, // imageReused/audioReused
      },
    });
  } catch (err) {
    // Drive API 에러(status 포함)는 그대로 전달
    if (err instanceof DriveHttpError) {
      return NextResponse.json(
        { message: err.message, details: err.details },
        { status: err.status }
      );
    }

    // 그 외는 500
    return NextResponse.json(
      {
        message: '알 수 없는 오류',
        details: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}
