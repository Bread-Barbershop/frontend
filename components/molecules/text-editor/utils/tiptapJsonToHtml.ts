import {
  generateHTML as generateHTMLInBrowser,
  type JSONContent,
} from '@tiptap/core';
import { generateHTML as generateHTMLUniversal } from '@tiptap/html';

import { createTextEditorBarExtensions } from './tiptapExtensions';

function preserveEmptyParagraphLineBreak(html: string): string {
  return html.replace(/<p([^>]*)>\s*<\/p>/g, '<p$1><br /></p>');
}

export function tiptapJsonToHtmlInBrowser(
  content?: JSONContent | null
): string {
  if (!content) return '';

  if (typeof document === 'undefined') {
    throw new Error(
      'tiptapJsonToHtmlInBrowser can only run in browser. Use tiptapJsonToHtmlUniversal for server.'
    );
  }

  const html = generateHTMLInBrowser(content, createTextEditorBarExtensions());
  return preserveEmptyParagraphLineBreak(html);
}

export function tiptapJsonToHtmlUniversal(
  content?: JSONContent | null
): string {
  if (!content) return '';

  const html = generateHTMLUniversal(content, createTextEditorBarExtensions());
  return preserveEmptyParagraphLineBreak(html);
}
