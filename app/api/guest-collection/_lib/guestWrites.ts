import 'server-only';

import { createHash } from 'node:crypto';

import { authKey, authRedis } from '@/app/api/auth/_lib/authStorage';
import {
  PHOTO_LIMIT,
  photoExtensions,
} from '@/features/invitation/collection/model';

import {
  checkPrivateFolder,
  checked,
  driveFiles,
  failure,
  jsonWrite,
  sharing,
  sheets,
} from './resources';
import { getCollection, guestGoogle } from './store';

export async function appendMessage(
  sheet: string,
  tabId: number,
  requestId: string,
  name: string,
  message: string,
  request: typeof fetch
) {
  const digest = createHash('sha256').update(requestId).digest();
  const value = createHash('sha256')
    .update(JSON.stringify([requestId, name, message]))
    .digest('hex');
  const base = sheets + '/' + sheet;
  // The metadata ID is unique within a spreadsheet. Sheets commits the receipt and the new row atomically.
  // A retry after a lost response finds its receipt instead of appending a second row.
  for (let slot = 0; slot < 4; slot++) {
    const metadataId = digest.readUInt32BE(slot * 4) & 0x7fffffff || 1;
    const record = {
      metadataId,
      metadataKey: 'invia_guest_entry',
      metadataValue: value,
      visibility: 'PROJECT',
      location: { spreadsheet: true },
    };
    const values = [name, message, new Date().toISOString()].map(text => ({
      userEnteredValue: { stringValue: text },
    }));
    const result = await request(
      base + ':batchUpdate',
      jsonWrite({
        requests: [
          { createDeveloperMetadata: { developerMetadata: record } },
          {
            appendCells: {
              sheetId: tabId,
              rows: [{ values }],
              fields: 'userEnteredValue',
            },
          },
        ],
      })
    );
    if (result.ok) return;
    if (result.status !== 400 && result.status !== 409) await checked(result);
    const previous = await request(base + '/developerMetadata/' + metadataId);
    if (!previous.ok) await checked(result);
    const receipt = await previous.json();
    if (
      receipt.metadataKey === record.metadataKey &&
      receipt.metadataValue === value
    )
      return;
  }
  failure('글 등록이 지연됐어요. 다시 시도해 주세요.', 503);
}

async function reserveQuota(id: string, ip: string, bytes: number) {
  const window = Math.floor(Date.now() / 600000);
  const addr = createHash('sha256').update(ip).digest('hex').slice(0, 24);
  const keys = [
    authKey(`collection:rate:${id}:${window}:${addr}`),
    authKey(`collection:volume:${id}:${window}`),
  ];
  const script = `local n=tonumber(redis.call('get',KEYS[1]) or '0')
    local total=tonumber(redis.call('get',KEYS[2]) or '0')
    if n>=30 or total+tonumber(ARGV[1])>536870912 then return 0 end
    redis.call('incr',KEYS[1]); redis.call('expire',KEYS[1],660)
    redis.call('incrby',KEYS[2],ARGV[1]); redis.call('expire',KEYS[2],660)
    return 1`;
  if (!(await authRedis().redis.eval(script, keys, [bytes])))
    failure('접수 요청이 많아요. 잠시 후 다시 시도해 주세요.', 429);
}

export async function submitGuest(
  req: Request,
  id: string,
  body: Record<string, unknown>
) {
  const config = await getCollection(id);
  const photo = body.kind === 'photo';
  if (
    !config ||
    !(photo ? config.photos : config.guestbook) ||
    config.closesAt <= Date.now()
  )
    failure('접수가 종료됐어요.', 410);
  const size = Number(body.size);
  const mime = String(body.mimeType);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (photo) {
    if (
      !Object.hasOwn(photoExtensions, mime) ||
      !Number.isSafeInteger(size) ||
      size <= 0 ||
      size > PHOTO_LIMIT
    )
      failure('사진은 지원하는 형식으로 한 장에 20MB까지 올릴 수 있어요.', 400);
  } else if (
    body.kind !== 'message' ||
    !name ||
    name.length > 40 ||
    !message ||
    message.length > 500 ||
    !/^[a-f0-9-]{36}$/i.test(String(body.requestId))
  )
    failure('이름과 축하 메시지를 확인해 주세요.', 400);
  const ip = (
    req.headers.get('x-vercel-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    'local'
  ).split(',')[0];
  await reserveQuota(id, ip, photo ? size : 0);
  const request = await guestGoogle(id);
  const rootPermissions = await sharing(config.root, request);
  if (!rootPermissions.some(p => p.type === 'anyone' && p.role === 'reader'))
    failure('현재 비공개인 초대장이에요.', 403);
  if (Date.now() >= config.closesAt) failure('접수가 종료됐어요.', 410);
  if (!photo) {
    if (!config.sheet || config.tabId === undefined)
      failure('방명록을 준비하고 있어요.', 503);
    await appendMessage(
      config.sheet,
      config.tabId,
      String(body.requestId),
      name,
      message,
      request
    );
    return { ok: true };
  }
  if (!config.photoFolder) failure('사진함을 준비하고 있어요.', 503);
  await checkPrivateFolder(config.photoFolder, request);
  if (Date.now() >= config.closesAt) failure('접수가 종료됐어요.', 410);
  const response = await checked(
    await request(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': mime,
          'X-Upload-Content-Length': String(size),
          Origin: new URL(req.url).origin,
        },
        body: JSON.stringify({
          name: `하객사진-${crypto.randomUUID()}.${photoExtensions[mime]}`,
          mimeType: mime,
          parents: [config.photoFolder],
        }),
      }
    )
  );
  const address = new URL(response.headers.get('location') ?? '', driveFiles);
  if (
    address.origin !== 'https://www.googleapis.com' ||
    !address.pathname.startsWith('/upload/drive/v3/files')
  )
    failure('사진 전송을 준비하지 못했어요.', 502);
  return { uploadUrl: address.href };
}
