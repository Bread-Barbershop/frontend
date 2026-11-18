import { NextResponse } from 'next/server';

import { ResponseData } from '@/app/editor/[id]/types/savedata';
import { DEFAULT_SCROLL_ANIMATION } from '@/components/molecules/scroll-fade-in/animationConfig';
import { BODY_BULK_DATA, TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
import { PersistedEditorBlock } from '@/shared/types/block';

import { assertInvitationAccess } from '../_lib/driveAccess';
import { DriveHttpError } from '../_lib/ensureWorkspace';
import {
  downloadFiles,
  getFilesInFolder,
  loadInvitations,
} from '../_lib/getSaveDataFetch';
import { AUDIENCE_UUID_PREFIX } from '../_lib/invitationAudienceFolders';
import {
  assertInvitationFolderAccess,
  PreviewAccessError,
} from '../_lib/previewAccess';

const normalizePersistedBlocks = (blocks: unknown): PersistedEditorBlock[] => {
  if (!Array.isArray(blocks)) return [];

  return blocks.filter(
    (block): block is PersistedEditorBlock =>
      typeof block === 'object' &&
      block !== null &&
      'component' in block &&
      (block as { component?: unknown }).component !== 'shareUrl'
  );
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');
  const uuid = searchParams.get('uuid');

  // 반환할 데이터 구조 정의
  const responseData: ResponseData = {
    config: {
      bulkData: {
        backgroundColor: '#FFFFFF',
        titleData: TITLE_BULK_DATA,
        bodyData: BODY_BULK_DATA,
        isZoom: false,
        scrollAnimation: DEFAULT_SCROLL_ANIMATION,
      },
      blocks: [], // singular
      mainPoster: '',
      bgm: {
        selectedBgmId: null,
        isLoop: false,
        volume: 0.2,
        userBgmTitle: null,
        userBgmDuration: null,
        userBgmFileId: null,
      },
      invitationImage: [],
    }, // data.json 내용
    images: {}, // 이미지 파일 목록 (ID, Name 등)
    audios: {}, // 오디오 파일 목록
    imageFolderId: '',
    audioFolderId: '',
  };

  try {
    await assertInvitationAccess(fileId ?? '');
    let audienceName: string | undefined;
    if (fileId && uuid?.startsWith(AUDIENCE_UUID_PREFIX)) {
      const { audience } = await assertInvitationFolderAccess(fileId, {
        ownedOnly: true,
      });
      if (audience?.invitationUuid !== uuid) {
        throw new PreviewAccessError({
          code: 'INVITATION_NOT_FOUND',
          status: 404,
          message: 'Audience editor UUID does not match folder',
          userMessage: '하객 그룹을 찾을 수 없습니다.',
        });
      }
      audienceName = audience.name;
    }
    const result = await loadInvitations(fileId);

    if (!result || !result.files || result.files.length === 0) {
      throw new Error('초대장 목록이 없거나 불러오지 못했습니다.');
    }

    // Early invitations had no per-file markers. Only recognize a unique, owned canonical child of the validated invitation.
    const legacyChild = (
      file: NonNullable<typeof result.files>[number],
      name: string
    ) =>
      file.ownedByMe === true &&
      file.parents?.includes(fileId ?? '') &&
      !file.appProperties?.kind &&
      !file.appProperties?.app_id &&
      file.name === name;
    const marked = result.files.find(
      file =>
        file.mimeType === 'application/json' &&
        file.appProperties?.kind === 'invitation_data_json' &&
        file.appProperties.app_id === 'Bread-Barbershop'
    );
    const legacy = result.files.filter(
      file =>
        file.mimeType === 'application/json' && legacyChild(file, 'data.json')
    );
    const dataFile = marked ?? (legacy.length === 1 ? legacy[0] : undefined);
    const fileContent = dataFile?.id ? await downloadFiles(dataFile.id) : null;
    if (
      !fileContent ||
      typeof fileContent !== 'object' ||
      Array.isArray(fileContent) ||
      !fileContent.bgm
    ) {
      throw new Error('저장된 초대장 데이터를 불러오지 못했습니다.');
    }
    responseData.config = {
      bulkData: fileContent.bulkData,
      blocks: normalizePersistedBlocks(fileContent.blocks),
      mainPoster: fileContent.mainPoster,
      bgm: fileContent.bgm,
      invitationImage: fileContent.invitationImage,
      shareUrl: fileContent.shareUrl,
    };

    for (const file of result.files) {
      // 1. 폴더인 경우: 내부 파일 리스트(ID, Name)만 수집
      if (file.mimeType?.includes('folder')) {
        if (!file.id) continue;
        const kind =
          file.appProperties?.app_id === 'Bread-Barbershop'
            ? file.appProperties.kind
            : undefined;
        if (kind === 'assets_images' || legacyChild(file, 'images')) {
          const images = await getFilesInFolder(file.id);
          if (!images)
            throw new Error('저장된 이미지 목록을 불러오지 못했습니다.');
          responseData.imageFolderId = file.id;
          responseData.images = images;
        } else if (kind === 'assets_audios' || legacyChild(file, 'audios')) {
          const audios = await getFilesInFolder(file.id);
          if (!audios)
            throw new Error('저장된 오디오 목록을 불러오지 못했습니다.');
          responseData.audioFolderId = file.id;
          responseData.audios = audios;
        }
      }
    }

    // 배열이 아닌 구조화된 객체 응답

    return NextResponse.json({
      success: true,
      ...responseData,
      ...(audienceName ? { audienceName } : {}),
    });
  } catch (error) {
    if (error instanceof DriveHttpError)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status }
      );
    console.error('updateInvitation error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof PreviewAccessError
            ? error.userMessage
            : (error as Error).message,
        config: {
          bulkData: {
            backgroundColor: '#FFFFFF',
            titleData: TITLE_BULK_DATA,
            bodyData: BODY_BULK_DATA,
            isZoom: false,
            scrollAnimation: DEFAULT_SCROLL_ANIMATION,
          },
          blocks: [] as PersistedEditorBlock[],
          mainPoster: '',
          bgm: {
            selectedBgmId: null,
            isLoop: false,
            volume: 0.2,
            userBgmTitle: null,
            userBgmDuration: null,
            userBgmFileId: null,
          },
          invitationImage: [],
        },
        images: {},
        audios: {},
        imageFolderId: '',
        audioFolderId: '',
      },
      {
        status: error instanceof PreviewAccessError ? error.status : 500,
      }
    );
  }
}
