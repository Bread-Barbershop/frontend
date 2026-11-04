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

  // Node/Jest 환경에서 window/document가 없을 경우 JSDOM을 임시 주입하여 안전하게 변환
  if (typeof window === 'undefined') {
    try {
      /* eslint-disable @typescript-eslint/no-require-imports, import/no-extraneous-dependencies, @typescript-eslint/no-explicit-any */
      const { JSDOM } = require('jsdom');
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
      const previousWindow = (globalThis as any).window;
      const previousDocument = (globalThis as any).document;
      (globalThis as any).window = dom.window;
      (globalThis as any).document = dom.window.document;
      try {
        const html = generateHTMLUniversal(
          content,
          createTextEditorBarExtensions()
        );
        return preserveEmptyParagraphLineBreak(html);
      } finally {
        (globalThis as any).window = previousWindow;
        (globalThis as any).document = previousDocument;
      }
      /* eslint-enable @typescript-eslint/no-require-imports, import/no-extraneous-dependencies, @typescript-eslint/no-explicit-any */
    } catch {
      return '';
    }
  }

  const html = generateHTMLUniversal(content, createTextEditorBarExtensions());
  return preserveEmptyParagraphLineBreak(html);
}
