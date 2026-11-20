import type { InvitationType } from '@/shared/types/block';

export const CLOSING_CATEGORIES: { label: string; value: InvitationType }[] = [
  { label: '결혼식', value: 'wedding' },
  { label: '돌잔치', value: 'firstBirthday' },
  { label: '세미나', value: 'seminar' },
  { label: '생일', value: 'birthday' },
  { label: 'etc.', value: 'etc' },
];

type ClosingExampleNames = {
  childName?: string;
  coupleNames?: string;
  eventName?: string;
  birthdayName?: string;
  organizerName?: string;
};

function hasFinalConsonant(name: string): boolean | undefined {
  if (!/[가-힣]$/.test(name)) return undefined;
  return (name.charCodeAt(name.length - 1) - 0xac00) % 28 !== 0;
}

function withParticle(
  name: string,
  consonant: string,
  vowel: string,
  unknownEnding: string
) {
  const hasBatchim = hasFinalConsonant(name);
  // 발음을 단정할 수 없는 이름은 'DevCon 행사를', 'INVIA 측이'처럼 표현한다.
  if (hasBatchim === undefined) return `${name} ${unknownEnding}`;
  return name + (hasBatchim ? consonant : vowel);
}

function weddingOptions(name = '') {
  const couple = name.trim().normalize('NFC') || '두 사람';
  const subject = withParticle(couple, '이', '가', '두 사람이');
  const together = withParticle(couple, '과', '와', '두 사람과');
  return [
    `${couple}의 새로운 시작을 함께 축복해 주세요.`,
    `${couple}의 소중한 날에 함께해 주셔서 감사합니다.`,
    `${couple}의 앞날에 따뜻한 마음을 더해 주세요.`,
    `${couple}의 첫걸음을 함께 응원해 주세요.`,
    `${subject} 함께하는 첫날을 축복해 주세요.`,
    `소중한 걸음으로 ${couple}의 날을 빛내 주세요.`,
    `${couple}의 사랑이 오래도록 빛나길 축복해 주세요.`,
    `귀한 시간 내어 ${together} 함께해 주세요.`,
    `${couple}의 약속에 따뜻한 축하를 보내주세요.`,
    `${couple}의 특별한 순간을 함께해 주세요.`,
  ];
}

function birthdayOptions(name = '') {
  const person = name.trim().normalize('NFC');
  const possessive = person ? `${person}의 ` : '';
  const recipient = person ? `${person}에게 ` : '';
  return [
    `${possessive}생일을 함께 축하해 주세요.`,
    `${possessive}특별한 하루를 함께 빛내 주세요.`,
    `${possessive}소중한 날에 함께해 주셔서 감사합니다.`,
    `${recipient}오늘의 축하가 가장 큰 선물이 됩니다.`,
    `${possessive}행복한 순간을 함께 나누고 싶어요.`,
    `${possessive}생일에 따뜻한 마음을 더해 주세요.`,
    `${possessive}오늘이 오래 기억될 하루가 되길 바라요.`,
    `${possessive}특별한 날을 함께 즐겨 주세요.`,
    `${possessive}생일을 소중한 마음으로 축하해 주세요.`,
    `${possessive}하루가 웃음으로 가득하길 바라요.`,
  ];
}

function eventOptions(category: 'seminar' | 'etc', names: ClosingExampleNames) {
  const event =
    names.eventName?.trim().normalize('NFC') ||
    (category === 'seminar' ? '이번 세미나' : '이번 행사');
  const subject = withParticle(event, '이', '가', '행사가');
  const object = withParticle(event, '을', '를', '행사를');
  if (category === 'seminar') {
    return [
      `${event}에 함께해 주셔서 감사합니다.`,
      `${event}에서 새로운 인사이트를 함께 나눠요.`,
      `${event}의 뜻깊은 시간에 함께해 주세요.`,
      `${event}에서 더 넓은 가능성을 만나보세요.`,
      `${event}에 보내주신 관심과 참여에 감사드립니다.`,
      `${object} 통해 새로운 연결을 만들어가요.`,
      `${event}에서 함께 배우고 나누는 시간을 가져요.`,
      `${event}의 여정에 함께해 주셔서 감사합니다.`,
      `${event}에서 의미 있는 변화를 함께 만들어 주세요.`,
      `${subject} 더 큰 가치로 이어지길 기대합니다.`,
    ];
  }

  const organizer = names.organizerName?.trim().normalize('NFC') || '저희';
  const host = withParticle(organizer, '이', '가', '측이');
  return [
    `${event}의 특별한 순간을 함께 만들어 주세요.`,
    `${event}에 함께해 주셔서 감사합니다.`,
    `${event}에서 즐거운 시간을 함께 나누고 싶습니다.`,
    `${event}의 자리를 따뜻하게 빛내 주세요.`,
    `${event}에 보내주신 관심에 진심으로 감사드립니다.`,
    `${event}에서 소중한 추억을 함께 만들어 주세요.`,
    `${event}의 특별한 하루에 함께해 주세요.`,
    `${object} 함께 즐겨 주시면 감사하겠습니다.`,
    `${host} 준비한 자리에 귀한 걸음으로 함께해 주세요.`,
    `${subject} 더 특별해질 수 있도록 함께해 주세요.`,
  ];
}

export function getClosingCommentOptions(
  category: InvitationType,
  names: ClosingExampleNames = {}
) {
  if (category === 'wedding') return weddingOptions(names.coupleNames);
  if (category === 'birthday') return birthdayOptions(names.birthdayName);
  if (category === 'seminar' || category === 'etc')
    return eventOptions(category, names);

  const childName = names.childName?.trim().normalize('NFC') ?? '';
  const hasBatchim = hasFinalConsonant(childName);
  const familiarName = hasBatchim ? `${childName}이` : childName;
  const possessive = familiarName ? `${familiarName}의 ` : '';
  // 영문 등 발음을 알 수 없는 이름은 '의 첫 생일'로 표현한다.
  const birthdayIntro =
    hasBatchim !== undefined ? `${familiarName}가 맞이한 ` : possessive;

  return [
    `${possessive}첫 번째 생일을 함께 축하해 주세요.`,
    `${possessive}소중한 첫돌에 따뜻한 축복을 보내주세요.`,
    `${possessive}첫 생일에 함께해 주셔서 감사합니다.`,
    `${possessive}첫 시작을 함께 축복해 주세요.`,
    `${possessive}특별한 하루를 따뜻하게 빛내 주세요.`,
    `${birthdayIntro}첫 생일을 함께 기뻐해 주세요.`,
    `${possessive}첫돌을 소중한 마음으로 축하해 주세요.`,
    `${possessive}웃음 가득한 날에 함께해 주세요.`,
    `${possessive}첫 번째 순간을 함께 나누고 싶습니다.`,
    `${possessive}건강한 성장을 따뜻하게 응원해 주세요.`,
  ];
}
