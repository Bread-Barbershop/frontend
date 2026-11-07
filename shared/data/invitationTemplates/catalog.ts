import type { BlockType } from '@/shared/types/editor';

import type {
  InvitationTemplate,
  PosterDesign,
  PosterElement,
  PosterTextElement,
} from './types';

const tx = (
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  fontFamily: string,
  fill: string,
  options: Pick<
    PosterTextElement,
    'fontWeight' | 'textAlign' | 'lineHeight' | 'letterSpacing'
  > = {}
): PosterTextElement => ({
  kind: 'text',
  text,
  x,
  y,
  width,
  height,
  fontSize,
  fontFamily,
  fill,
  textAlign: 'center',
  ...options,
});

const rule = (
  x: number,
  y: number,
  width: number,
  stroke: string,
  strokeWidth = 1
): PosterElement => ({
  kind: 'line',
  x,
  y,
  width,
  height: 0,
  stroke,
  strokeWidth,
});

const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke?: string,
  strokeWidth = 1
): PosterElement => ({
  kind: 'rect',
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
});

const slot = (
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string
): PosterElement => ({
  kind: 'rect',
  x,
  y,
  width,
  height,
  fill,
  stroke: '#CCD5CC',
  strokeWidth: 1,
  photoSlot: true,
});

const circle = (
  x: number,
  y: number,
  size: number,
  fill: string,
  stroke?: string,
  strokeWidth = 1
): PosterElement => ({
  kind: 'circle',
  x,
  y,
  width: size,
  height: size,
  fill,
  stroke,
  strokeWidth,
});

const poster = (
  background: string,
  objects: PosterElement[]
): PosterDesign => ({
  width: 375,
  height: 812,
  background,
  objects,
});

const weddingClassicBlocks: BlockType[] = [
  'greeting',
  'divider',
  'coupleIntroduction',
  'calendar',
  'gallery',
  'place',
  'transportation',
  'rsvp',
];
const weddingEditorialBlocks: BlockType[] = [
  'greeting',
  'spacer',
  'gallery',
  'calendar',
  'timeline',
  'place',
  'rsvp',
];
const weddingEveningBlocks: BlockType[] = [
  'greeting',
  'coupleIntroduction',
  'gallery',
  'calendar',
  'place',
  'dressCode',
  'rsvp',
];
const sunshineBlocks: BlockType[] = [
  'greeting',
  'myChild',
  'gallery',
  'calendar',
  'place',
  'notice',
  'rsvp',
];
const storyBlocks: BlockType[] = [
  'greeting',
  'myChild',
  'spacer',
  'gallery',
  'timeline',
  'calendar',
  'place',
  'rsvp',
];
const bloomBlocks: BlockType[] = [
  'greeting',
  'myChild',
  'gallery',
  'calendar',
  'place',
  'transportation',
  'rsvp',
];
const partyBlocks: BlockType[] = [
  'greeting',
  'calendar',
  'timeline',
  'place',
  'dressCode',
  'rsvp',
];
const birthdayPhotoBlocks: BlockType[] = [
  'greeting',
  'gallery',
  'calendar',
  'place',
  'notice',
  'rsvp',
];
const dinnerBlocks: BlockType[] = [
  'greeting',
  'calendar',
  'dressCode',
  'place',
  'transportation',
  'rsvp',
];
const seminarFocusBlocks: BlockType[] = [
  'greeting',
  'calendar',
  'timeline',
  'speakerInformation',
  'place',
  'transportation',
  'rsvp',
];
const networkBlocks: BlockType[] = [
  'greeting',
  'calendar',
  'timeline',
  'place',
  'notice',
  'rsvp',
];
const workshopBlocks: BlockType[] = [
  'greeting',
  'calendar',
  'speakerInformation',
  'timeline',
  'place',
  'notice',
  'rsvp',
];

