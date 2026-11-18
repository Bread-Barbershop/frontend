import {
  getTodayKstDateString,
  parseStrictDate,
} from '@/shared/utils/dateValidation';

export const INVITATION_PRIVACY_FIELDS = [
  {
    key: 'phone',
    label: '전화번호',
    description: '010-****-**** · 전화·문자 버튼 숨김',
  },
  {
    key: 'account',
    label: '계좌번호',
    description: '** ***-**** · 계좌 복사·송금 버튼 숨김',
  },
  {
    key: 'name',
    label: '이름',
    description: '신랑·신부·혼주·가족·아이·연사·예금주 이름 가리기',
  },
  {
    key: 'birthday',
    label: '생년월일',
    description: '아이 소개의 생년월일을 ****.**.**처럼 표시',
  },
  {
    key: 'media',
    label: '사진·영상',
    description: '본문 이미지·영상과 공유 썸네일 숨김',
  },
  {
    key: 'location',
    label: '주소·지도',
    description: '장소명·주소·지도·길찾기·장소 연락처 숨김',
  },
  {
    key: 'poster',
    label: '메인 포스터',
    description: '포스터를 비공개 안내로 대체',
  },
] as const;

export type InvitationPrivacyField =
  (typeof INVITATION_PRIVACY_FIELDS)[number]['key'];
export type InvitationPrivacy = {
  enabled: boolean;
  eventDate: string;
  fields: InvitationPrivacyField[];
};

export const DEFAULT_INVITATION_PRIVACY: InvitationPrivacy = {
  enabled: false,
  eventDate: '',
  fields: ['phone', 'account'],
};

export function normalizeInvitationPrivacy(
  value: unknown
): InvitationPrivacy | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const { enabled, eventDate, fields } = value as Partial<InvitationPrivacy>;
  if (typeof enabled !== 'boolean' || !Array.isArray(fields)) return undefined;

  return {
    enabled,
    eventDate:
      typeof eventDate === 'string' && parseStrictDate(eventDate)
        ? eventDate
        : '',
    fields: INVITATION_PRIVACY_FIELDS.map(({ key }) => key).filter(key =>
      fields.includes(key)
    ),
  };
}

export function getActivePrivacyFields(
  settings: InvitationPrivacy | undefined,
  now: number
) {
  if (
    !settings?.enabled ||
    !parseStrictDate(settings.eventDate) ||
    getTodayKstDateString(now) <= settings.eventDate
  ) {
    return new Set<InvitationPrivacyField>();
  }
  return new Set(settings.fields);
}

export function hideCustomShareText(
  fields: ReadonlySet<InvitationPrivacyField>
) {
  return (
    fields.has('name') ||
    fields.has('phone') ||
    fields.has('account') ||
    fields.has('birthday') ||
    fields.has('location')
  );
}
