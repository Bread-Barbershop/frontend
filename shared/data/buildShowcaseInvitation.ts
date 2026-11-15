import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { blockSchema } from '@/shared/data/registry/block.schema';
import type { EditorBlock } from '@/shared/types/block';
import type { BlockType } from '@/shared/types/editor';

import type { ShowcaseInvitation } from './showcaseInvitations';
import type { JSONContent } from '@tiptap/core';

function richText(lines: string[]) {
  const json: JSONContent = {
    type: 'doc',
    content: lines.map(text => ({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    })),
  };
  return { json, html: tiptapJsonToHtmlUniversal(json) };
}

function eventTime(time: string, offset = 0) {
  const [hours, minutes] = time.split(':').map(Number);
  const total = hours * 60 + minutes + offset;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function buildShowcaseInvitation(design: ShowcaseInvitation) {
  const [backgroundColor, accent, text] = design.palette;
  const isWedding = design.type === 'wedding';
  const isSeminar = design.type === 'seminar';
  const isBaby = design.type === 'firstBirthday';
  const index = Number(design.id.replace('showcase-', ''));

  function block<T extends BlockType>(
    component: T,
    overrides: Partial<EditorBlock<T>['props']>
  ): EditorBlock<T> {
    const defaults = Object.fromEntries(
      Object.entries(blockSchema[component].fields).map(([key, field]) => [
        key,
        typeof field.default === 'function' ? field.default() : field.default,
      ])
    ) as EditorBlock<T>['props'];
    return {
      id: `${design.id}-${component}`,
      type: design.type,
      component,
      props: { ...defaults, ...overrides },
    };
  }

  const greeting = richText(design.message);
  const closing = richText([
    isSeminar
      ? '당신의 다음 생각이 시작되는 곳에서 만나요.'
      : isBaby
        ? '작은 아이에게 보내 주신 큰 사랑, 오래 기억하겠습니다.'
        : isWedding
          ? '함께해 주시는 모든 마음을 오래 간직하겠습니다.'
          : '함께라서 더 좋은 날, 기다리고 있을게요.',
    isSeminar
      ? 'INVIA CONFERENCE 2026'
      : isWedding
        ? '민성 · 아현 드림'
        : isBaby
          ? '사랑을 담아, 민준이네 가족 드림'
          : '민혁 드림',
  ]);
  const [hour, minute] = design.time.split(':').map(Number);
  const calendar = block('calendar', {
    title: isWedding
      ? '우리의 약속이 시작되는 날'
      : isSeminar
        ? '우리의 다음 만남'
        : '이날, 우리 만나요',
    subTitle: 'SAVE THE DATE',
    date: design.date,
    time: `${hour < 12 ? '오전' : '오후'} ${String(hour % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    template: `calendarType${(index % 5) + 1}`,
    showCalendar: true,
    showStringDate: true,
    showDday: false,
  });
  const timeline = block('timeline', {
    title: isSeminar
      ? '이야기가 이어지는 시간'
      : isBaby
        ? '첫 생일의 작은 순간들'
        : '함께할 하루의 장면들',
    items: design.moments.map((title, order) => ({
      id: `${design.id}-moment-${order}`,
      time: eventTime(design.time, [-30, 0, 60][order]),
      title,
      description: isSeminar
        ? [
            '등록과 환영 인사 · 새로운 연결의 시작',
            'Andrew Jackson과 함께하는 메인 세션',
            '서로의 관점을 나누는 자유로운 대화',
          ][order]
        : isWedding
          ? [
              '소중한 여러분을 반갑게 맞이합니다.',
              '서로의 평생을 약속하는 순간을 함께해 주세요.',
              '감사의 마음을 담아 식사를 준비했습니다.',
            ][order]
          : isBaby
            ? [
                '가족과 함께 인사를 나누고 사진을 남겨요.',
                '아이의 첫 선택을 함께 응원해 주세요.',
                '작은 소원을 빌고, 맛있는 식사를 함께해요.',
              ][order]
            : [
                '편안하게 모여 반가운 인사를 나눠요.',
                '좋아하는 사람들과 기쁜 순간을 나눠요.',
                '서두르지 말고, 우리 이야기를 더 나눠요.',
              ][order],
    })),
  });
  const picture = block('picture', {
    image: [
      isWedding
        ? '/images/showcase/garden-table.webp'
        : '/images/showcase/birthday-table.webp',
    ],
    isTitle: true,
    title: isWedding
      ? '당신을 기다리는 풍경'
      : isBaby
        ? '첫 생일을 위한 작은 준비'
        : '좋아하는 것들로 채운 하루',
    isSubTitle: true,
    subTitle: isWedding ? 'A MOMENT TO CHERISH' : 'MADE WITH LOVE',
  });
  const speakerMessage = richText([
    'Business Strategy & Creative Leadership',
    '변화하는 시장에서 기회를 발견하고, 아이디어를 실행으로 옮기는 방법을 이야기합니다.',
  ]);
  const speaker = block('speakerInformation', {
    title: '오늘의 이야기를 나눌 사람',
    subTitle: 'MEET THE SPEAKER',
    speakers: [
      {
        id: `${design.id}-speaker`,
        name: 'Andrew Jackson',
        image: [],
        messageJson: speakerMessage.json,
        messageHtml: speakerMessage.html,
      },
    ],
  });

  const blocks: EditorBlock[] = [
    block('spacer', { height: isSeminar ? 32 : 48 }),
    block('greeting', {
      title: design.heading,
      subTitle: design.eyebrow,
      messageJson: greeting.json,
      messageHtml: greeting.html,
    }),
    block('divider', {
      color: accent,
      height: 48,
      thickness: 1,
      topSpacing: 16,
      bottomSpacing: 16,
    }),
    ...(isSeminar
      ? [calendar, speaker, timeline]
      : index % 2 === 0
        ? [picture, calendar, timeline]
        : [calendar, timeline, picture]),
    block('place', {
      title: isWedding ? '마음이 모이는 곳' : '여기에서 만나요',
      subTitle: 'OUR MEETING PLACE',
      placeName: design.venue,
      placeAddress: '서울 강남구 테헤란로1길 19',
      placeDetail: '',
      placeTel: '',
      checkedPlaceTel: false,
      openMap: false,
      openNavi: false,
    }),
    block('dressCode', {
      title: isSeminar ? '만남을 위한 작은 준비' : '더 편안한 하루를 위해',
      colors: [
        backgroundColor,
        accent,
        isBaby ? '#E2CBB4' : isWedding ? '#B8C2A6' : '#EDC9B1',
      ],
      guidelines: [
        design.note,
        isSeminar
          ? '전체 세션은 한국어로 진행되며, 메모와 사진 촬영이 가능합니다.'
          : isBaby
            ? '함께해 주시는 마음만으로 충분합니다. 편하게 오셔서 축하해 주세요.'
            : '함께하는 순간을 편안하게 즐겨 주세요.',
      ],
    }),
    block('closingComment', {
      messageJson: closing.json,
      messageHtml: closing.html,
    }),
  ];

  return {
    blocks,
    bulkData: {
      backgroundColor,
      titleData: {
        font: design.font,
        fontSize: '22px',
        fontWeight: isSeminar ? '700' : '500',
        color: accent,
        isDefault: false,
      },
      bodyData: {
        font: 'SUIT',
        fontSize: '14px',
        fontWeight: '400',
        color: text,
        isDefault: false,
      },
      isZoom: false,
    },
  };
}
