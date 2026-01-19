import { Mark, mergeAttributes } from '@tiptap/core';
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textStroke: {
      setTextStroke: (attributes: {
        width?: string;
        color?: string;
      }) => ReturnType;
      unsetTextStroke: () => ReturnType;
    };
  }
}
export const TextStroke = Mark.create({
  name: 'textStroke',
  // addAttributes() {
  //   return {
  //     width: { default: '1px' },
  //     color: { default: 'black' },
  //   };
  // },
  //   renderHTML({ HTMLAttributes }) {
  //   return [
  //     'span',
  //     mergeAttributes(HTMLAttributes, {
  //       style: `-webkit-text-stroke: ${HTMLAttributes.width} ${HTMLAttributes.color}; text-stroke: ${HTMLAttributes.width} ${HTMLAttributes.color}`,
  //     }),
  //     0,
  //   ];
  // },
  addAttributes() {
    return {
      width: {
        default: '1px',
        // 스타일에서 두께를 가져오는 더 확실한 방법
        parseHTML: element => {
          return (
            element.style.webkitTextStrokeWidth ||
            element.style.getPropertyValue('-webkit-text-stroke-width') ||
            '1px'
          );
        },
        renderHTML: attributes => ({ 'data-width': attributes.width }),
      },
      color: {
        default: 'black',
        // 스타일에서 색상을 가져오는 더 확실한 방법
        parseHTML: element => {
          return (
            element.style.webkitTextStrokeColor ||
            element.style.getPropertyValue('-webkit-text-stroke-color') ||
            'black'
          );
        },
        renderHTML: attributes => ({ 'data-color': attributes.color }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { width, color, ...rest } = HTMLAttributes;
    return [
      'span',
      mergeAttributes(rest, {
        style: `-webkit-text-stroke: ${width} ${color}; text-stroke: ${width} ${color};`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setTextStroke:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetTextStroke:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
