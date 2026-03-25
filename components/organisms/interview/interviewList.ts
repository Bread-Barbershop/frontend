import type { JSONContent } from '@tiptap/react';

export const QUESTION_LIST: JSONContent[] = [
  {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: '서로의 첫인상은 어땠나요?' }],
      },
      { type: 'paragraph', attrs: { textAlign: 'center' } },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          {
            type: 'text',
            text: '신랑\n처음 만났을 때 밝게 웃으며 인사하던 모습이 아직도 기억에 남아 있습니다.\n말 한마디, 행동 하나에 배려가 느껴져서\n자연스럽게 더 알고 싶다는 생각이 들었습니다.\n\n신부\n처음부터 편안한 사람이라는 인상이 강했습니다.\n과하지 않지만 진중한 태도가 인상 깊었고,\n함께 있으면 마음이 안정되는 느낌이 들었습니다.',
          },
        ],
      },
      { type: 'paragraph', attrs: { textAlign: 'center' } },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          {
            type: 'text',
            text: '여러 메뉴를 준비해 두었으니 천천히 맛보시며 여유로운 시간 되시길 바랍니다.',
          },
        ],
      },
    ],
  },
  {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: '주차 안내' }],
      },
    ],
  },
  {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: '행사 시간 안내' }],
      },
    ],
  },
  {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: '복장 안내 (드레스 코드)' }],
      },
    ],
  },
  {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [{ type: 'text', text: '사진 및 촬영 안내' }],
      },
    ],
  },
];
