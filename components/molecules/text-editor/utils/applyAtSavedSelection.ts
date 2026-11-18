import type { ChainedCommands, Editor } from '@tiptap/react';

export type SavedTextSelection = {
  from: number;
  to: number;
};

type ApplyAtSavedSelectionOptions = {
  focusEditor?: boolean;
  kind?: 'inline' | 'block';
};

/**
 * Applies a toolbar command to the saved range, or to the whole field when
 * the saved selection is a caret. The final selection is restored in the same
 * transaction so the user never sees a temporary select-all state.
 */
export function runAtSavedTextSelection(
  editor: Editor,
  savedSelection: SavedTextSelection | null,
  applyCommand: (command: ChainedCommands) => ChainedCommands,
  { focusEditor = true, kind = 'inline' }: ApplyAtSavedSelectionOptions = {}
): void {
  const currentSelection = editor.state.selection;
  const selection = savedSelection ?? {
    from: currentSelection.from,
    to: currentSelection.to,
  };
  const docSize = editor.state.doc.content.size;
  const from = Math.min(Math.max(selection.from, 0), docSize);
  const to = Math.min(Math.max(selection.to, 0), docSize);
  const hasRange = from !== to;
  const isBlankParagraphCaret =
    !hasRange &&
    editor.state.doc.resolve(from).parent.isTextblock &&
    editor.state.doc.resolve(from).parent.content.size === 0;
  const needsWholeDocumentUpdate =
    !editor.isEmpty || editor.state.doc.childCount > 1;
  const caretMatchesCurrentSelection =
    !hasRange &&
    editor.state.selection.empty &&
    editor.state.selection.from === from;
  const storedMarksAtCaret = caretMatchesCurrentSelection
    ? editor.state.storedMarks
    : null;

  let command = editor.chain();

  if (hasRange) {
    command = command.setTextSelection({ from, to });
    command = applyCommand(command);
    command = command.command(({ tr }) => {
      tr.setStoredMarks(null);
      return true;
    });
  } else if (needsWholeDocumentUpdate) {
    // AllSelection includes the first and last paragraphs, even when a
    // paragraph is empty. Inline commands also run at a blank restored caret to
    // set the typing marks for future input.
    command = command.selectAll();
    command = applyCommand(command);
    command = command.setTextSelection(from);
    if (isBlankParagraphCaret && kind === 'inline') {
      command = command.command(({ tr }) => {
        // Keep prior typing marks so successive toolbar edits at this blank
        // caret (for example family, then size) accumulate their attributes.
        tr.setStoredMarks(storedMarksAtCaret);
        return true;
      });
      command = applyCommand(command);
    }
  } else {
    // On an empty field, mark commands update stored marks for future input.
    if (
      editor.state.selection.from !== from ||
      editor.state.selection.to !== to
    ) {
      command = command.setTextSelection(from);
    }
    command = applyCommand(command);
  }

  if (kind === 'block' && !hasRange) {
    command = command.command(({ tr }) => {
      tr.setStoredMarks(storedMarksAtCaret);
      return true;
    });
  }

  command.run();

  if (focusEditor) {
    editor.view.focus();
  }
}
