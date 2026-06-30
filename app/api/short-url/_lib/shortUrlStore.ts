import 'server-only';

import { randomInt } from 'node:crypto';

import { Redis } from '@upstash/redis';

const SHORT_CODE_ALPHABET =
  '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
// 외부 공유 URL을 최대한 짧게 유지하기 위해 신규 코드는 4글자로 생성한다.
const SHORT_CODE_LENGTH = 4;
const MAX_CREATE_ATTEMPTS = 8;

function hasShortUrlStoreConfig() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    process.env.KV_REST_API_URL?.trim();
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.KV_REST_API_TOKEN?.trim();

  return Boolean(url && token);
}

export function isShortUrlStoreConfigured() {
  return hasShortUrlStoreConfig();
}

function getShortUrlRedis() {
  if (!isShortUrlStoreConfigured()) return null;
  return Redis.fromEnv();
}

function shortCodeKey(shortCode: string) {
  return `short:${shortCode}`;
}

function invitationShortCodeKey(invitationFolderId: string) {
  return `invite:${invitationFolderId}:shortCode`;
}

function normalizeNonEmpty(value: string) {
  return value.trim();
}

function isValidShortCode(shortCode: string) {
  // 생성 문자셋 밖의 값은 Redis 조회 전에 차단한다.
  return (
    shortCode.length >= 4 &&
    shortCode.length <= 32 &&
    Array.from(shortCode).every(char => SHORT_CODE_ALPHABET.includes(char))
  );
}

function createRandomShortCode() {
  return Array.from({ length: SHORT_CODE_LENGTH }, () => {
    return SHORT_CODE_ALPHABET[randomInt(SHORT_CODE_ALPHABET.length)];
  }).join('');
}

export function createShortGuestPath(shortCode: string) {
  return `/i/${encodeURIComponent(shortCode)}`;
}

export async function resolveShortCode(shortCode: string) {
  const normalizedShortCode = normalizeNonEmpty(shortCode);
  if (!isValidShortCode(normalizedShortCode)) return null;

  const redis = getShortUrlRedis();
  if (!redis) return null;

  const dataJsonFileId = await redis.get<string>(
    shortCodeKey(normalizedShortCode)
  );

  return typeof dataJsonFileId === 'string' && dataJsonFileId.trim()
    ? dataJsonFileId
    : null;
}

export async function getOrCreateShortCode(
  invitationFolderId: string,
  dataJsonFileId: string
) {
  const normalizedInvitationFolderId = normalizeNonEmpty(invitationFolderId);
  const normalizedDataJsonFileId = normalizeNonEmpty(dataJsonFileId);

  if (!normalizedInvitationFolderId || !normalizedDataJsonFileId) {
    return null;
  }

  if (!isShortUrlStoreConfigured()) {
    return null;
  }

  const redis = getShortUrlRedis();
  if (!redis) return null;

  const inviteKey = invitationShortCodeKey(normalizedInvitationFolderId);
  const existingShortCode = await redis.get<string>(inviteKey);

  if (typeof existingShortCode === 'string' && existingShortCode.trim()) {
    // 같은 초대장은 기존 짧은 URL을 유지하고, 대상 data.json만 최신 값으로 갱신한다.
    await redis.set(
      shortCodeKey(existingShortCode),
      normalizedDataJsonFileId
    );

    return {
      shortCode: existingShortCode,
      guestPath: createShortGuestPath(existingShortCode),
    };
  }

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt += 1) {
    const shortCode = createRandomShortCode();
    // SET NX로 이미 사용 중인 코드와 충돌하지 않게 만든다.
    const created = await redis.set(
      shortCodeKey(shortCode),
      normalizedDataJsonFileId,
      { nx: true }
    );

    if (created !== 'OK') continue;

    await redis.set(inviteKey, shortCode);

    return {
      shortCode,
      guestPath: createShortGuestPath(shortCode),
    };
  }

  throw new Error('short code creation failed');
}

export async function deleteShortCodeMapping(invitationFolderId: string) {
  const normalizedInvitationFolderId = normalizeNonEmpty(invitationFolderId);
  if (!normalizedInvitationFolderId || !isShortUrlStoreConfigured()) {
    return false;
  }

  const redis = getShortUrlRedis();
  if (!redis) return false;

  const inviteKey = invitationShortCodeKey(normalizedInvitationFolderId);
  const shortCode = await redis.get<string>(inviteKey);
  if (typeof shortCode !== 'string' || !shortCode.trim()) {
    return false;
  }

  await redis.del(inviteKey, shortCodeKey(shortCode));

  return true;
}
