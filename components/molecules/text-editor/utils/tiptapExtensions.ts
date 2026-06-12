import { AnyExtension } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import Color from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Italic from '@tiptap/extension-italic';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import TextAlign from '@tiptap/extension-text-align';
import { FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';

import { FontStyleOverride, TextDecorationOverride } from './textStyleOverrides';
import { FontWeight } from './fontWeight';

/**
 * TextEditorBar에서 사용하는 TipTap extension 목록을 반환합니다.
 * 에디터/미리보기가 동일한 스키마를 공유하도록 한 곳에서 관리합니다.
 */
export function createTextEditorBarExtensions(
  placeholder?: string
): AnyExtension[] {
  const extensions: AnyExtension[] = [
    Document,
    Paragraph,
    Text,
    HardBreak.configure({
      keepMarks: true,
    }),
    Bold,
    Italic,
    Underline,
    TextStyle,
    Color,
    FontFamily,
    FontWeight,
    FontSize,
    FontStyleOverride,
    TextDecorationOverride,
    TextAlign.configure({
      types: ['paragraph'],
    }),
  ];

  if (placeholder) {
    extensions.push(
      Placeholder.configure({
        placeholder,
      })
    );
  }

  return extensions;
}
