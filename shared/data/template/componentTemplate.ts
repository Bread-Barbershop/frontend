export const galleryTemplate = [
  'galleryType1',
  'galleryType2',
  'galleryType3',
  'galleryType4',
  'galleryType5',
  'galleryType6',
  'galleryType7',
];

export const calendarCardNames = {
  calendarType6: '영문 서명 월력',
  calendarType7: '한지 책력',
  calendarType8: '주간 티켓',
  calendarType9: '큰글씨 월력',
} as const;

export type CalendarCardType = keyof typeof calendarCardNames;

export function isCalendarCardType(type?: string): type is CalendarCardType {
  return !!type && Object.hasOwn(calendarCardNames, type);
}

export const calendarTemplate = [
  'calendarType1',
  'calendarType2',
  'calendarType3',
  'calendarType4',
  'calendarType5',
  ...Object.keys(calendarCardNames),
];

export const shareUrlTemplate: string[] = [];
