import type { BlockType } from '@/shared/types/editor';

import type { ShowcaseInvitation } from './showcaseInvitations';

export type ShowcaseFamily =
  | 'heritage'
  | 'editorial'
  | 'botanical'
  | 'sky'
  | 'celebration'
  | 'conference'
  | 'scrapbook';

const FAMILIES: ShowcaseFamily[] = [
  'heritage',
  'editorial',
  'sky',
  'botanical',
  'heritage',
  'editorial',
  'heritage',
  'botanical',
  'editorial',
  'editorial',
  'celebration',
  'botanical',
  'conference',
  'conference',
  'conference',
  'conference',
  'conference',
  'celebration',
  'editorial',
  'celebration',
  'celebration',
  'scrapbook',
  'scrapbook',
  'botanical',
  'editorial',
];

const WEDDING_NOTES = [
  '가장 평범한 하루가, 당신과 함께라면 가장 특별한 이야기가 됩니다.',
  '우연히 만난 우리가, 서로의 가장 오래된 약속이 되기까지.',
  '같은 하늘 아래, 이제는 언제나 같은 편이 되어 주겠습니다.',
  '계절마다 다른 꽃이 피어도, 우리의 마음은 같은 자리에.',
  '마음을 눌러 쓴 한 장의 편지처럼, 오래 곁에 남을 사랑.',
  '함께 보낸 모든 계절의 끝에서, 새로운 여름을 시작합니다.',
  '크지 않은 목소리로, 깊고 오래 사랑하겠습니다.',
  '여름의 가장 반짝이는 장면에, 당신도 함께 있었으면 합니다.',
  '어디로 가든, 돌아올 곳은 언제나 서로의 곁.',
  '같이 걷는 길에 우리다운 이름을 붙여 보기로 했습니다.',
  '멋진 계획보다, 함께 웃을 수 있는 오늘이 더 좋아서.',
  '서로에게 그늘이 되고 뿌리가 되어, 오래 함께 자라나겠습니다.',
];

const EXTENDED_WEDDING_NOTES: Record<number, string> = {
  23: '맑은 공기와 산 능선이 이어지는 길처럼, 서로의 곁에서 같은 방향으로 걸어가겠습니다.',
  24: '익숙한 골목도 함께 걸으면 새로운 풍경이 됩니다. 평범한 하루를 나누며 오래 사랑하겠습니다.',
};

export function getShowcasePresentation(design: ShowcaseInvitation) {
  const index = Number(design.id.replace('showcase-', ''));
  const family = FAMILIES[index] ?? 'heritage';
  const isWedding = design.type === 'wedding';
  const isBaby = design.type === 'firstBirthday';
  const isConference = design.type === 'seminar';
  const monochrome = index === 1 || index === 6;
  const photos = isWedding
    ? monochrome
      ? ['vow-rings', 'love-letter']
      : family === 'botanical' || family === 'sky'
        ? ['garden-table', 'love-letter', 'vow-rings']
        : ['love-letter', 'vow-rings', 'garden-table']
    : isConference
      ? ['conference-hall', 'conference-speaker']
      : isBaby
        ? ['birthday-table', 'first-cake']
        : index === 19
          ? ['birthday-table', 'birthday-evening']
          : ['birthday-evening', 'birthday-table'];
  const [year, month, day] = design.date.split('-');
  const date = new Date(`${design.date}T12:00:00Z`);

  return {
    family,
    index,
    monochrome,
    photos: photos.map(photo => `/images/showcase/${photo}.webp`),
    seal: isWedding ? 'M&A' : isBaby ? '1' : isConference ? '26' : '27',
    sender: isWedding
      ? '민성 그리고 아현'
      : isBaby
        ? '민준이네 가족'
        : isConference
          ? 'INVIA CONFERENCE'
          : '민혁의 스물일곱',
    englishSender: isWedding
      ? 'MINSUNG & AHHYUN'
      : isBaby
        ? 'OUR LITTLE ONE'
        : isConference
          ? 'YOU ARE ON THE LIST'
          : 'CHEERS TO TWENTY-SEVEN',
    edition: isWedding
      ? 'THE WEDDING EDITION'
      : isBaby
        ? 'THE FIRST YEAR EDITION'
        : isConference
          ? 'A PERSONAL INVITATION'
          : 'THE BIRTHDAY EDITION',
    recipient: isConference
      ? '함께 생각을 나눌 당신께'
      : isBaby
        ? '사랑을 보내 주신 당신께'
        : '소중한 당신께',
    opening: isConference
      ? '새로운 관점이 열리는 자리에 초대합니다.'
      : isBaby
        ? '365일의 사랑을 한 장에 담았어요.'
        : isWedding
          ? '우리의 가장 기쁜 소식이 도착했어요.'
          : '당신의 자리를 비워 두었어요.',
    note: isWedding
      ? (WEDDING_NOTES[index] ?? EXTENDED_WEDDING_NOTES[index])
      : isBaby
        ? '처음이라 서툴렀던 모든 날에, 당신의 사랑이 함께 있었습니다.'
        : isConference
          ? '좋은 질문 하나가, 우리의 다음을 바꿀 수 있다고 믿습니다.'
          : '생일은 하루지만, 함께 보낸 마음은 오래 남으니까요.',
    date: {
      year,
      month,
      day,
      weekday: new Intl.DateTimeFormat('en', {
        weekday: 'long',
        timeZone: 'UTC',
      }).format(date),
      monthName: new Intl.DateTimeFormat('en', {
        month: 'long',
        timeZone: 'UTC',
      }).format(date),
    },
  };
}