export const INVITATION_TEMPLATES: InvitationTemplate[] = [
  {
    id: 'wedding-classic-letter',
    type: 'wedding',
    name: '클래식 레터',
    eyebrow: 'WEDDING',
    description: '여백과 가는 선으로 정돈한 세리프 청첩장',
    tags: ['클래식', '세리프', '차분한'],
    colors: { background: '#FBF8F2', accent: '#98765A', text: '#463B35' },
    blockTypes: weddingClassicBlocks,
    poster: poster('#FBF8F2', [
      rect(18, 22, 339, 768, 'transparent', '#D9C9B8'),
      tx('WEDDING INVITATION', 36, 78, 303, 22, 13, 'Hahmlet', '#98765A', {
        letterSpacing: 2,
      }),
      rule(122, 121, 131, '#C8B29C'),
      circle(183, 173, 8, '#98765A'),
      tx('두 사람의\n새로운 시작', 28, 217, 319, 92, 34, 'Hahmlet', '#463B35', {
        lineHeight: 1.2,
      }),
      tx(
        '소중한 분들을 초대합니다',
        32,
        339,
        311,
        27,
        16,
        '고운 바탕',
        '#6C5A50'
      ),
      rule(93, 405, 189, '#D9C9B8'),
      tx('이름 1  ·  이름 2', 28, 452, 319, 32, 22, 'Hahmlet', '#463B35'),
      tx(
        '날짜와 시간을 입력해 주세요',
        34,
        542,
        307,
        24,
        14,
        'SUIT',
        '#6C5A50'
      ),
      tx('장소를 입력해 주세요', 34, 581, 307, 24, 14, 'SUIT', '#6C5A50'),
      rule(123, 648, 129, '#C8B29C'),
      tx(
        '함께해 주셔서 감사합니다',
        34,
        680,
        307,
        22,
        12,
        '고운 바탕',
        '#806E61',
        { letterSpacing: 0.4 }
      ),
    ]),
  },
  {
    id: 'wedding-green-editorial',
    type: 'wedding',
    name: '그린 에디토리얼',
    eyebrow: 'WEDDING',
    description: '비대칭 타이포와 사진 프레임으로 구성한 모던 초대장',
    tags: ['에디토리얼', '사진 프레임', '모던'],
    colors: { background: '#F3F6F1', accent: '#66765B', text: '#36453C' },
    blockTypes: weddingEditorialBlocks,
    poster: poster('#F3F6F1', [
      tx('WEDDING  /  01', 28, 36, 190, 20, 12, 'SUIT', '#66765B', {
        textAlign: 'left',
        letterSpacing: 1.5,
      }),
      rule(28, 67, 132, '#B9C5B5'),
      slot(204, 89, 139, 249, '#E4EBE1'),
      tx('TOGETHER\nBEGINS', 27, 129, 161, 56, 13, 'SUIT', '#66765B', {
        textAlign: 'left',
        fontWeight: '600',
        lineHeight: 1.5,
        letterSpacing: 1.4,
      }),
      tx('함께하는\n새로운 날', 26, 255, 170, 89, 31, 'SUIT', '#36453C', {
        textAlign: 'left',
        fontWeight: '700',
        lineHeight: 1.15,
      }),
      rule(28, 378, 80, '#66765B', 2),
      tx('이름 1  ×  이름 2', 28, 416, 317, 29, 20, 'SUIT', '#36453C', {
        textAlign: 'left',
        fontWeight: '600',
      }),
      tx(
        '날짜 · 시간을 입력해 주세요',
        28,
        479,
        319,
        23,
        14,
        'SUIT',
        '#516155',
        { textAlign: 'left' }
      ),
      tx('장소를 입력해 주세요', 28, 515, 319, 23, 14, 'SUIT', '#516155', {
        textAlign: 'left',
      }),
      rect(27, 589, 320, 1, '#C9D2C4'),
      tx(
        '우리의 순간을 함께 나누어요',
        28,
        617,
        319,
        22,
        13,
        'SUIT',
        '#66765B',
        { textAlign: 'left', letterSpacing: 0.5 }
      ),
      tx('SAVE THE DATE', 28, 737, 319, 18, 11, 'SUIT', '#66765B', {
        textAlign: 'left',
        letterSpacing: 1.7,
      }),
    ]),
  },
  {
    id: 'wedding-rose-ceremony',
    type: 'wedding',
    name: '로즈 세리머니',
    eyebrow: 'WEDDING',
    description: '부드러운 장미빛과 이중 프레임을 살린 로맨틱 디자인',
    tags: ['로맨틱', '장미빛', '세리머니'],
    colors: { background: '#FAF3F0', accent: '#754E59', text: '#4D353A' },
    blockTypes: weddingEveningBlocks,
    poster: poster('#FAF3F0', [
      rect(22, 22, 331, 768, 'transparent', '#D8BFC3'),
      rect(31, 31, 313, 750, 'transparent', '#E8D8D8'),
      circle(172, 79, 26, 'transparent', '#B8828C'),
      tx('A DAY TO REMEMBER', 40, 119, 295, 20, 12, 'Hahmlet', '#754E59', {
        letterSpacing: 1.5,
      }),
      tx(
        '오늘, 서로의\n사람이 됩니다',
        32,
        205,
        311,
        88,
        31,
        'Hahmlet',
        '#4D353A',
        { lineHeight: 1.2 }
      ),
      tx(
        '새로운 계절의 시작에 초대합니다',
        36,
        324,
        303,
        26,
        14,
        '고운 바탕',
        '#765D61'
      ),
      rule(114, 382, 147, '#C69AA1'),
      tx('이름 1  ·  이름 2', 34, 426, 307, 32, 21, 'Hahmlet', '#4D353A'),
      circle(84, 500, 10, '#D8BFC3'),
      circle(280, 500, 10, '#D8BFC3'),
      tx(
        '날짜와 시간을 입력해 주세요',
        36,
        540,
        303,
        24,
        14,
        'SUIT',
        '#765D61'
      ),
      tx('장소를 입력해 주세요', 36, 579, 303, 24, 14, 'SUIT', '#765D61'),
      tx('WITH LOVE', 40, 692, 295, 20, 12, 'Hahmlet', '#754E59', {
        letterSpacing: 2,
      }),
    ]),
  },
  {
    id: 'first-birthday-little-sunshine',
    type: 'firstBirthday',
    name: '리틀 선샤인',
    eyebrow: 'FIRST BIRTHDAY',
    description: '절제된 해 모티프와 밝은 타이포를 담은 첫 생일 초대장',
    tags: ['첫돌', '밝은', '플레이풀'],
    colors: { background: '#FFFBF0', accent: '#B86836', text: '#473821' },
    blockTypes: sunshineBlocks,
    poster: poster('#FFFBF0', [
      circle(268, 63, 66, '#F7E2B5'),
      circle(287, 82, 28, '#B86836'),
      tx('A LITTLE SUNSHINE', 28, 48, 211, 18, 11, 'LINESeedKR', '#B86836', {
        textAlign: 'left',
        letterSpacing: 1.5,
      }),
      tx('첫 번째\n생일 파티', 28, 182, 319, 92, 35, 'LINESeedKR', '#473821', {
        textAlign: 'left',
        fontWeight: '700',
        lineHeight: 1.15,
      }),
      tx(
        '아이의 첫 생일을 함께 축하해 주세요',
        30,
        302,
        313,
        27,
        14,
        'SUIT',
        '#715A3D',
        { textAlign: 'left' }
      ),
      rule(30, 368, 315, '#E7C99A', 2),
      tx(
        '아이 이름을 입력해 주세요',
        30,
        412,
        315,
        30,
        20,
        'LINESeedKR',
        '#B86836',
        { textAlign: 'left', fontWeight: '700' }
      ),
      tx(
        '날짜 · 시간을 입력해 주세요',
        30,
        482,
        315,
        23,
        14,
        'SUIT',
        '#715A3D',
        { textAlign: 'left' }
      ),
      tx('장소를 입력해 주세요', 30, 519, 315, 23, 14, 'SUIT', '#715A3D', {
        textAlign: 'left',
      }),
      rect(30, 589, 315, 76, '#F7F0DE'),
      tx(
        '함께 웃고 축하하는 하루',
        42,
        613,
        291,
        22,
        14,
        'LINESeedKR',
        '#473821',
        { fontWeight: '700' }
      ),
      circle(43, 712, 9, '#E2A45A'),
      circle(73, 712, 9, '#B86836'),
      circle(103, 712, 9, '#E2A45A'),
      tx('ONE BRIGHT DAY', 136, 706, 209, 20, 11, 'SUIT', '#B86836', {
        textAlign: 'right',
        letterSpacing: 1.4,
      }),
    ]),
  },
  {
    id: 'first-birthday-first-year-story',
    type: 'firstBirthday',
    name: '첫해의 기록',
    eyebrow: 'FIRST BIRTHDAY',
    description: '책 한 장처럼 사진과 아이의 이름을 담는 에디토리얼 카드',
    tags: ['첫돌', '기록', '사진 프레임'],
    colors: { background: '#FAF6EF', accent: '#52756B', text: '#374A45' },
    blockTypes: storyBlocks,
    poster: poster('#FAF6EF', [
      tx('A YEAR IN BLOOM', 30, 42, 315, 20, 12, '고운 바탕', '#52756B', {
        letterSpacing: 1.5,
      }),
      tx('첫해의 기록', 30, 88, 315, 40, 27, '고운 바탕', '#374A45'),
      slot(31, 164, 313, 296, '#E8EDE5'),
      rule(31, 493, 313, '#BFCFC2'),
      tx(
        '아이 이름을 입력해 주세요',
        31,
        527,
        313,
        29,
        19,
        '고운 바탕',
        '#374A45',
        { textAlign: 'left' }
      ),
      tx(
        '첫 번째 생일을 함께 기념해요',
        31,
        565,
        313,
        22,
        13,
        'SUIT',
        '#52756B',
        { textAlign: 'left' }
      ),
      tx(
        '날짜 · 시간을 입력해 주세요',
        31,
        625,
        313,
        22,
        13,
        'SUIT',
        '#5D7168',
        { textAlign: 'left' }
      ),
      tx('장소를 입력해 주세요', 31, 658, 313, 22, 13, 'SUIT', '#5D7168', {
        textAlign: 'left',
      }),
      tx('NO. 01', 31, 745, 313, 18, 10, 'SUIT', '#52756B', {
        textAlign: 'right',
        letterSpacing: 1.5,
      }),
    ]),
  },
  {
    id: 'first-birthday-peach-bloom',
    type: 'firstBirthday',
    name: '피치 블룸',
    eyebrow: 'FIRST BIRTHDAY',
    description: '부드러운 꽃잎 형태와 여린 분홍빛의 첫 생일 카드',
    tags: ['첫돌', '피치', '부드러운'],
    colors: { background: '#FFF7F7', accent: '#A45B70', text: '#4F3D44' },
    blockTypes: bloomBlocks,
    poster: poster('#FFF7F7', [
      circle(131, 63, 72, '#F4DDE2'),
      circle(171, 63, 72, '#F6E5E5'),
      circle(151, 43, 72, '#F3D9DF'),
      circle(151, 83, 72, '#F8E8E7'),
      circle(172, 105, 28, '#A45B70'),
      tx('A SMALL CELEBRATION', 28, 192, 319, 20, 11, 'SUIT', '#A45B70', {
        letterSpacing: 1.7,
      }),
      tx(
        '꽃처럼 피어난\n첫 번째 생일',
        24,
        246,
        327,
        78,
        28,
        'SUIT',
        '#4F3D44',
        { fontWeight: '700', lineHeight: 1.2 }
      ),
      tx('아이 이름을 입력해 주세요', 30, 371, 315, 27, 17, 'SUIT', '#A45B70', {
        fontWeight: '600',
      }),
      rule(108, 423, 159, '#D9B8C0'),
      tx(
        '날짜 · 시간을 입력해 주세요',
        28,
        482,
        319,
        23,
        14,
        'SUIT',
        '#6D535D'
      ),
      tx('장소를 입력해 주세요', 28, 520, 319, 23, 14, 'SUIT', '#6D535D'),
      circle(69, 620, 15, 'transparent', '#D9B8C0'),
      circle(290, 620, 15, 'transparent', '#D9B8C0'),
      tx(
        '함께 축하해 주셔서 기뻐요',
        34,
        683,
        307,
        23,
        13,
        '고운 바탕',
        '#795E68'
      ),
    ]),
  },
  {
    id: 'birthday-color-pop-party',
    type: 'birthday',
    name: '컬러 팝 파티',
    eyebrow: 'BIRTHDAY',
    description: '콘페티와 굵은 타이포로 생일의 에너지를 담은 초대장',
    tags: ['생일', '컬러 팝', '경쾌한'],
    colors: { background: '#FFF9DF', accent: '#CC5E30', text: '#3F3525' },
    blockTypes: partyBlocks,
    poster: poster('#FFF9DF', [
      rect(26, 28, 323, 4, '#CC5E30'),
      circle(45, 81, 13, '#E5AA44'),
      rect(315, 76, 18, 18, '#CC5E30'),
      tx('YOU ARE INVITED', 34, 120, 307, 19, 12, 'SUIT', '#CC5E30', {
        letterSpacing: 2,
      }),
      tx('오늘은\n우리의 파티!', 25, 188, 325, 102, 38, 'SUIT', '#3F3525', {
        fontWeight: '700',
        lineHeight: 1.12,
      }),
      tx('즐거운 생일을 함께 나눠요', 32, 318, 311, 25, 15, 'SUIT', '#6A5539'),
      circle(56, 391, 8, '#CC5E30'),
      circle(315, 391, 8, '#E5AA44'),
      rule(71, 420, 233, '#D9BF83', 2),
      tx(
        '날짜 · 시간을 입력해 주세요',
        30,
        466,
        315,
        24,
        14,
        'SUIT',
        '#5B4B31'
      ),
      tx('장소를 입력해 주세요', 30, 505, 315, 24, 14, 'SUIT', '#5B4B31'),
      rect(30, 584, 315, 84, '#F7EBC5'),
      tx(
        '드레스 코드 또는 안내를 적어 주세요',
        42,
        609,
        291,
        34,
        13,
        'SUIT',
        '#7A573A',
        { lineHeight: 1.3 }
      ),
      circle(62, 725, 11, '#E5AA44'),
      circle(96, 725, 11, '#CC5E30'),
      circle(130, 725, 11, '#839375'),
      tx('LET’S CELEBRATE', 159, 719, 186, 20, 11, 'SUIT', '#CC5E30', {
        textAlign: 'right',
        letterSpacing: 1.2,
      }),
    ]),
  },
  {
    id: 'birthday-lilac-memory',
    type: 'birthday',
    name: '라일락 메모리',
    eyebrow: 'BIRTHDAY',
    description: '사진 한 장과 짧은 문장을 담는 라일락 포스트카드',
    tags: ['생일', '포스트카드', '사진 프레임'],
    colors: { background: '#F8F5FF', accent: '#7055A3', text: '#392F4E' },
    blockTypes: birthdayPhotoBlocks,
    poster: poster('#F8F5FF', [
      tx('A POSTCARD FOR TODAY', 30, 37, 315, 20, 11, 'LINESeedKR', '#7055A3', {
        textAlign: 'left',
        letterSpacing: 1.4,
      }),
      rule(30, 73, 315, '#D6CBE8'),
      slot(38, 108, 299, 296, '#EAE4F4'),
      tx(
        '기억하고 싶은\n오늘의 장면',
        30,
        442,
        315,
        70,
        27,
        'LINESeedKR',
        '#392F4E',
        { textAlign: 'left', fontWeight: '700', lineHeight: 1.22 }
      ),
      tx('생일을 함께 축하해 주세요', 31, 535, 313, 22, 14, 'SUIT', '#7055A3', {
        textAlign: 'left',
      }),
      rule(30, 586, 315, '#D6CBE8'),
      tx(
        '날짜 · 시간을 입력해 주세요',
        30,
        617,
        315,
        21,
        13,
        'SUIT',
        '#52456D',
        { textAlign: 'left' }
      ),
      tx('장소를 입력해 주세요', 30, 650, 315, 21, 13, 'SUIT', '#52456D', {
        textAlign: 'left',
      }),
      tx('WITH JOY', 30, 736, 315, 18, 10, 'LINESeedKR', '#7055A3', {
        textAlign: 'right',
        letterSpacing: 1.7,
      }),
    ]),
  },
  {
    id: 'birthday-cozy-dinner',
    type: 'birthday',
    name: '코지 디너',
    eyebrow: 'BIRTHDAY DINNER',
    description: '메뉴 카드의 정갈한 위계를 빌린 저녁 초대장',
    tags: ['생일', '디너', '세리프'],
    colors: { background: '#FBF7F1', accent: '#82514A', text: '#453633' },
    blockTypes: dinnerBlocks,
    poster: poster('#FBF7F1', [
      tx('AN EVENING TOGETHER', 35, 81, 305, 20, 12, 'Hahmlet', '#82514A', {
        letterSpacing: 1.8,
      }),
      rule(93, 119, 189, '#D7C3B8'),
      tx('함께하는\n생일 저녁', 28, 192, 319, 86, 33, 'Hahmlet', '#453633', {
        lineHeight: 1.2,
      }),
      tx(
        '좋은 음식과 이야기를 나누어요',
        31,
        308,
        313,
        24,
        14,
        '고운 바탕',
        '#765B55'
      ),
      rect(44, 378, 287, 102, '#F2EAE1'),
      tx(
        '날짜 · 시간을 입력해 주세요',
        55,
        399,
        265,
        22,
        13,
        'SUIT',
        '#5F4A45'
      ),
      rule(96, 438, 183, '#CEB7AB'),
      tx('장소를 입력해 주세요', 55, 448, 265, 20, 13, 'SUIT', '#5F4A45'),
      tx('DRESS CODE', 35, 535, 305, 19, 11, 'Hahmlet', '#82514A', {
        letterSpacing: 1.7,
      }),
      tx('복장 안내를 입력해 주세요', 35, 565, 305, 24, 14, 'SUIT', '#453633'),
      rule(93, 634, 189, '#D7C3B8'),
      tx(
        '생일을 함께 축하해 주세요',
        35,
        668,
        305,
        22,
        13,
        '고운 바탕',
        '#765B55'
      ),
    ]),
  },
  {
    id: 'seminar-focus-conference',
    type: 'seminar',
    name: '포커스 컨퍼런스',
    eyebrow: 'SEMINAR',
    description: '그리드와 넘버링으로 정보를 정리한 컨퍼런스 초대장',
    tags: ['세미나', '그리드', '포커스'],
    colors: { background: '#F5F7FB', accent: '#3057B8', text: '#263650' },
    blockTypes: seminarFocusBlocks,
    poster: poster('#F5F7FB', [
      rect(0, 0, 14, 812, '#3057B8'),
      tx('PUBLIC PROGRAM  /  01', 35, 43, 305, 18, 11, 'SUIT', '#3057B8', {
        textAlign: 'left',
        letterSpacing: 1.2,
      }),
      tx('01', 31, 103, 150, 78, 60, 'SUIT', '#D9E3F7', {
        textAlign: 'left',
        fontWeight: '700',
      }),
      tx(
        '함께 배우고\n생각하는 시간',
        32,
        202,
        309,
        74,
        29,
        'SUIT',
        '#263650',
        { textAlign: 'left', fontWeight: '700', lineHeight: 1.18 }
      ),
      tx(
        '관심 있는 분들을 초대합니다',
        34,
        300,
        307,
        22,
        14,
        'SUIT',
        '#52637C',
        { textAlign: 'left' }
      ),
      rule(34, 354, 307, '#C8D2E5'),
      tx('DATE / TIME', 34, 389, 115, 18, 10, 'SUIT', '#3057B8', {
        textAlign: 'left',
        letterSpacing: 1.2,
      }),
      tx(
        '날짜와 시간을 입력해 주세요',
        34,
        417,
        307,
        22,
        13,
        'SUIT',
        '#263650',
        { textAlign: 'left' }
      ),
      rule(34, 463, 307, '#C8D2E5'),
      tx('SPEAKERS', 34, 496, 115, 18, 10, 'SUIT', '#3057B8', {
        textAlign: 'left',
        letterSpacing: 1.2,
      }),
      tx('연사 정보를 입력해 주세요', 34, 524, 307, 22, 13, 'SUIT', '#263650', {
        textAlign: 'left',
      }),
      rule(34, 570, 307, '#C8D2E5'),
      tx('VENUE', 34, 603, 115, 18, 10, 'SUIT', '#3057B8', {
        textAlign: 'left',
        letterSpacing: 1.2,
      }),
      tx('장소를 입력해 주세요', 34, 631, 307, 22, 13, 'SUIT', '#263650', {
        textAlign: 'left',
      }),
      rect(34, 710, 307, 1, '#C8D2E5'),
      tx('PROGRAM  ·  DETAILS', 34, 736, 307, 17, 10, 'SUIT', '#3057B8', {
        textAlign: 'left',
        letterSpacing: 1.4,
      }),
    ]),
  },
  {
    id: 'seminar-green-network',
    type: 'seminar',
    name: '그린 네트워크',
    eyebrow: 'SEMINAR',
    description: '연결된 원과 넓은 여백으로 대화의 장을 표현한 초대장',
    tags: ['세미나', '네트워크', '대화'],
    colors: { background: '#F4F8F5', accent: '#2E4D49', text: '#213E39' },
    blockTypes: networkBlocks,
    poster: poster('#2E4D49', [
      rule(42, 64, 291, '#597A6F'),
      circle(66, 93, 24, '#D0DED7'),
      circle(150, 80, 42, '#3E625B'),
      circle(277, 104, 30, '#597A6F'),
      rule(89, 105, 62, '#86A99A', 2),
      rule(192, 101, 85, '#86A99A', 2),
      tx('IDEAS IN MOTION', 42, 171, 291, 18, 11, 'SUIT', '#D0DED7', {
        letterSpacing: 1.8,
      }),
      tx('아이디어를\n나누는 자리', 25, 222, 325, 82, 32, 'SUIT', '#F2F7F0', {
        fontWeight: '700',
        lineHeight: 1.18,
      }),
      tx(
        '함께 배우고 연결되는 시간을 만듭니다',
        31,
        330,
        313,
        24,
        13,
        'SUIT',
        '#D0DED7'
      ),
      rect(33, 392, 309, 100, '#3E625B'),
      tx(
        '날짜 · 시간을 입력해 주세요',
        47,
        413,
        281,
        22,
        13,
        'SUIT',
        '#F2F7F0'
      ),
      rule(72, 453, 231, '#597A6F'),
      tx('장소를 입력해 주세요', 47, 462, 281, 20, 13, 'SUIT', '#F2F7F0'),
      tx('AGENDA', 32, 544, 110, 18, 10, 'SUIT', '#D0DED7', {
        textAlign: 'left',
        letterSpacing: 1.5,
      }),
      tx(
        '세션과 안내를 추가해 주세요',
        32,
        572,
        311,
        23,
        14,
        'SUIT',
        '#F2F7F0',
        { textAlign: 'left' }
      ),
      circle(54, 666, 8, '#D0DED7'),
      circle(84, 666, 8, '#86A99A'),
      circle(114, 666, 8, '#597A6F'),
      tx('MEET  ·  SHARE  ·  GROW', 145, 660, 198, 20, 10, 'SUIT', '#D0DED7', {
        textAlign: 'right',
        letterSpacing: 1,
      }),
    ]),
  },
  {
    id: 'seminar-creative-workshop',
    type: 'seminar',
    name: '크리에이티브 워크숍',
    eyebrow: 'SEMINAR',
    description: '겹치는 기하 블록과 선명한 제목으로 만든 워크숍 포스터',
    tags: ['워크숍', '기하', '크리에이티브'],
    colors: { background: '#FFF8F0', accent: '#514C88', text: '#373448' },
    blockTypes: workshopBlocks,
    poster: poster('#FFF8F0', [
      rect(30, 38, 75, 18, '#F1D4B6'),
      rect(278, 38, 67, 18, '#514C88'),
      circle(311, 106, 42, '#E9B990'),
      tx('MAKE / THINK / SHARE', 32, 103, 238, 18, 11, 'SUIT', '#514C88', {
        textAlign: 'left',
        letterSpacing: 1.5,
      }),
      tx('함께 만드는\n새로운 시도', 24, 192, 327, 84, 31, 'SUIT', '#373448', {
        textAlign: 'left',
        fontWeight: '700',
        lineHeight: 1.17,
      }),
      tx(
        '아이디어를 펼치는 워크숍에 초대합니다',
        30,
        305,
        315,
        23,
        13,
        'SUIT',
        '#5E5A76',
        { textAlign: 'left' }
      ),
      rule(31, 363, 313, '#D7C9BC'),
      tx('DATE', 31, 392, 94, 18, 10, 'SUIT', '#514C88', {
        textAlign: 'left',
        letterSpacing: 1.4,
      }),
      tx(
        '날짜 · 시간을 입력해 주세요',
        31,
        419,
        313,
        22,
        13,
        'SUIT',
        '#373448',
        { textAlign: 'left' }
      ),
      rule(31, 462, 313, '#D7C9BC'),
      tx('SPEAKER / PLACE', 31, 490, 160, 18, 10, 'SUIT', '#514C88', {
        textAlign: 'left',
        letterSpacing: 1.2,
      }),
      tx(
        '연사와 장소를 입력해 주세요',
        31,
        518,
        313,
        22,
        13,
        'SUIT',
        '#373448',
        { textAlign: 'left' }
      ),
      rect(30, 587, 315, 94, '#F6E9DB'),
      tx(
        '세션과 참여 안내를 추가해 주세요',
        44,
        614,
        287,
        35,
        13,
        'SUIT',
        '#5E5A76',
        { lineHeight: 1.35 }
      ),
      circle(47, 729, 10, '#514C88'),
      tx('WORKSHOP SERIES', 73, 724, 272, 20, 10, 'SUIT', '#514C88', {
        textAlign: 'left',
        letterSpacing: 1.6,
      }),
    ]),
  },
];
