const RESPONDENT_FORM_PATH =
  /^\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?[A-Za-z0-9_-]+\/viewform\/?$/;
const RESPONDENT_SHORT_LINK_PATH = /^\/([A-Za-z0-9_-]+)\/?$/;
const MANAGEMENT_PATHS = new Set(['create', 'edit', 'responses']);

export function safeRsvpFormUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048)
    return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port !== ''
    ) {
      return null;
    }

    const hostname = url.hostname.toLowerCase();
    if (hostname === 'forms.gle') {
      const shortLinkMatch = url.pathname.match(RESPONDENT_SHORT_LINK_PATH);
      if (
        !shortLinkMatch ||
        MANAGEMENT_PATHS.has(shortLinkMatch[1].toLowerCase())
      ) {
        return null;
      }

      return url.toString();
    }

    if (
      hostname === 'docs.google.com' &&
      RESPONDENT_FORM_PATH.test(url.pathname)
    ) {
      return url.toString();
    }

    return null;
  } catch {
    return null;
  }
}
