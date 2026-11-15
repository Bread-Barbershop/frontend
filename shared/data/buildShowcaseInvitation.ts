import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { blockSchema } from '@/shared/data/registry/block.schema';
import { getShowcasePresentation } from '@/shared/data/showcasePresentation';
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
  const presentation = getShowcasePresentation(design);

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
      isSeminar
        ? '/images/showcase/conference-hall.webp'
        : presentation.photos[0],
    ],
    isTitle: true,
    title: isSeminar
      ? '우리가 마주 앉을 공간'
      : isWedding
        ? '당신을 기다리는 풍경'
        : isBaby
          ? '첫 생일을 위한 작은 준비'
          : '좋아하는 것들로 채운 하루',
    isSubTitle: true,
    subTitle: isSeminar
      ? 'THE CONFERENCE VENUE'
      : isWedding
        ? 'A MOMENT TO CHERISH'
        : 'MADE WITH LOVE',
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
        image: ['/images/showcase/conference-speaker.webp'],
        messageJson: speakerMessage.json,
        messageHtml: speakerMessage.html,
      },
    ],
  });

  const coupleStory = richText([
    presentation.note,
    '박민성 · 김아현, 서로의 오늘과 내일이 되겠습니다.',
  ]);
  const couple = block('coupleIntroduction', {
    title: '서로의 가장 가까운 사람',
    subTitle: 'MINSUNG & AHHYUN',
    groom: '박민성',
    bride: '김아현',
    showTitle: true,
    showContent: true,
    messageJson: coupleStory.json,
    messageHtml: coupleStory.html,
  });
  const childStory = richText([
    '작은 손을 꼭 잡았던 첫날부터, 혼자서 한 걸음을 떼기까지.',
    '함께 웃고 기다려 주신 덕분에, 민준이의 세상은 매일 조금씩 넓어지고 있어요.',
  ]);
  const child = block('myChild', {
    title: '우리 집에 찾아온 작은 우주',
    subTitle: '365 DAYS OF LITTLE MIRACLES',
    name: '민준',
    nickname: '우리의 작은 기쁨',
    birthday: '2025. 08. 11',
    image: [],
    messageJson: childStory.json,
    messageHtml: childStory.html,
  });
  const gallery = block('gallery', {
    title: isBaby
      ? '첫 생일을 위해 모은 마음'
      : isWedding
        ? '오래 간직할 장면들'
        : '이런 오후를 준비했어요',
    subTitle: isBaby ? 'THE LITTLE THINGS' : 'COLLECTING OUR MOMENTS',
    images: presentation.photos,
    template:
      presentation.family === 'editorial'
        ? 'galleryType6'
        : presentation.family === 'scrapbook'
          ? 'galleryType3'
          : 'galleryType1',
    ratio: '3:4',
    isPopupViewer: true,
    isAutoPlay: false,
  });
  const answer = richText(
    isWedding
      ? [
          presentation.note,
          '기쁜 날에도, 조금 서툰 날에도 서로의 이야기를 끝까지 들어 주는 사람이 되려 합니다. 저희의 약속에 함께해 주세요.',
        ]
      : isBaby
        ? [
            '작은 공을 굴려 주면 세상에서 가장 크게 웃어요. 좋아하는 노래가 나오면 온몸으로 춤을 추고요.',
            '아직 말로는 다 표현하지 못하지만, 민준이는 여러분이 보내 주신 사랑을 매일 배우고 있어요.',
          ]
        : [
            '좋아하는 노래가 나오면 같이 흥얼거리고, 맛있는 음식 앞에서는 오래 이야기를 나눌 거예요.',
            '선물보다 반가운 얼굴을, 격식보다 편안한 마음을 기다릴게요. 우리답게 즐겨요.',
          ]
  );
  const interview = block('interview', {
    title: isWedding
      ? '우리의 마음을 조금 더'
      : isBaby
        ? '민준이는 요즘요'
        : '이번 생일에 하고 싶은 일',
    subTitle: isWedding ? 'A SMALL CONVERSATION' : 'A LITTLE STORY',
    questions: [
      {
        id: `${design.id}-story`,
        question: isWedding
          ? '우리가 함께 지키고 싶은 한 가지는?'
          : isBaby
            ? '어떤 순간에 가장 환하게 웃나요?'
            : '어떤 하루로 기억되면 좋을까요?',
        answer: { messageJson: answer.json, messageHtml: answer.html },
        image: [presentation.photos[1] ?? presentation.photos[0]],
      },
    ],
  });
  const transportation = block('transportation', {
    title: '오는 길까지 편안하시도록',
    subwayLine: '2호선 · 신분당선',
    subwayStation: '강남역',
    subwayExit: '11번 출구',
    subwayWalk:
      '출구에서 도보 약 5분, 건물 1층 안내 데스크에서 행사장으로 안내해 드립니다.',
    parkingHours: '행사 참석자 무료 주차 2시간',
    alternativeParking:
      '로비에서 차량 번호를 등록해 주세요. 만차 시 현장 안내를 도와드립니다.',
    busRoutes: '',
    shuttleStop: '',
    shuttleInterval: '',
    navigationUrl: '',
  });
  const introduction = block('greeting', {
    title: design.heading,
    subTitle: design.eyebrow,
    messageJson: greeting.json,
    messageHtml: greeting.html,
  });
  const place = block('place', {
    title: isWedding ? '마음이 모이는 곳' : '여기에서 만나요',
    subTitle: 'OUR MEETING PLACE',
    placeName: design.venue,
    placeAddress: '서울 강남구 테헤란로1길 19',
    placeDetail: '',
    placeTel: '',
    checkedPlaceTel: false,
    openMap: false,
    openNavi: false,
  });
  const dressCode = block('dressCode', {
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
  });
  const closingComment = block('closingComment', {
    messageJson: closing.json,
    messageHtml: closing.html,
  });
  const divider = block('divider', {
    color: accent,
    height: 40,
    thickness: 1,
    topSpacing: 12,
    bottomSpacing: 12,
  });
  const chapters: EditorBlock[] = isSeminar
    ? [
        introduction,
        timeline,
        speaker,
        picture,
        calendar,
        place,
        transportation,
        dressCode,
      ]
    : isBaby
      ? [
          introduction,
          child,
          gallery,
          calendar,
          interview,
          timeline,
          picture,
          place,
          transportation,
          dressCode,
        ]
      : !isWedding
        ? [
            introduction,
            picture,
            calendar,
            interview,
            timeline,
            gallery,
            place,
            dressCode,
          ]
        : presentation.family === 'editorial'
          ? [
              introduction,
              gallery,
              couple,
              interview,
              calendar,
              timeline,
              place,
              transportation,
              dressCode,
            ]
          : presentation.family === 'botanical' || presentation.family === 'sky'
            ? [
                introduction,
                couple,
                picture,
                interview,
                calendar,
                gallery,
                timeline,
                place,
                dressCode,
                transportation,
              ]
            : [
                introduction,
                couple,
                picture,
                calendar,
                gallery,
                interview,
                timeline,
                place,
                transportation,
                dressCode,
              ];
  const blocks: EditorBlock[] = [
    block('spacer', { height: 12 }),
    ...chapters,
    divider,
    closingComment,
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
