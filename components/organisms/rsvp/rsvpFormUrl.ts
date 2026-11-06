export function safeRsvpFormUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'forms.gle') return url.toString();
    if (hostname === 'docs.google.com' && url.pathname.startsWith('/forms/')) {
      return url.toString();
    }
    return null;
  } catch {
    return null;
  }
}
