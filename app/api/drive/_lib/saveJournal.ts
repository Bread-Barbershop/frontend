import 'server-only';

import { randomBytes } from 'node:crypto';

import {
  authKey,
  authRedis,
  AuthStorageError,
  readAuthRecord,
  serverSessionsEnabled,
  writeAuthRecord,
} from '@/app/api/auth/_lib/authStorage';
import { requireServerSession } from '@/app/api/auth/_lib/serverSession';

import { DriveHttpError } from './ensureWorkspace';

export const JOURNAL_SECONDS = 7 * 24 * 60 * 60;

export async function journalKey(kind: string, id: string) {
  if (!serverSessionsEnabled()) throw new AuthStorageError();
  const { record } = await requireServerSession();
  return authKey(`${kind}:${record.userId}:${id}`);
}

export { readAuthRecord as readJournal, writeAuthRecord as writeJournal };

export async function markSaveStage(
  uuid: string,
  stage: 'data_saved' | 'published'
) {
  if (!serverSessionsEnabled()) return;
  const key = await journalKey('save', uuid);
  const current = await readAuthRecord<Record<string, unknown>>(key);
  await writeAuthRecord(
    key,
    { ...current, stage, updatedAt: Date.now() },
    JOURNAL_SECONDS
  );
}

export async function withSaveLock<T>(
  key: string,
  run: () => Promise<T>
): Promise<T> {
  const { redis } = authRedis();
  const lockKey = `${key}:lock`;
  const owner = randomBytes(16).toString('hex');
  if (!(await redis.set(lockKey, owner, { nx: true, ex: 120 }))) {
    throw new DriveHttpError(
      '다른 저장 요청을 처리 중입니다. 잠시 후 다시 시도해 주세요.',
      409,
      {}
    );
  }
  try {
    return await run();
  } finally {
    await redis
      .eval(
        "if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) end return 0",
        [lockKey],
        [owner]
      )
      .catch(() => undefined);
  }
}
