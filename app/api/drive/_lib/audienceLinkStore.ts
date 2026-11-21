import 'server-only';

import { createHash } from 'node:crypto';

import { Redis } from '@upstash/redis';

import { isShortUrlStoreConfigured } from '@/app/api/short-url/_lib/shortUrlStore';
import { normalizeAudienceNameForComparison } from '@/features/invitation/audiences/model';
import type { AudienceVisibility } from '@/features/invitation/audiences/visibility';

type ClaimIdentity = { slug: string; requestId: string };
type ClaimInput = ClaimIdentity & { name: string };
type LinkTarget = { slug: string; dataJsonFileId: string };

export type AudienceLinkClaimResult =
  | { status: 'claimed' | 'existing'; dataJsonFileId: string | null }
  | { status: 'duplicate-slug' | 'duplicate-name' | 'request-conflict' };

export class AudienceLinkStoreUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('Audience link store is unavailable', { cause });
    this.name = 'AudienceLinkStoreUnavailableError';
  }
}

const CLAIM_SECONDS = 24 * 60 * 60;

// Per-root leases are kept separately from published links. Each operation
// drops expired entries, and Redis drops the whole lease key after inactivity.
const PENDING_LEASES_SCRIPT = `
local now = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])
local raw = redis.call('GET', KEYS[2])
local pending = {}
if raw then
  for _, claim in ipairs(cjson.decode(raw)) do
    if claim.expiresAt > now then table.insert(pending, claim) end
  end
end
local function savePending()
  if #pending == 0 then redis.call('DEL', KEYS[2])
  else redis.call('SET', KEYS[2], cjson.encode(pending), 'EX', ttl) end
end
`;

const CLAIM_SCRIPT =
  PENDING_LEASES_SCRIPT +
  `
local slug, nameHash, requestId = ARGV[3], ARGV[4], ARGV[5]
local requestSlug = redis.call('HGET', KEYS[1], 'request:' .. requestId)
if requestSlug and requestSlug ~= slug then return {'request-conflict'} end
local ready = redis.call('HGET', KEYS[1], 'slug:' .. slug)
if ready then
  local record = cjson.decode(ready)
  if record.requestId ~= requestId then return {'duplicate-slug'} end
  if record.nameHash ~= nameHash then return {'request-conflict'} end
  return {'existing', record.dataJsonFileId}
end
if redis.call('HEXISTS', KEYS[1], 'name:' .. nameHash) == 1 then
  return {'duplicate-name'}
end
for _, claim in ipairs(pending) do
  if claim.requestId == requestId then
    if claim.slug ~= slug or claim.nameHash ~= nameHash then return {'request-conflict'} end
    claim.expiresAt = now + ttl
    savePending()
    return {'existing', ''}
  end
  if claim.slug == slug then return {'duplicate-slug'} end
  if claim.nameHash == nameHash then return {'duplicate-name'} end
end
table.insert(pending, {slug = slug, nameHash = nameHash, requestId = requestId, expiresAt = now + ttl})
savePending()
return {'claimed', ''}
`;

const FINALIZE_CLAIM_SCRIPT =
  PENDING_LEASES_SCRIPT +
  `
local slug, requestId, child = ARGV[3], ARGV[4], ARGV[5]
local field = 'slug:' .. slug
local ready = redis.call('HGET', KEYS[1], field)
if ready then
  local record = cjson.decode(ready)
  if child ~= '' and record.requestId == requestId and record.dataJsonFileId == child then
    return 1
  end
  return 0
end
for index, claim in ipairs(pending) do
  if claim.slug == slug and claim.requestId == requestId then
    if child ~= '' then
      local record = {nameHash = claim.nameHash, requestId = requestId, dataJsonFileId = child}
      redis.call('HSET', KEYS[1], field, cjson.encode(record),
        'name:' .. claim.nameHash, slug, 'request:' .. requestId, slug)
    end
    table.remove(pending, index)
    savePending()
    return 1
  end
end
return 0
`;

const REFRESH_SCRIPT = `
local field = 'slug:' .. ARGV[1]
local ready = redis.call('HGET', KEYS[1], field)
if not ready then return 0 end
local record = cjson.decode(ready)
record.dataJsonFileId = ARGV[2]
redis.call('HSET', KEYS[1], field, cjson.encode(record))
return 1
`;

