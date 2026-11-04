import TextAlign from '@tiptap/extension-text-align';

/**
 * 기본 @tiptap/extension-text-align을 확장하여
 * '문장 시작 일렬 가운데 맞춤(center-left)'을 지원하는 커스텀 Extension.
 *
 * center-left 정렬 시 data-text-align 속성과 인라인 display: table 스타일을 함께 부여하여
 * TipTap 에디터 및 PreviewBody에서 가장 긴 문장 폭 기준으로 화면 중앙에 배치되고,
 * 문장 시작점(첫 글자)은 좌측에 일렬 정렬되도록 보장합니다.
 */
export const CustomTextAlign = TextAlign.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      types: ['paragraph'],
      alignments: ['left', 'center', 'right', 'justify', 'center-left'],
      defaultAlignment: 'left',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: element => {
              const dataAlign = element.getAttribute('data-text-align');
              if (dataAlign === 'center-left') {
                return 'center-left';
              }
              return element.style.textAlign || this.options.defaultAlignment;
            },
            renderHTML: attributes => {
              if (attributes.textAlign === 'center-left') {
                return {
                  'data-text-align': 'center-left',
                  style:
                    'text-align: left; display: table; margin-left: auto; margin-right: auto; max-width: 100%;',
                };
              }

              if (attributes.textAlign === this.options.defaultAlignment) {
                return {};
              }

              return {
                style: `text-align: ${attributes.textAlign}`,
              };
            },
          },
        },
      },
    ];
  },
});