export function getShowcaseBlockTypes(design: ShowcaseInvitation): BlockType[] {
  const family = getShowcasePresentation(design).family;
  const closing = 'closingComment' as const;
  const seminar: BlockType[] = [
    'greeting',
    'timeline',
    'speakerInformation',
    'picture',
    'calendar',
    'place',
    'transportation',
    'dressCode',
    closing,
  ];

  if (design.type === 'seminar') return seminar;
  if (design.type === 'firstBirthday') {
    return [
      'greeting',
      'myChild',
      'gallery',
      'calendar',
      'interview',
      'timeline',
      'picture',
      'place',
      'transportation',
      'dressCode',
      closing,
    ];
  }
  if (design.type === 'birthday') {
    return [
      'greeting',
      'picture',
      'calendar',
      'interview',
      'timeline',
      'gallery',
      'place',
      'dressCode',
      closing,
    ];
  }

  if (family === 'editorial') {
    return [
      'greeting',
      'gallery',
      'coupleIntroduction',
      'interview',
      'calendar',
      'timeline',
      'place',
      'transportation',
      'dressCode',
      closing,
    ];
  }
  if (family === 'botanical' || family === 'sky') {
    return [
      'greeting',
      'coupleIntroduction',
      'picture',
      'interview',
      'calendar',
      'gallery',
      'timeline',
      'place',
      'dressCode',
      'transportation',
      closing,
    ];
  }
  return [
    'greeting',
    'coupleIntroduction',
    'picture',
    'calendar',
    'gallery',
    'interview',
    'timeline',
    'place',
    'transportation',
    'dressCode',
    closing,
  ];
}

export const SHOWCASE_CHAPTER_LABELS: Record<string, string> = {
  greeting: 'A LETTER FOR YOU',
  coupleIntroduction: 'THE TWO OF US',
  myChild: 'OUR LITTLE WORLD',
  gallery: 'MOMENTS TO KEEP',
  picture: 'A LITTLE PREPARATION',
  calendar: 'SAVE OUR DATE',
  timeline: 'THE DAY, TOGETHER',
  interview: 'BEHIND THE STORY',
  speakerInformation: 'A VOICE TO REMEMBER',
  place: 'MEET US HERE',
  transportation: 'THE WAY TO US',
  dressCode: 'WITH THOUGHTFUL CARE',
  closingComment: 'UNTIL WE MEET',
};
