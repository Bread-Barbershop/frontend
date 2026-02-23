import ListItem from '@tiptap/extension-list-item';

import type { Editor } from '@tiptap/core';

export const customListItem = ListItem.extend({
  addKeyboardShortcuts() {
    const parentShortcuts = this.parent?.() ?? {};

    const shouldLiftListItem = (editor: Editor) => {
      const { state } = editor;
      const { $from } = state.selection;

      if (!editor.isActive(this.name)) {
        return false;
      }

      return (
        state.selection.empty &&
        $from.parent.isTextblock &&
        $from.parent.textContent.length === 0
      );
    };

    return {
      ...parentShortcuts,
      Enter: ({ editor }) => {
        if (shouldLiftListItem(editor)) {
          return editor.chain().focus().liftListItem(this.name).run();
        }

        return editor.chain().focus().splitListItem(this.name).run();
      },
      Backspace: ({ editor }) => {
        if (!shouldLiftListItem(editor)) {
          return false;
        }

        return editor.chain().focus().liftListItem(this.name).run();
      },
    };
  },
});
