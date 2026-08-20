import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import type { EditorBlock } from '@/shared/types/block';

type TiptapJsonContent = import('@tiptap/core').JSONContent;

type RichTextPair = {
  jsonKey: 'messageJson' | 'contentsJson';
  htmlKey: 'messageHtml' | 'contentsHtml';
};

export type BulkTextStyle = {
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  color: string;
};

const RICH_TEXT_PAIRS: RichTextPair[] = [
  { jsonKey: 'messageJson', htmlKey: 'messageHtml' },
  { jsonKey: 'contentsJson', htmlKey: 'contentsHtml' },
];

function applyBulkStyleToContent(
  content: TiptapJsonContent | null | undefined,
  style: BulkTextStyle
): TiptapJsonContent | null | undefined {
  if (!content) return content;

  const nextContent = Array.isArray(content.content)
    ? content.content.map(child => applyBulkStyleToContent(child, style))
    : content.content;

  if (content.type !== 'text') {
    return {
      ...content,
      content: nextContent as [],
    };
  }

  const marks = Array.isArray(content.marks) ? [...content.marks] : [];
  const textStyleIndex = marks.findIndex(mark => mark.type === 'textStyle');

  if (textStyleIndex >= 0) {
    const textStyle = marks[textStyleIndex];
    marks[textStyleIndex] = {
      ...textStyle,
      attrs: {
        ...textStyle.attrs,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        color: style.color,
      },
    };
  } else {
    marks.push({
      type: 'textStyle',
      attrs: {
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        color: style.color,
      },
    });
  }

  return {
    ...content,
    marks,
  };
}

function updateRichTextProps<T>(value: T, style: BulkTextStyle): T {
  if (Array.isArray(value)) {
    return value.map(item => updateRichTextProps(item, style)) as T;
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (value instanceof File || value instanceof Blob) {
    return value;
  }

  const nextValue = { ...(value as Record<string, unknown>) };

  RICH_TEXT_PAIRS.forEach(({ jsonKey, htmlKey }) => {
    const richTextJson = nextValue[jsonKey] as
      | TiptapJsonContent
      | null
      | undefined;

    if (!richTextJson) return;

    const nextJson = applyBulkStyleToContent(richTextJson, style);
    nextValue[jsonKey] = nextJson;
    nextValue[htmlKey] = nextJson ? tiptapJsonToHtmlInBrowser(nextJson) : null;
  });

  Object.keys(nextValue).forEach(key => {
    const currentValue = nextValue[key];

    if (!currentValue || typeof currentValue !== 'object') return;
    if (
      RICH_TEXT_PAIRS.some(pair => pair.jsonKey === key || pair.htmlKey === key)
    ) {
      return;
    }

    nextValue[key] = updateRichTextProps(currentValue, style);
  });

  return nextValue as T;
}

export function applyBulkBodyStyleToBlocks(
  blocks: EditorBlock[],
  style: BulkTextStyle
) {
  return blocks.map(block => ({
    ...block,
    props: updateRichTextProps(block.props, style),
  }));
}
