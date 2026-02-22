import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import Color from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import Italic from '@tiptap/extension-italic';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import TextAlign from '@tiptap/extension-text-align';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';

import { customListItem } from './customListItem';

/**
 * TextEditorBar에서 사용하는 TipTap extension 목록을 반환합니다.
 * 에디터/미리보기가 동일한 스키마를 공유하도록 한 곳에서 관리합니다.
 */
export function createTextEditorBarExtensions() {
  return [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Underline,
    TextStyle,
    Color,
    customListItem,
    BulletList,
    FontSize,
    TextAlign.configure({
      types: ['paragraph'],
      defaultAlignment: 'left',
    }),
  ];
}
