import DOMPurify from 'isomorphic-dompurify';

const TEXT_STYLES = new Set([
  'color',
  'background-color',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'text-align',
  'text-decoration',
  'line-height',
  'white-space',
]);

DOMPurify.addHook('afterSanitizeAttributes', node => {
  if (!('getAttribute' in node)) return;
  const element = node as Element & { style?: CSSStyleDeclaration };
  if (element.hasAttribute('style') && element.style) {
    const safe: string[] = [];
    for (const property of Array.from(element.style)) {
      const value = element.style.getPropertyValue(property).trim();
      if (
        TEXT_STYLES.has(property) &&
        !/[\\<>]/.test(value) &&
        !Array.from(value).some(character => character.charCodeAt(0) < 32) &&
        !/(?:url|expression|var)\s*\(|@import/i.test(value)
      )
        safe.push(`${property}: ${value}`);
    }
    if (safe.length) element.setAttribute('style', safe.join('; '));
    else element.removeAttribute('style');
  }
  if (element.tagName === 'A') {
    element.setAttribute('rel', 'noopener noreferrer');
    if (element.getAttribute('target') !== '_blank')
      element.removeAttribute('target');
  }
});

/** Drive에서 직접 수정한 HTML도 렌더 경계에서 검증한다. */
export function sanitizeRichHtml(html: string): string {
  return DOMPurify.sanitize(typeof html === 'string' ? html : '', {
    ALLOWED_TAGS: [
      'p',
      'br',
      'span',
      'div',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'ul',
      'ol',
      'li',
      'a',
    ],
    ALLOWED_ATTR: ['style', 'href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|\/(?!\/)|#)/i,
  });
}
