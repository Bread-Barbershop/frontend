import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import type { EditorBlock } from '@/shared/types/block';

type TiptapJsonContent = import('@tiptap/core').JSONContent;
type UpdateRichText = (
  json: TiptapJsonContent | null | undefined,
  html: string | null | undefined
) => { json?: TiptapJsonContent; html?: string } | undefined;

type RichTextPair = {
  jsonKey: 'messageJson' | 'contentsJson';
  htmlKey: 'messageHtml' | 'contentsHtml';
};

export type BulkTextStyle = {
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  color: string | null;
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

function updateRichTextProps<T>(value: T, update: UpdateRichText): T {
  if (Array.isArray(value)) {
    const next = value.map(item => updateRichTextProps(item, update));
    return next.some((item, index) => item !== value[index])
      ? (next as T)
      : value;
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  if (value instanceof File || value instanceof Blob) {
    return value;
  }

  const props = value as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  RICH_TEXT_PAIRS.forEach(({ jsonKey, htmlKey }) => {
    const json = props[jsonKey] as TiptapJsonContent | null | undefined;
    const html = props[htmlKey];
    const next = update(json, typeof html === 'string' ? html : undefined);
    if (next?.json !== undefined) updates[jsonKey] = next.json;
    if (next?.html !== undefined) updates[htmlKey] = next.html;
  });

  Object.entries(props).forEach(([key, currentValue]) => {
    if (!currentValue || typeof currentValue !== 'object') return;
    if (
      RICH_TEXT_PAIRS.some(pair => pair.jsonKey === key || pair.htmlKey === key)
    ) {
      return;
    }

    const nextValue = updateRichTextProps(currentValue, update);
    if (nextValue !== currentValue) updates[key] = nextValue;
  });

  return Object.keys(updates).length ? ({ ...props, ...updates } as T) : value;
}

function updateRichTextBlocks(blocks: EditorBlock[], update: UpdateRichText) {
  const next = blocks.map(block => {
    const props = updateRichTextProps(block.props, update);
    return props === block.props ? block : { ...block, props };
  });
  return next.some((block, index) => block !== blocks[index]) ? next : blocks;
}

export function applyBulkBodyStyleToBlocks(
  blocks: EditorBlock[],
  style: BulkTextStyle
) {
  return updateRichTextBlocks(blocks, json => {
    const nextJson = applyBulkStyleToContent(json, style);
    return nextJson
      ? { json: nextJson, html: tiptapJsonToHtmlInBrowser(nextJson) }
      : undefined;
  });
}

type LegacyBodyStyle = BulkTextStyle & { color: string };

function normalizedStyleValue(value: unknown) {
  return typeof value === 'string'
    ? value
        .trim()
        .replace(/^(['"])(.*)\1$/, '$2')
        .toLowerCase()
    : undefined;
}

function matchesLegacyBodyStyle(
  attrs: Record<string, unknown> | undefined,
  style: LegacyBodyStyle
) {
  return (
    normalizedStyleValue(attrs?.color) === normalizedStyleValue(style.color) &&
    normalizedStyleValue(attrs?.fontFamily) ===
      normalizedStyleValue(style.fontFamily) &&
    normalizedStyleValue(attrs?.fontSize) ===
      normalizedStyleValue(style.fontSize) &&
    normalizedStyleValue(attrs?.fontWeight) ===
      normalizedStyleValue(style.fontWeight)
  );
}

function restoreInheritedColorInJson(
  node: TiptapJsonContent,
  style: LegacyBodyStyle
): TiptapJsonContent {
  if (node.type === 'text') {
    // The inline picker emits rgba(...), including for explicitly selected black.
    const marks = node.marks?.map(mark =>
      mark.type === 'textStyle' && matchesLegacyBodyStyle(mark.attrs, style)
        ? { ...mark, attrs: { ...mark.attrs, color: null } }
        : mark
    );
    return marks?.some((mark, index) => mark !== node.marks?.[index])
      ? { ...node, marks }
      : node;
  }
  const content = node.content?.map(child =>
    restoreInheritedColorInJson(child, style)
  );
  return content?.some((child, index) => child !== node.content?.[index])
    ? { ...node, content }
    : node;
}

function restoreInheritedColorInHtml(html: string, style: LegacyBodyStyle) {
  if (
    typeof document === 'undefined' ||
    !html.toLowerCase().includes(style.color.toLowerCase())
  )
    return html;

  const template = document.createElement('template');
  template.innerHTML = html;
  let changed = false;
  for (const span of template.content.querySelectorAll<HTMLSpanElement>(
    'span[style]'
  )) {
    if (!span.style.color) continue;
    const declarations = (span.getAttribute('style') ?? '').split(';');
    const colorDeclarations = declarations.filter(value =>
      /^\s*color\s*:/i.test(value)
    );
    if (colorDeclarations.length !== 1) continue;

    const color = colorDeclarations[0].split(':')[1];
    const { fontFamily, fontSize, fontWeight } = span.style;
    if (
      !matchesLegacyBodyStyle(
        { color, fontFamily, fontSize, fontWeight },
        style
      )
    )
      continue;

    span.setAttribute(
      'style',
      declarations.filter(value => value !== colorDeclarations[0]).join(';')
    );
    changed = true;
  }
  return changed ? template.innerHTML : html;
}

export function restoreInheritedLegacyBodyColor(
  blocks: EditorBlock[],
  style: LegacyBodyStyle
) {
  return updateRichTextBlocks(blocks, (json, html) => {
    if (json) {
      if (typeof document === 'undefined') return undefined;
      try {
        const nextJson = restoreInheritedColorInJson(json, style);
        return nextJson === json
          ? undefined
          : { json: nextJson, html: tiptapJsonToHtmlInBrowser(nextJson) };
      } catch {
        // Preserve these fields if the current editor cannot serialize a legacy schema.
        return undefined;
      }
    }
    if (!html) return undefined;
    const nextHtml = restoreInheritedColorInHtml(html, style);
    return nextHtml === html ? undefined : { html: nextHtml };
  });
}