function audienceKeys(rootDataFileId: string): [string, string] {
  const key = `audience:links:{${rootDataFileId}}`;
  return [key, `${key}:pending`];
}

function leaseArguments() {
  return [Math.floor(Date.now() / 1000), CLAIM_SECONDS];
}

async function withAudienceRedis<T>(run: (redis: Redis) => Promise<T>) {
  if (!isShortUrlStoreConfigured())
    throw new AudienceLinkStoreUnavailableError();
  try {
    return await run(Redis.fromEnv());
  } catch (error) {
    throw new AudienceLinkStoreUnavailableError(error);
  }
}

export async function claimAudienceLink(
  rootDataFileId: string,
  input: ClaimInput
) {
  const nameHash = createHash('sha256')
    .update(normalizeAudienceNameForComparison(input.name))
    .digest('hex');
  return withAudienceRedis<AudienceLinkClaimResult>(async redis => {
    const [status, dataJsonFileId] = await redis.eval<
      (string | number)[],
      [AudienceLinkClaimResult['status'], string?]
    >(CLAIM_SCRIPT, audienceKeys(rootDataFileId), [
      ...leaseArguments(),
      input.slug,
      nameHash,
      input.requestId,
    ]);
    if (status === 'claimed' || status === 'existing') {
      return { status, dataJsonFileId: dataJsonFileId || null };
    }
    return { status };
  });
}

async function finalizeClaim(
  rootDataFileId: string,
  claim: ClaimIdentity,
  dataJsonFileId = ''
) {
  return withAudienceRedis(redis =>
    redis.eval<(string | number)[], number>(
      FINALIZE_CLAIM_SCRIPT,
      audienceKeys(rootDataFileId),
      [...leaseArguments(), claim.slug, claim.requestId, dataJsonFileId]
    )
  );
}

export async function commitAudienceLink(
  rootDataFileId: string,
  link: ClaimIdentity & LinkTarget
) {
  if (!link.dataJsonFileId || link.dataJsonFileId === rootDataFileId)
    throw new Error('Invalid audience data file');
  if ((await finalizeClaim(rootDataFileId, link, link.dataJsonFileId)) !== 1)
    throw new Error('Audience link claim changed before commit');
}

export async function releaseAudienceLink(
  rootDataFileId: string,
  claim: ClaimIdentity
) {
  return (await finalizeClaim(rootDataFileId, claim)) === 1;
}

export async function refreshAudienceLink(
  rootDataFileId: string,
  link: LinkTarget
) {
  if (!link.dataJsonFileId || link.dataJsonFileId === rootDataFileId)
    throw new Error('Invalid audience data file');
  const [key] = audienceKeys(rootDataFileId);
  const result = await withAudienceRedis(redis =>
    redis.eval<string[], number>(
      REFRESH_SCRIPT,
      [key],
      [link.slug, link.dataJsonFileId]
    )
  );
  if (result !== 1) throw new Error('Audience link is not registered');
}

export async function resolveAudienceLink(
  rootDataFileId: string,
  slug: string
) {
  const [key] = audienceKeys(rootDataFileId);
  const target = await withAudienceRedis(redis =>
    redis.hget<{ dataJsonFileId?: unknown }>(key, `slug:${slug}`)
  );
  if (!target) return null;
  const child = target.dataJsonFileId;
  if (typeof child !== 'string' || !child || child === rootDataFileId)
    throw new AudienceLinkStoreUnavailableError();
  return child;
}

export async function deleteAudienceLinks(rootDataFileId: string) {
  await withAudienceRedis(redis => redis.del(...audienceKeys(rootDataFileId)));
}

export async function readAudienceVisibility(rootDataFileId: string) {
  const [key] = audienceKeys(rootDataFileId);
  return withAudienceRedis(redis =>
    redis.hget<AudienceVisibility>(key, 'visibility')
  );
}

export async function writeAudienceVisibility(
  rootDataFileId: string,
  visibility: AudienceVisibility
) {
  const [key] = audienceKeys(rootDataFileId);
  await withAudienceRedis(redis => redis.hset(key, { visibility }));
}
