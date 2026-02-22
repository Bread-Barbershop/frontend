import { generateHTML as generateHTMLInBrowser, type JSONContent } from '@tiptap/core';
import { generateHTML as generateHTMLUniversal } from '@tiptap/html';

import { createTextEditorBarExtensions } from './tiptapExtensions';

/**
 * TipTap JSON을 브라우저 환경에서 HTML 문자열로 변환합니다.
 * `@tiptap/core`의 generateHTML은 DOM(document)이 필요합니다.
 *
 * @param content TipTap JSON 문서
 * @returns 변환된 HTML 문자열
 * @throws 서버 환경에서 호출되면 에러를 던집니다.
 */
export function tiptapJsonToHtmlInBrowser(content?: JSONContent | null): string {
  if (!content) return '';

  if (typeof document === 'undefined') {
    throw new Error(
      'tiptapJsonToHtmlInBrowser can only run in browser. Use tiptapJsonToHtmlUniversal for server.',
    );
  }

  return generateHTMLInBrowser(content, createTextEditorBarExtensions());
}

/**
 * TipTap JSON을 서버/브라우저 환경 모두에서 HTML 문자열로 변환합니다.
 *
 * @param content TipTap JSON 문서
 * @returns 변환된 HTML 문자열
 */
export function tiptapJsonToHtmlUniversal(content?: JSONContent | null): string {
  if (!content) return '';

  return generateHTMLUniversal(content, createTextEditorBarExtensions());
}
