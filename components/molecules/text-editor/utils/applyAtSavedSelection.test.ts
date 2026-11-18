import { Editor, type JSONContent } from '@tiptap/core';

import { runAtSavedTextSelection } from './applyAtSavedSelection';
import { isTextMarkFullyActive } from './markState';
import { createTextEditorBarExtensions } from './tiptapExtensions';

const createEditor = (content: JSONContent): Editor =>
  new Editor({
    element: document.createElement('div'),
    extensions: createTextEditorBarExtensions(),
    content,
  });

const textNodes = (editor: Editor) => {
  const nodes: Array<{
    text: string;
    marks: string[];
    attrs: Record<string, unknown>;
  }> = [];

  editor.state.doc.descendants(node => {
    if (!node.isText) return;

    const textStyle = node.marks.find(mark => mark.type.name === 'textStyle');
    nodes.push({
      text: node.text ?? '',
      marks: node.marks.map(mark => mark.type.name),
      attrs: textStyle?.attrs ?? {},
    });
  });

  return nodes;
};

describe('텍스트 편집기의 서식 적용 범위', () => {
  it('선택한 범위가 있을 때는 선택된 텍스트만 서식을 바꾸고 선택을 유지한다', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'first' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'second' }] },
      ],
    });

    try {
      const selection = { from: 2, to: 4 };
      editor.commands.setTextSelection(selection);
      runAtSavedTextSelection(
        editor,
        selection,
        command => command.setFontFamily('Test Sans'),
        { focusEditor: false }
      );

      expect(editor.state.selection.from).toBe(selection.from);
      expect(editor.state.selection.to).toBe(selection.to);
      expect(textNodes(editor)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ text: 'f', attrs: {} }),
          expect.objectContaining({
            text: 'ir',
            attrs: expect.objectContaining({ fontFamily: 'Test Sans' }),
          }),
          expect.objectContaining({ text: 'st', attrs: {} }),
          expect.objectContaining({ text: 'second', attrs: {} }),
        ])
      );
    } finally {
      editor.destroy();
    }
  });

  it('커서만 있을 때는 전체 문단과 텍스트에 서식을 적용하고 원래 커서를 복원한다', () => {
    let transactionCount = 0;
    const editor = new Editor({
      element: document.createElement('div'),
      extensions: createTextEditorBarExtensions(),
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { textAlign: 'left' },
            content: [{ type: 'text', text: 'first' }],
          },
          {
            type: 'paragraph',
            attrs: { textAlign: 'center' },
            content: [{ type: 'text', text: 'second' }],
          },
        ],
      },
      onTransaction: () => {
        transactionCount += 1;
      },
    });

    try {
      const cursor = 3;
      editor.commands.setTextSelection(cursor);
      transactionCount = 0;

      runAtSavedTextSelection(
        editor,
        { from: cursor, to: cursor },
        command =>
          command
            .setFontFamily('Test Sans')
            .setFontWeight('600')
            .setFontSize('18px')
            .setColor('#123456')
            .setTextAlign('right'),
        { focusEditor: false }
      );

      expect(transactionCount).toBe(1);
      expect(editor.state.selection.from).toBe(cursor);
      expect(editor.state.selection.to).toBe(cursor);
      expect(textNodes(editor)).toHaveLength(2);
      for (const node of textNodes(editor)) {
        expect(node.attrs).toEqual(
          expect.objectContaining({
            fontFamily: 'Test Sans',
            fontWeight: '600',
            fontSize: '18px',
            color: '#123456',
          })
        );
      }

      const paragraphAlignments: string[] = [];
      editor.state.doc.descendants(node => {
        if (node.type.name === 'paragraph') {
          paragraphAlignments.push(node.attrs.textAlign);
        }
      });
      expect(paragraphAlignments).toEqual(['right', 'right']);
    } finally {
      editor.destroy();
    }
  });

  it('도구 모음으로 이동한 뒤에도 저장된 선택 범위에만 서식을 적용한다', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'first' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'second' }] },
      ],
    });

    try {
      const savedSelection = { from: 2, to: 4 };
      editor.commands.setTextSelection(10);

      runAtSavedTextSelection(
        editor,
        savedSelection,
        command => command.setColor('#123456'),
        { focusEditor: false }
      );

      expect(editor.state.selection.from).toBe(savedSelection.from);
      expect(editor.state.selection.to).toBe(savedSelection.to);
      expect(textNodes(editor)).toEqual([
        expect.objectContaining({ text: 'f', attrs: {} }),
        expect.objectContaining({
          text: 'ir',
          attrs: expect.objectContaining({ color: '#123456' }),
        }),
        expect.objectContaining({ text: 'st', attrs: {} }),
        expect.objectContaining({ text: 'second', attrs: {} }),
      ]);
    } finally {
      editor.destroy();
    }
  });

  it('저장된 선택이 없어도 현재 커서에서 전체 적용하고 한 번에 실행 취소한다', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'first' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'second' }] },
      ],
    });

    try {
      const originalContent = editor.getJSON();
      const cursor = 10;
      editor.commands.setTextSelection(cursor);

      runAtSavedTextSelection(
        editor,
        null,
        command => command.setFontSize('20px').setColor('#123456'),
        { focusEditor: false }
      );

      expect(editor.state.selection.from).toBe(cursor);
      expect(editor.state.selection.to).toBe(cursor);
      for (const node of textNodes(editor)) {
        expect(node.attrs).toEqual(
          expect.objectContaining({ fontSize: '20px', color: '#123456' })
        );
      }

      expect(editor.commands.undo()).toBe(true);
      expect(editor.getJSON()).toEqual(originalContent);
    } finally {
      editor.destroy();
    }
  });

  it('커서가 빈 문단에 있으면 전체 서식과 다음 입력용 stored mark를 함께 설정한다', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'first' }] },
        { type: 'paragraph' },
      ],
    });

    try {
      const cursor = 8;
      editor.commands.setTextSelection(cursor);
      runAtSavedTextSelection(
        editor,
        { from: cursor, to: cursor },
        command => command.setFontFamily('Test Sans'),
        { focusEditor: false }
      );
      runAtSavedTextSelection(
        editor,
        { from: cursor, to: cursor },
        command => command.setFontSize('20px').setItalic(),
        { focusEditor: false }
      );
      runAtSavedTextSelection(
        editor,
        { from: cursor, to: cursor },
        command => command.setTextAlign('center'),
        { focusEditor: false, kind: 'block' }
      );

      expect(textNodes(editor)[0].attrs.fontFamily).toBe('Test Sans');
      const storedTextStyle = editor.state.storedMarks?.find(
        mark => mark.type.name === 'textStyle'
      );
      expect(storedTextStyle?.attrs).toEqual(
        expect.objectContaining({ fontFamily: 'Test Sans', fontSize: '20px' })
      );
      expect(
        editor.state.storedMarks?.some(mark => mark.type.name === 'italic')
      ).toBe(true);
      expect(editor.state.selection.from).toBe(cursor);

      editor.commands.insertContent('next');
      expect(textNodes(editor).at(-1)).toEqual(
        expect.objectContaining({
          text: 'next',
          marks: expect.arrayContaining(['textStyle', 'italic']),
          attrs: expect.objectContaining({
            fontFamily: 'Test Sans',
            fontSize: '20px',
          }),
        })
      );
    } finally {
      editor.destroy();
    }
  });

  it('빈 에디터의 연속 서식 명령은 stored mark를 누적해 다음 입력에 보존한다', () => {
    const editor = createEditor({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    });

    try {
      const cursor = editor.state.selection.from;
      runAtSavedTextSelection(
        editor,
        { from: cursor, to: cursor },
        command =>
          command
            .setFontFamily('Test Sans')
            .setFontWeight('600')
            .setFontSize('22px'),
        { focusEditor: false }
      );
      runAtSavedTextSelection(
        editor,
        { from: cursor, to: cursor },
        command => command.setItalic(),
        { focusEditor: false }
      );

      editor.commands.insertContent('hello');

      expect(textNodes(editor)).toEqual([
        expect.objectContaining({
          text: 'hello',
          marks: expect.arrayContaining(['textStyle', 'italic']),
          attrs: expect.objectContaining({
            fontFamily: 'Test Sans',
            fontWeight: '600',
            fontSize: '22px',
          }),
        }),
      ]);
    } finally {
      editor.destroy();
    }
  });

  it('커서 상태의 mark 토글은 전체 문서의 혼합 상태를 판정한다', () => {
    const editor = createEditor({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'italic',
              marks: [{ type: 'italic' }],
            },
          ],
        },
        { type: 'paragraph', content: [{ type: 'text', text: 'plain' }] },
      ],
    });

    try {
      editor.commands.setTextSelection(3);
      expect(isTextMarkFullyActive(editor, 'italic')).toBe(false);

      const firstParagraphSelection = { from: 1, to: 7 };
      editor.commands.setTextSelection(firstParagraphSelection);
      expect(isTextMarkFullyActive(editor, 'italic')).toBe(true);
    } finally {
      editor.destroy();
    }
  });

  it.each(['italic', 'underline'] as const)(
    '%s가 섞여 있으면 전체에 켜고 다시 누르면 전체에서 해제한다',
    markName => {
      const editor = createEditor({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'styled', marks: [{ type: markName }] },
            ],
          },
          { type: 'paragraph', content: [{ type: 'text', text: 'plain' }] },
        ],
      });

      try {
        const cursor = 3;
        editor.commands.setTextSelection(cursor);
        expect(isTextMarkFullyActive(editor, markName)).toBe(false);

        runAtSavedTextSelection(
          editor,
          null,
          command =>
            markName === 'italic'
              ? command.setItalic()
              : command.setUnderline(),
          { focusEditor: false }
        );

        expect(isTextMarkFullyActive(editor, markName)).toBe(true);
        expect(
          textNodes(editor).every(node => node.marks.includes(markName))
        ).toBe(true);

        runAtSavedTextSelection(
          editor,
          null,
          command =>
            markName === 'italic'
              ? command.unsetItalic()
              : command.unsetUnderline(),
          { focusEditor: false }
        );

        expect(isTextMarkFullyActive(editor, markName)).toBe(false);
        expect(
          textNodes(editor).every(node => !node.marks.includes(markName))
        ).toBe(true);
        expect(editor.state.selection.from).toBe(cursor);
        expect(editor.state.selection.to).toBe(cursor);
      } finally {
        editor.destroy();
      }
    }
  );

  it('텍스트가 없는 여러 문단에도 정렬을 적용한다', () => {
    const editor = createEditor({
      type: 'doc',
      content: [{ type: 'paragraph' }, { type: 'paragraph' }],
    });

    try {
      const cursor = editor.state.selection.from;
      runAtSavedTextSelection(
        editor,
        { from: cursor, to: cursor },
        command => command.setTextAlign('right'),
        { focusEditor: false, kind: 'block' }
      );

      const paragraphAlignments: string[] = [];
      editor.state.doc.descendants(node => {
        if (node.type.name === 'paragraph') {
          paragraphAlignments.push(node.attrs.textAlign);
        }
      });
      expect(paragraphAlignments).toEqual(['right', 'right']);
    } finally {
      editor.destroy();
    }
  });
});
