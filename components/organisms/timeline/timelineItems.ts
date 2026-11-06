import type { InvitationType } from '@/shared/types/block';

export type TimelineItem = {
  id: string;
  time: string;
  title: string;
  description: string;
};

const PRESETS: Record<string, Omit<TimelineItem, 'id'>[]> = {
  wedding: [
    { time: '11:00', title: '하객 맞이', description: '예식장에 오신 여러분을 환영합니다.' },
    { time: '12:00', title: '결혼식', description: '소중한 약속을 나누는 순간' },
    { time: '13:00', title: '피로연', description: '축하해 주신 분들과 함께하는 식사' },
  ],
  firstBirthday: [
    { time: '11:30', title: '손님 맞이', description: '반가운 가족과 친구를 맞이해요.' },
    { time: '12:00', title: '돌잡이', description: '아기의 첫 생일을 축하해 주세요.' },
    { time: '12:30', title: '식사', description: '함께 맛있는 식사를 즐겨요.' },
  ],
  seminar: [
    { time: '09:30', title: '등록 및 안내', description: '참가 확인과 자료 배부' },
    { time: '10:00', title: '첫 번째 세션', description: '주요 발표' },
    { time: '11:00', title: '질의응답', description: '참석자와 이야기 나누기' },
  ],
};

const EMPTY_ITEM = { time: '', title: '', description: '' };

export function createTimelineItem(
  value: Partial<Omit<TimelineItem, 'id'>> = {}
): TimelineItem {
  return { id: crypto.randomUUID(), ...EMPTY_ITEM, ...value };
}

export function getTimelinePreset(type: InvitationType): TimelineItem[] {
  return (PRESETS[type] ?? [
    { time: '10:00', title: '행사 시작', description: '' },
    { time: '11:00', title: '행사 마무리', description: '' },
  ]).map(createTimelineItem);
}

export function normalizeTimelineItems(value: unknown): TimelineItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null
    )
    .slice(0, 20)
    .map((item, index) => ({
      id: typeof item.id === 'string' && item.id.length > 0 ? item.id : String(index),
      time: typeof item.time === 'string' ? item.time.slice(0, 24) : '',
      title: typeof item.title === 'string' ? item.title.slice(0, 60) : '',
      description: typeof item.description === 'string' ? item.description.slice(0, 200) : '',
    }));
}
