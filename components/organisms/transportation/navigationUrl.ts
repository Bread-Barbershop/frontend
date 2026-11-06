const ALLOWED_HOSTS = [
  'map.naver.com',
  'naver.me',
  'map.kakao.com',
  'kko.to',
  'tmap.co.kr',
  'www.tmap.co.kr',
  'maps.google.com',
  'www.google.com',
];

export function safeNavigationUrl(input: unknown): string | null {
  if (typeof input !== 'string' || input.trim().length === 0 || input.length > 2048) return null;
  try {
    const url = new URL(input);
    if (
      url.protocol !== 'https:' ||
      !ALLOWED_HOSTS.includes(url.hostname.toLowerCase()) ||
      (url.username || url.password)
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
