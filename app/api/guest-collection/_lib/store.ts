import 'server-only';
import {
  authKey,
  authRedis,
  readAuthRecord,
} from '@/app/api/auth/_lib/authStorage';
import {
  hasExcessiveDriveScope,
  hasRequiredDriveScope,
} from '@/app/api/auth/_lib/googleScopes';
import { serverAccessToken } from '@/app/api/auth/_lib/serverSession';
import {
  decryptRecord,
  encryptRecord,
} from '@/app/api/auth/_lib/sessionCrypto';
import { tokenRefresh } from '@/app/api/auth/_lib/tokenRefresh';
import { assertDriveId } from '@/app/api/drive/_lib/driveAccess';
import { ensureDataJsonFile } from '@/app/api/drive/_lib/ensureDataJsonFile';
import { googleFetch } from '@/app/api/drive/_lib/googleFetch';
import { assertInvitationFolderAccess } from '@/app/api/drive/_lib/previewAccess';
import { withSaveLock } from '@/app/api/drive/_lib/saveJournal';
import {
  collectionClosesAt,
  type CollectionOptions,
} from '@/features/invitation/collection/model';

import {
  checkPrivateFolder,
  enableGuestbook,
  ensureCollectionResource,
  failure,
} from './resources';

export type Collection = CollectionOptions & {
  root: string;
  owner: string;
  sheet?: string;
  tabId?: number;
  photoFolder?: string;
  closesAt: number;
};
type Grant = {
  refreshToken: string;
  accessToken: string;
  expiresAt: number;
  scope: string;
};
export const configKey = (id: string) => authKey('collection:settings:' + id);
const grantKey = (id: string) => authKey('collection:grant:' + id);
export async function ownerTarget(folder: string) {
  assertDriveId(folder);
  const source = await assertInvitationFolderAccess(folder, {
    ownedOnly: true,
  });
  const root = source.rootFolderId;
  const { dataJsonFileId } = await ensureDataJsonFile(root);
  return { root, id: dataJsonFileId };
}
export async function getCollection(id: string) {
  assertDriveId(id);
  return readAuthRecord<Collection>(configKey(id));
}
export async function configure(
  folder: string,
  options: CollectionOptions,
  consent: boolean
) {
  const { root, id } = await ownerTarget(folder);
  const session = await serverAccessToken();
  const on = options.guestbook || options.photos;
  const closesAt = collectionClosesAt(options.eventDate);
  if (on && (!consent || closesAt <= Date.now()))
    failure('접수 마감일과 Google 연결 동의를 확인해 주세요.', 400);
  const key = configKey(id);
  return withSaveLock(key, async () => {
    const before = await getCollection(id);
    if (before && before.owner !== session.userId)
      failure('초대장 소유자를 확인해 주세요.', 403);
    const config: Collection = {
      ...before,
      ...options,
      root,
      owner: session.userId,
      closesAt,
    };
    if (options.guestbook) {
      config.sheet = await ensureCollectionResource(id, 'guest_book');
      config.tabId = await enableGuestbook(config.sheet);
    }
    if (options.photos) {
      config.photoFolder = await ensureCollectionResource(id, 'guest_photos');
      await checkPrivateFolder(config.photoFolder, (url, init) =>
        googleFetch(String(url), init)
      );
    }
    const secret = grantKey(id);
    const tx = authRedis().redis.multi();
    tx.set(key, encryptRecord(config, key));
    if (on) {
      const grant: Grant = {
        refreshToken: session.refreshToken,
        accessToken: session.accessToken,
        expiresAt: session.expiresAt,
        scope: session.scope,
      };
      tx.set(secret, encryptRecord(grant, secret), { pxat: closesAt });
    } else tx.del(secret);
    await tx.exec();
    return config;
  });
}
export async function removeCollection(id: string) {
  const key = configKey(id);
  await withSaveLock(key, () => authRedis().redis.del(key, grantKey(id)));
}

export async function hasGrant(id: string) {
  return Boolean(await authRedis().redis.exists(grantKey(id)));
}
export async function guestGoogle(id: string, forceRefresh = false) {
  const key = grantKey(id);
  const { redis } = authRedis();
  let sealed = await redis.get<string>(key);
  if (!sealed) failure('작성자가 Google 연결을 다시 확인해야 해요.', 409);
  let grant = decryptRecord<Grant>(sealed, key);
  if (forceRefresh || grant.expiresAt <= Date.now() + 60_000) {
    const refreshed = await tokenRefresh(grant.refreshToken).catch(
      async error => {
        if (error instanceof Error && error.message === 'invalid_grant') {
          await redis.eval(
            "if redis.call('get',KEYS[1])==ARGV[1] then redis.call('del',KEYS[1]) end return 1",
            [key],
            [sealed]
          );
          failure('작성자가 Google 연결을 다시 확인해야 해요.', 409);
        }
        failure('Google 연결이 지연되고 있어요. 다시 시도해 주세요.', 503);
      }
    );
    grant = {
      ...grant,
      ...refreshed,
      refreshToken: refreshed.refreshToken ?? grant.refreshToken,
      scope: refreshed.scope ?? grant.scope,
    };
    if (
      !hasRequiredDriveScope(grant.scope) ||
      hasExcessiveDriveScope(grant.scope)
    )
      failure('Google 연결 권한을 확인해 주세요.', 403);
    const updated = encryptRecord(grant, key);
    const current = await redis.eval<string[], string | null>(
      "if redis.call('get',KEYS[1])==ARGV[1] then redis.call('set',KEYS[1],ARGV[2],'KEEPTTL') end return redis.call('get',KEYS[1])",
      [key],
      [sealed, updated]
    );
    if (!current) failure('접수가 종료됐어요.', 410);
    sealed = current;
    grant = decryptRecord<Grant>(sealed, key);
  }
  return async (
    url: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const headers = new Headers(init?.headers);
    headers.set('Authorization', 'Bearer ' + grant.accessToken);
    const response = await fetch(url, {
      ...init,
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });
    if (response.status === 401 && !forceRefresh) {
      const retry = await guestGoogle(id, true);
      return retry(url, init);
    }
    return response;
  };
}
