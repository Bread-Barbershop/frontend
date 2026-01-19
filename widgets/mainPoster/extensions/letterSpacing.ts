import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    letterSpacing: {
      setLetterSpacing: (value: string) => ReturnType;
      unsetLetterSpacing: () => ReturnType;
    };
  }
}

export const LetterSpacing = Extension.create({
  name: 'letterSpacing',

  addOptions() {
    return {
      types: ['textStyle'], // TextStyle 마크에 속성을 추가합니다.
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          letterSpacing: {
            default: null,
            parseHTML: element =>
              element.style.letterSpacing?.replace('px', ''),
            renderHTML: attributes => {
              if (!attributes.letterSpacing) {
                return {};
              }
              return {
                style: `letter-spacing: ${attributes.letterSpacing}px`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLetterSpacing:
        (value: string) =>
        ({ chain }) => {
          return chain().setMark('textStyle', { letterSpacing: value }).run();
        },
      unsetLetterSpacing:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { letterSpacing: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
