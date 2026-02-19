import { BlockType } from '@/widgets/editor/types/editor';

export type SampleDataType = {
  english: 'wedding' | 'firstBirthday' | 'birthday' | 'conference' | 'etc';
  korea: string;
  list: ListType[];
};

export type ListType = {
  contents: string;
  component: BlockType | null;
  isType: boolean;
};

export const weddingComponents: ListType[] = [
  { contents: '인사말', component: null, isType: false },
  { contents: '신랑신부소개', component: 'introduce', isType: false },
  { contents: '가족소개', component: null, isType: false },
  { contents: '예식일시', component: 'weddingDay', isType: false },
  { contents: '예식장소', component: null, isType: false },
  { contents: '교통수단', component: null, isType: false },
  { contents: '갤러리', component: 'gallery', isType: true },
  { contents: '연락처', component: null, isType: false },
  { contents: '계좌번호', component: null, isType: false },
  { contents: '방명록', component: null, isType: false },
  { contents: '인터뷰', component: null, isType: false },
  { contents: '모청스냅', component: null, isType: false },
  { contents: '공지사항', component: null, isType: false },
  { contents: '동영상', component: null, isType: false },
  { contents: '사진', component: null, isType: false },
  { contents: '세례명', component: null, isType: false },
  { contents: 'URL공유 썸네일', component: null, isType: false },
  { contents: '카카오초대장 썸네일', component: null, isType: false },
];
export const firstBirthdayComponents: ListType[] = [
  { contents: '인사말', component: null, isType: false },
  { contents: '아기소개', component: null, isType: false },
  { contents: '가족소개', component: null, isType: false },
  { contents: '행사일시', component: null, isType: false },
  { contents: '행사장소', component: null, isType: false },
  { contents: '갤러리', component: 'gallery', isType: true },
  { contents: '연락처', component: null, isType: false },
  { contents: '계좌번호', component: null, isType: false },
  { contents: '배경음악', component: null, isType: false },
  { contents: '모청스냅', component: null, isType: false },
  { contents: '이벤트', component: null, isType: false },
  { contents: '방명록', component: null, isType: false },
  { contents: '공지사항', component: null, isType: false },
  { contents: '동영상', component: null, isType: false },
  { contents: '사진', component: null, isType: false },
  { contents: 'URL공유 썸네일', component: null, isType: false },
  { contents: '카카오초대장 썸네일', component: null, isType: false },
];
export const birthdayComponents: ListType[] = [
  { contents: '인사말', component: null, isType: false },
  { contents: '행사일시', component: null, isType: false },
  { contents: '행사장소', component: null, isType: false },
  { contents: '연락처', component: null, isType: false },
  { contents: '배경음악', component: null, isType: false },
  { contents: '모청스냅', component: null, isType: false },
  { contents: '방명록', component: null, isType: false },
  { contents: '공지사항', component: null, isType: false },
  { contents: '동영상', component: null, isType: false },
  { contents: '사진', component: null, isType: false },
  { contents: 'URL공유 썸네일', component: null, isType: false },
  { contents: '카카오초대장 썸네일', component: null, isType: false },
];
export const conferenceComponents: ListType[] = [
  { contents: '인사말', component: null, isType: false },
  { contents: '주차정보', component: null, isType: false },
  { contents: '후원정보', component: null, isType: false },
  { contents: '연사정보', component: null, isType: false },
  { contents: '행사일시', component: null, isType: false },
  { contents: '행사장소', component: null, isType: false },
  { contents: '계좌번호', component: null, isType: false },
  { contents: '공지사항', component: null, isType: false },
  { contents: '연락처', component: null, isType: false },
  { contents: '동영상', component: null, isType: false },
  { contents: '사진', component: null, isType: false },
  { contents: 'URL공유 썸네일', component: null, isType: false },
  { contents: '카카오초대장 썸네일', component: null, isType: false },
];
export const etcComponents: ListType[] = [
  { contents: '인사말', component: null, isType: false },
  { contents: '행사일시', component: null, isType: false },
  { contents: '행사장소', component: null, isType: false },
  { contents: '공지사항', component: null, isType: false },
  { contents: '연락처', component: null, isType: false },
  { contents: '동영상', component: null, isType: false },
  { contents: '사진', component: null, isType: false },
  { contents: 'URL공유 썸네일', component: null, isType: false },
  { contents: '카카오초대장 썸네일', component: null, isType: false },
];
// export const eventComponents: ListType[] = [
//   { contents: '인사말' },
//   { contents: '주차 정보' },
//   { contents: '후원 정보' },
//   { contents: '연사 정보' },
//   { contents: '행사 일시' },
//   { contents: '행사 장소' },
//   { contents: '계좌 번호' },
//   { contents: '공지 사항' },
//   { contents: '연락처' },
//   { contents: '동영상' },
//   { contents: '사진' },
//   { contents: 'URL 공유 썸네일' },
//   { contents: '카카오 초대장 썸네일' },
// ];

export const componentCls: SampleDataType[] = [
  {
    english: 'wedding',
    korea: '결혼식',
    list: weddingComponents,
  },
  {
    english: 'firstBirthday',
    korea: '돌잔치',
    list: firstBirthdayComponents,
  },
  {
    english: 'birthday',
    korea: '생일',
    list: birthdayComponents,
  },
  // {
  //   english: 'event',
  //   korea: '이벤트',
  //   list: [
  //     { contents: '인사말' },
  //     { contents: '주차 정보' },
  //     { contents: '후원 정보' },
  //     { contents: '연사 정보' },
  //     { contents: '행사 일시' },
  //     { contents: '행사 장소' },
  //     { contents: '계좌 번호' },
  //     { contents: '공지 사항' },
  //     { contents: '연락처' },
  //     { contents: '동영상' },
  //     { contents: '사진' },
  //     { contents: 'URL 공유 썸네일' },
  //     { contents: '카카오 초대장 썸네일' },
  //   ],
  // },
  {
    english: 'conference',
    korea: '컨퍼런스',
    list: conferenceComponents,
  },
  {
    english: 'etc',
    korea: '기타',
    list: etcComponents,
  },
];
