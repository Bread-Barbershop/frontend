import type { Editor } from '@tiptap/react';

export function isTextMarkFullyActive(
  editor: Editor,
  markName: string
): boolean {
  const { state } = editor;
  const { from: selectionFrom, to: selectionTo, empty } = state.selection;
  const markType = state.schema.marks[markName];

  if (!markType) return false;

  // A toolbar toggle with a collapsed caret targets the complete field. Use
  // that same target to determine whether the mark is fully active so the
  // first click on mixed content turns it on everywhere.
  const targetsWholeDocument = empty && !editor.isEmpty;
  if (empty && !targetsWholeDocument) return editor.isActive(markName);

  const from = targetsWholeDocument ? 0 : selectionFrom;
  const to = targetsWholeDocument ? state.doc.content.size : selectionTo;

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
