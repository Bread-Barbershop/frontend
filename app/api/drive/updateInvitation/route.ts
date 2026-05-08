import { NextResponse } from 'next/server';

import {
  ResponseData,
  UpdateInvitationResponse,
} from '@/app/editor/[id]/types/savedata';
import { BODY_BULK_DATA, TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
import { EditorBlock } from '@/shared/types/block';

import {
  downloadFiles,
  getFilesInFolder,
  loadInvitations,
} from '../_lib/getSaveDataFetch';

export async function GET(
  request: Request
): Promise<NextResponse<UpdateInvitationResponse>> {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');

  // 반환할 데이터 구조 정의
  const responseData: ResponseData = {
    config: {
      bulkData: {
        backgroundColor: '#FFFFFF',
        titleData: TITLE_BULK_DATA,
        bodyData: BODY_BULK_DATA,
        isZoom: false,
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
    const result = await loadInvitations(fileId);

    if (!result || !result.files || result.files.length === 0) {
      throw new Error('초대장 목록이 없거나 불러오지 못했습니다.');
    }

    for (const file of result.files) {
      // 1. 폴더인 경우: 내부 파일 리스트(ID, Name)만 수집
      if (file.mimeType?.includes('folder')) {
        if (!file.id) continue;
        if (file.name?.toLowerCase().includes('image')) {
          responseData.imageFolderId = file.id!;
        } else if (file.name?.toLowerCase().includes('audio')) {
          responseData.audioFolderId = file.id!;
        }
        const folderContent = await getFilesInFolder(file.id!);

        // 폴더 이름에 따라 분류 (예: 'images' 폴더, 'audio' 폴더)
        if (folderContent) {
          if (file.name?.toLowerCase().includes('image')) {
            responseData.images = folderContent;
          } else if (file.name?.toLowerCase().includes('audio')) {
            responseData.audios = folderContent;
          }
        }
      }

      // // 2. JSON 파일인 경우: 설정값(Config)으로 파싱해서 저장
      else if (file.mimeType?.includes('json')) {
        const fileContent = await downloadFiles(file.id!);
        // 데이터 호환성 처리 (block vs blocks)
        if (fileContent) {
          responseData.config = {
            bulkData: fileContent.bulkData,
            blocks: fileContent.blocks,
            mainPoster: fileContent.mainPoster,
            bgm: fileContent.bgm,
            invitationImage: fileContent.invitationImage,
          };
        }
      }
    }

    // 배열이 아닌 구조화된 객체 응답

    return NextResponse.json({ success: true, ...responseData });
  } catch (error) {
    console.error('updateInvitation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
        config: {
          bulkData: {
            backgroundColor: '#FFFFFF',
            titleData: TITLE_BULK_DATA,
            bodyData: BODY_BULK_DATA,
            isZoom: false,
          },
          blocks: [] as EditorBlock[],
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
      } as UpdateInvitationResponse,
      {
        status: 500,
      }
    );
  }
}
