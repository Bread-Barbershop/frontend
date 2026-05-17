import type { Editor } from '@tiptap/react';

export function isTextMarkFullyActive(
  editor: Editor,
  markName: string
): boolean {
  const { state } = editor;
  const { from, to, empty } = state.selection;
  const markType = state.schema.marks[markName];

  if (!markType) return false;
  if (empty) return editor.isActive(markName);

  let hasSelectedText = false;
  let isFullyActive = true;

  state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText || !node.text) return;

    const textFrom = Math.max(from, pos);
    const textTo = Math.min(to, pos + node.nodeSize);

    if (textFrom >= textTo) return;

    hasSelectedText = true;

    if (!markType.isInSet(node.marks)) {
      isFullyActive = false;
    }
  });

  return hasSelectedText && isFullyActive;
}
