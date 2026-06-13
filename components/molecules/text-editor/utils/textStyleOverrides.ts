import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontStyleOverride: {
      setFontStyleOverride: (value: 'normal' | null) => ReturnType;
    };
    textDecorationOverride: {
      setTextDecorationOverride: (value: 'none' | null) => ReturnType;
    };
  }
}

declare module '@tiptap/extension-text-style' {
  interface TextStyleAttributes {
    fontStyleOverride?: 'normal' | null;
    textDecorationOverride?: 'none' | null;
  }
}

export const FontStyleOverride = Extension.create({
  name: 'fontStyleOverride',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontStyleOverride: {
            default: null,
            parseHTML: element => {
              const style = element.style.fontStyle;
              return style === 'normal' ? 'normal' : null;
            },
            renderHTML: attributes => {
              if (attributes.fontStyleOverride !== 'normal') return {};

              return {
                style: 'font-style: normal',
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontStyleOverride:
        (value: 'normal' | null) =>
        ({ chain }) =>
          chain()
            .setMark('textStyle', { fontStyleOverride: value })
            .run(),
    };
  },
});

export const TextDecorationOverride = Extension.create({
  name: 'textDecorationOverride',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textDecorationOverride: {
            default: null,
            parseHTML: element => {
              const style = element.style.textDecoration;
              return style === 'none' ? 'none' : null;
            },
            renderHTML: attributes => {
              if (attributes.textDecorationOverride !== 'none') return {};

              return {
                style: 'text-decoration: none',
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextDecorationOverride:
        (value: 'none' | null) =>
        ({ chain }) =>
          chain()
            .setMark('textStyle', { textDecorationOverride: value })
            .run(),
    };
  },
});
