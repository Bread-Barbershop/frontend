import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import type { EditorBlock } from '@/shared/types/block';

type TiptapJsonContent = import('@tiptap/core').JSONContent;

type RichTextPair = {
  jsonKey: 'messageJson' | 'contentsJson';
  htmlKey: 'messageHtml' | 'contentsHtml';
};

const RICH_TEXT_PAIRS: RichTextPair[] = [
  { jsonKey: 'messageJson', htmlKey: 'messageHtml' },
  { jsonKey: 'contentsJson', htmlKey: 'contentsHtml' },
];

function applyFontSizeToContent(
  content: TiptapJsonContent | null | undefined,
  fontSize: string
): TiptapJsonContent | null | undefined {
  if (!content) return content;

  const nextContent = Array.isArray(content.content)
    ? content.content.map(child => applyFontSizeToContent(child, fontSize))
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
        fontSize,
      },
    };
  } else {
    marks.push({
      type: 'textStyle',
      attrs: {
        fontSize,
      },
    });
  }

  return {
    ...content,
    marks,
  };
}

function updateRichTextProps<T>(value: T, fontSize: string): T {
  if (Array.isArray(value)) {
    return value.map(item => updateRichTextProps(item, fontSize)) as T;
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

    const nextJson = applyFontSizeToContent(richTextJson, fontSize);
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

    nextValue[key] = updateRichTextProps(currentValue, fontSize);
  });

  return nextValue as T;
}

export function applyBulkBodyFontSizeToBlocks(
  blocks: EditorBlock[],
  fontSize: string
) {
  return blocks.map(block => ({
    ...block,
    props: updateRichTextProps(block.props, fontSize),
  }));
}
