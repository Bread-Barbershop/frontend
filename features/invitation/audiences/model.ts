export type AudienceGroup = {
  name: string;
  slug: string;
  folderId: string;
  invitationUuid: string;
};

export type AudienceGroupList = {
  rootGuestUrl: string;
  groups: AudienceGroup[];
  activeSlug: string;
};

export const MAX_AUDIENCE_NAME_LENGTH = 36;
export const MAX_AUDIENCE_SLUG_LENGTH = 40;

export function normalizeAudienceNameForComparison(name: string) {
  return name.trim().normalize('NFC').toLowerCase();
}

export function validateAudienceName(input: string): string | null {
  const name = input.trim();
  if (!name) return '대상 이름을 입력해 주세요.';
  if (normalizeAudienceNameForComparison(name) === '기본')
    return '기본 초대장에 예약된 대상 이름이에요.';
  if (name.length > MAX_AUDIENCE_NAME_LENGTH)
    return `대상 이름은 ${MAX_AUDIENCE_NAME_LENGTH}자까지 입력할 수 있어요.`;
  if (/[\p{Cc}\p{Zl}\p{Zp}]/u.test(name))
    return '대상 이름은 한 줄로 입력해 주세요.';
  return null;
}

export function validateAudienceSlug(input: string): string | null {
  const slug = input.trim();
  if (!slug) return '링크 영문명을 입력해 주세요.';
  if (slug.length > MAX_AUDIENCE_SLUG_LENGTH)
    return `링크 영문명은 ${MAX_AUDIENCE_SLUG_LENGTH}자까지 입력할 수 있어요.`;
  if (!/^[a-z][a-z0-9-]*$/.test(slug))
    return '영문 소문자로 시작하고 소문자, 숫자, 하이픈만 입력해 주세요.';
  if (slug === 'base' || slug === 'default')
    return '기본 초대장에 예약된 링크 영문명이에요.';
  return null;
}

export function buildAudienceGuestUrl(
  rootGuestUrl: string,
  slug: string | null
) {
  const hashIndex = rootGuestUrl.indexOf('#');
  const beforeHash =
    hashIndex < 0 ? rootGuestUrl : rootGuestUrl.slice(0, hashIndex);
  const hash = hashIndex < 0 ? '' : rootGuestUrl.slice(hashIndex);
  const queryIndex = beforeHash.indexOf('?');
  const path = queryIndex < 0 ? beforeHash : beforeHash.slice(0, queryIndex);
  const query = new URLSearchParams(
    queryIndex < 0 ? '' : beforeHash.slice(queryIndex + 1)
  );
  const normalizedSlug = slug?.trim();
  if (normalizedSlug) {
    query.set('to', normalizedSlug);
  } else if (query.has('to')) {
    query.delete('to');
  } else {
    return rootGuestUrl;
  }
  const search = query.toString();
  return path + (search ? `?${search}` : '') + hash;
}
