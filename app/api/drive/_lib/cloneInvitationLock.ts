import 'server-only';

import { randomUUID } from 'node:crypto';

import { Redis } from '@upstash/redis';

import { isShortUrlStoreConfigured } from '@/app/api/short-url/_lib/shortUrlStore';

import { captureDriveError } from './captureDriveError';
import { InvitationCloneError } from './cloneDriveFiles';

const inFlight = new Set<string>();
const LOCK_SECONDS = 180;
const RESULT_SECONDS = 24 * 60 * 60;

export type CloneAttempt = {
  readyFolderId: string | null;
  rememberReadyFolder: (folderId: string) => Promise<void>;
};

export function cloneInProgress() {
  return new InvitationCloneError(
    '초대장을 복제하고 있습니다. 잠시 후 다시 시도해 주세요.',
    409
  );
}

export async function withCloneLock<T>(
  requestKey: string,
  run: (attempt: CloneAttempt) => Promise<T>
): Promise<T> {
  if (inFlight.has(requestKey)) throw cloneInProgress();
  inFlight.add(requestKey);

  const lockKey = `drive:clone:${requestKey}:lock`;
  const readyKey = `drive:clone:${requestKey}:ready`;
  const owner = randomUUID();
  let redis: Redis | null = null;
  let acquired = false;

  try {
    // 공유 저장소가 구성된 배포에서는 서버 인스턴스가 달라도 같은 요청을 한 번만 처리한다.
    redis = isShortUrlStoreConfigured() ? Redis.fromEnv() : null;
    if (redis) {
      acquired =
        (await redis.set(lockKey, owner, { nx: true, ex: LOCK_SECONDS })) ===
        'OK';
      if (!acquired) throw cloneInProgress();
    }

    return await run({
      readyFolderId: (await redis?.get<string>(readyKey)) ?? null,
      rememberReadyFolder: async folderId => {
        await redis?.set(readyKey, folderId, { ex: RESULT_SECONDS });
      },
    });
  } finally {
    inFlight.delete(requestKey);
    if (redis && acquired) {
      try {
        await redis.eval(
          "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end",
          [lockKey],
          [owner]
        );
      } catch (error) {
        captureDriveError({ error, operation: 'drive_clone_unlock' });
      }
    }
  }
}
