export function safeTransferLink(value: unknown, provider: 'kakao' | 'toss'): string | null {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048) return null;
  try {
    const parsed = new URL(value);
    const expectedHost = provider === 'kakao' ? 'qr.kakaopay.com' : 'toss.me';
    if (
      parsed.protocol !== 'https:' ||
      parsed.hostname.toLowerCase() !== expectedHost ||
      parsed.username ||
      parsed.password ||
      parsed.port ||
      parsed.pathname === '/'
    ) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
