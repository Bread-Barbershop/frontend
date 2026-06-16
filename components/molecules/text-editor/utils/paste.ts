const BLOCK_SELECTOR =
  'address, article, aside, blockquote, dd, div, dl, dt, fieldset, figcaption, figure, footer, form, h1, h2, h3, h4, h5, h6, header, hr, li, main, nav, ol, p, pre, section, table, tr, ul';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizePlainText(text: string): string {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function plainTextToHtml(text: string): string {
  const normalizedText = normalizePlainText(text);

  if (!normalizedText) return '';

  return normalizedText
    .split(/\n{2,}/)
    .map(
      paragraph =>
        `<p>${paragraph.split('\n').map(escapeHtml).join('<br />')}</p>`
    )
    .join('');
}

export function normalizePastedHtmlToPlainText(html: string): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');

  document.body.querySelectorAll('br').forEach(element => {
    element.replaceWith(document.createTextNode('\n'));
  });

  document.body.querySelectorAll(BLOCK_SELECTOR).forEach(element => {
    element.append(document.createTextNode('\n'));
  });

  return plainTextToHtml(document.body.textContent ?? '');
}

export function normalizePastedText(text: string): string {
  return normalizePlainText(text);
}
