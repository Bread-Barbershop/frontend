import { sanitizeRichHtml } from './sanitizeRichHtml';

/** Strip executable markup before persistence as well as at the rendering boundary. */
export function sanitizeInvitationHtml(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeInvitationHtml);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      typeof item === 'string' && key === 'html'
        ? sanitizeRichHtml(item)
        : sanitizeInvitationHtml(item),
    ])
  );
}
