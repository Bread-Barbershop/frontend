import 'server-only';
import { DriveHttpError } from '@/app/api/drive/_lib/ensureWorkspace';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';

export const driveFiles = 'https://www.googleapis.com/drive/v3/files';
export const sheets = 'https://sheets.googleapis.com/v4/spreadsheets';
export function failure(message: string, status: number): never {
  throw new DriveHttpError(message, status, {});
}
export function jsonWrite(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
export async function checked(response: Response) {
  if (!response.ok)
    failure(
      'Google에 요청을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.',
      response.status === 429 ? 429 : 502
    );
  return response;
}
export async function ensureCollectionResource(
  invitation: string,
  kind: 'guest_photos' | 'guest_book'
) {
  const mimeType =
    kind === 'guest_photos'
      ? 'application/vnd.google-apps.folder'
      : 'application/vnd.google-apps.spreadsheet';
  const props = { app_id: 'Bread-Barbershop', kind, invitation };
  const q = [
    'trashed=false',
    "'me' in owners",
    "'root' in parents",
    `mimeType='${mimeType}'`,
    ...Object.entries(props).map(
      ([key, value]) =>
        `appProperties has { key='${key}' and value='${value}' }`
    ),
  ].join(' and ');
  const params = new URLSearchParams({
    q,
    fields: 'files(id)',
    orderBy: 'createdTime',
    pageSize: '1',
  });
  const found = await (
    await checked(await googleFetch(`${driveFiles}?${params}`))
  ).json();
  if (found.files?.[0]?.id) return found.files[0].id as string;
  const name =
    (kind === 'guest_photos' ? '인비아 하객 사진 ' : '인비아 공개 방명록 ') +
    invitation.slice(-8);
  const file = await (
    await checked(
      await googleFetch(
        driveFiles + '?fields=id',
        jsonWrite({ name, mimeType, parents: ['root'], appProperties: props })
      )
    )
  ).json();
  return file.id as string;
}
export async function sharing(id: string, request: typeof fetch) {
  const response = await request(
    `${driveFiles}/${id}?fields=trashed,ownedByMe,permissions(type,role)`
  );
  const file = await (await checked(response)).json();
  if (file.trashed || !file.ownedByMe || !Array.isArray(file.permissions))
    failure('Drive 파일의 소유권과 공유 상태를 확인해 주세요.', 403);
  return file.permissions as { type: string; role: string }[];
}
export async function checkPrivateFolder(id: string, request: typeof fetch) {
  const permissions = await sharing(id, request);
  if (
    !permissions.length ||
    permissions.some(p => p.type !== 'user' || p.role !== 'owner')
  )
    failure('사진 폴더의 공유를 해제한 뒤 다시 시도해 주세요.', 403);
}
export async function enableGuestbook(id: string) {
  if (!process.env.GOOGLE_SHEETS_READ_API_KEY)
    failure('공개 방명록 읽기 설정이 필요해요.', 503);
  const info = await (
    await checked(
      await googleFetch(`${sheets}/${id}?fields=sheets(properties(sheetId))`)
    )
  ).json();
  const tabId = info.sheets?.[0]?.properties?.sheetId;
  if (!Number.isInteger(tabId) || info.sheets.length !== 1)
    failure('공개 방명록에는 전용 시트 하나만 사용할 수 있어요.', 400);
  const permissions = await sharing(id, (url, init) =>
    googleFetch(String(url), init)
  );
  if (!permissions.some(p => p.type === 'anyone' && p.role === 'reader')) {
    await checked(
      await googleFetch(
        `${driveFiles}/${id}/permissions`,
        jsonWrite({ type: 'anyone', role: 'reader', allowFileDiscovery: false })
      )
    );
  }
  return tabId as number;
}
