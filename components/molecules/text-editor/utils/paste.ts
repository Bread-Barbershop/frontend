export function stripFontSizeFromHtml(html: string): string {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');

  document.body.querySelectorAll<HTMLElement>('[style]').forEach(element => {
    element.style.removeProperty('font-size');

    if (!element.getAttribute('style')?.trim()) {
      element.removeAttribute('style');
    }
  });

  document.body.querySelectorAll('font[size]').forEach(element => {
    element.removeAttribute('size');
  });

  return document.body.innerHTML;
}
