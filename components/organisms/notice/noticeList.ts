import type { JSONContent } from '@tiptap/react';

export const NOTICE_LIST: JSONContent[] = [
  {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          { type: 'text', text: '연회 & 식사 안내', marks: [{ type: 'bold' }] },
        ],
      },
      { type: 'paragraph', attrs: { textAlign: 'center' } },
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          {
            type: 'text',
            text: '하객 여러분께 감사의 마음을 담아 웨딩홀 N층 연회장에서 식사를 제공합니다.',
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
