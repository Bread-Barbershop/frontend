import 'server-only';

import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

import { JsonData } from '../updateInvitaion/route';

export type InviteListItem = {
  folderId: string;
  name: string;
  createdTime?: string;
  invitationUuid?: string;
};

export type DriveListResponse = {
  files?: Array<{
    id?: string;
    name?: string;
    mimeType?: string;
  }>;

  error?: unknown;
};

export type LoadInvitationsResult = {
  invites: InviteListItem[];
  nextPageToken: string | null;
  emptyReason?: string;
};

export async function loadInvitations(
  id: string | null
): Promise<DriveListResponse | null> {
  if (!id) return null;
  try {
    const listRes = await googleFetch(
      `https://www.googleapis.com/drive/v3/files?q='${id}'+in+parents&fields=files(id, name, mimeType)`,
      { cache: 'no-store' }
    );
    const listData = (await listRes
      .json()
      .catch(() => ({}))) as DriveListResponse;

    if (!listRes.ok) {
      throw new DriveHttpError(
        '초대장 목록 조회 실패',
        listRes.status,
        listData
      );
    }

    return listData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function downloadFiles(id: string): Promise<JsonData | null> {
  try {
    const listRes = await googleFetch(
      `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
      { cache: 'no-store' }
    );
    const listData = await listRes.json();

    if (!listRes.ok) {
      throw new DriveHttpError(
        '초대장 목록 조회 실패',
        listRes.status,
        listData
      );
    }

    return listData;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getFilesInFolder(
  folderId: string
): Promise<DriveListResponse | null> {
  try {
    // q 파라미터는 띄어쓰기가 포함되므로 인코딩이 필요합니다.
    const query = encodeURIComponent(
      `'${folderId}' in parents and trashed = false`
    );

    // fields를 지정하면 응답 속도가 빨라지고 데이터가 깔끔해집니다.
    const fields = encodeURIComponent(
      'files(id, name, mimeType, size, thumbnailLink, createdTime)'
    );

    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}`;

    const listRes = await googleFetch(url, { cache: 'no-store' });

    const data = (await listRes.json()) as DriveListResponse;

    return data; // { files: [...] }
  } catch (error) {
    console.error(error);
    return null;
  }
}

// export async function downloadBlob(fileList): Promise<any[]> {
//   const chunkSize = 5;
//   const results = [];

//   for (let i = 0; i < fileList.length; i += chunkSize) {
//     const chunk = fileList.slice(i, i + chunkSize);

//     const chunkPromises = chunk.map(async fileInfo => {
//       const res = await googleFetch(
//         `https://www.googleapis.com/drive/v3/files/${fileInfo.id}?alt=media`,
//         { cache: 'no-store' }
//       );

//       if (!res.ok) throw new Error(`Download failed: ${fileInfo.name}`);

//       // 1. 응답을 ArrayBuffer로 받습니다.
//       const arrayBuffer = await res.arrayBuffer();

//       // 2. Buffer를 사용하여 Base64로 인코딩합니다.
//       const buffer = Buffer.from(arrayBuffer);

//       // 3. Sharp를 이용한 리사이즈 처리
//       const resizedBuffer = await sharp(buffer)
//         .resize(800) // 가로 800px로 리사이즈 (세로는 비율 맞춰 자동 조절)
//         .jpeg({ quality: 70 }) // JPEG로 변환하며 품질 70%로 압축
//         .toBuffer();

//       // 3. 클라이언트 JSON 응답에 포함될 객체를 반환합니다.
//       return {
//         id: fileInfo.id,
//         name: fileInfo.name,
//         mimeType: fileInfo.mimeType,
//         size: resizedBuffer.byteLength,
//         // 클라이언트 <img> 태그의 src에서 바로 사용할 수 있는 형태
//         dataUrl: resizedBuffer,
//       };
//     });

//     const downloadedChunk = await Promise.all(chunkPromises);
//     results.push(...downloadedChunk);

//     console.log(
//       `${results.length} / ${fileList.length} 완료 (Base64 변환 포함)...`
//     );
//   }

//   return results;
// }
