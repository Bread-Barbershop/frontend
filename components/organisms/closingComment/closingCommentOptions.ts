import type { InvitationType } from '@/shared/types/block';

export const CLOSING_CATEGORIES: { label: string; value: InvitationType }[] = [
  { label: '결혼식', value: 'wedding' },
  { label: '돌잔치', value: 'firstBirthday' },
  { label: '세미나', value: 'seminar' },
  { label: '생일', value: 'birthday' },
  { label: 'etc.', value: 'etc' },
];

const CLOSING_COMMENT_OPTIONS = {
  wedding: [
    '(신랑) · (신부)의 새로운 시작을 함께 축복해 주세요.',
    '(신랑) · (신부)의 소중한 날에 함께해 주셔서 감사합니다.',
    '(신랑) · (신부)의 앞날에 따뜻한 마음을 더해 주세요.',
    '(신랑) · (신부)의 첫걸음을 함께 응원해 주세요.',
    '(신랑) · (신부)가 함께하는 첫날을 축복해 주세요.',
    '소중한 걸음으로 (신랑) · (신부)의 날을 빛내 주세요.',
    '(신랑) · (신부)의 사랑이 오래도록 빛나길 축복해 주세요.',
    '귀한 시간 내어 (신랑) · (신부)와 함께해 주세요.',
    '(신랑) · (신부)의 약속에 따뜻한 축하를 보내주세요.',
    '(신랑) · (신부)의 특별한 순간을 함께해 주세요.',
  ],
  seminar: [
    '(행사명)에 함께해 주셔서 감사합니다.',
    '(행사명)에서 새로운 인사이트를 함께 나눠요.',
    '(행사명)의 뜻깊은 시간에 함께해 주세요.',
    '(행사명)에서 더 넓은 가능성을 만나보세요.',
    '(행사명)에 보내주신 관심과 참여에 감사드립니다.',
    '(행사명)을 통해 새로운 연결을 만들어가요.',
    '(행사명)에서 함께 배우고 나누는 시간을 가져요.',
    '(행사명)의 여정에 함께해 주셔서 감사합니다.',
    '(행사명)에서 의미 있는 변화를 함께 만들어 주세요.',
    '(행사명)이 더 큰 가치로 이어지길 기대합니다.',
  ],
  birthday: [
    '(이름)의 생일을 함께 축하해 주세요.',
    '(이름)의 특별한 하루를 함께 빛내 주세요.',
    '(이름)의 소중한 날에 함께해 주셔서 감사합니다.',
    '(이름)에게 오늘의 축하가 가장 큰 선물이 됩니다.',
    '(이름)의 행복한 순간을 함께 나누고 싶어요.',
    '(이름)의 생일에 따뜻한 마음을 더해 주세요.',
    '(이름)의 오늘이 오래 기억될 하루가 되길 바라요.',
    '(이름)의 특별한 날을 함께 즐겨 주세요.',
    '(이름)의 생일을 소중한 마음으로 축하해 주세요.',
    '(이름)의 하루가 웃음으로 가득하길 바라요.',
  ],
  etc: [
    '(행사명)의 특별한 순간을 함께 만들어 주세요.',
    '(행사명)에 함께해 주셔서 감사합니다.',
    '(행사명)에서 즐거운 시간을 함께 나누고 싶습니다.',
    '(행사명)의 자리를 따뜻하게 빛내 주세요.',
    '(행사명)에 보내주신 관심에 진심으로 감사드립니다.',
    '(행사명)에서 소중한 추억을 함께 만들어 주세요.',
    '(행사명)의 특별한 하루에 함께해 주세요.',
    '(행사명)을 함께 즐겨 주시면 감사하겠습니다.',
    '(주최)가 준비한 자리에 귀한 걸음으로 함께해 주세요.',
    '(행사명)이 더 특별해질 수 있도록 함께해 주세요.',
  ],
};

export function getClosingCommentOptions(
  category: InvitationType,
  name: string
) {
  if (category !== 'firstBirthday') return CLOSING_COMMENT_OPTIONS[category];

  const childName = name.trim().normalize('NFC');
  const endsInHangul = /[가-힣]$/.test(childName);
  const lastCode = childName.charCodeAt(childName.length - 1);
  const hasBatchim = endsInHangul && (lastCode - 0xac00) % 28 !== 0;
  const familiarName = hasBatchim ? `${childName}이` : childName;
  const possessive = familiarName ? `${familiarName}의 ` : '';
  // 영문 등 발음을 알 수 없는 이름은 '의 첫 생일'로 표현한다.
  const birthdayIntro = endsInHangul ? `${familiarName}가 맞이한 ` : possessive;

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
